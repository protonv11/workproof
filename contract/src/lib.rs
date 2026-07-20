#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Bytes, Env, String, Vec,
};

/// Freelancer can claim auto-release this many ledger-seconds after delivery
/// if the client hasn't approved or disputed.
const DEFAULT_TIMEOUT_SECS: u64 = 7 * 24 * 60 * 60; // 7 days

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    Pending,
    Funded,
    Delivered,
    Approved,
    Disputed,
}

#[contracttype]
#[derive(Clone)]
pub struct Milestone {
    pub title: String,
    pub amount: i128,
    pub status: MilestoneStatus,
    pub proof_hash: Bytes,
    pub delivered_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct Job {
    pub client: Address,
    pub freelancer: Address,
    pub token: Address,
    pub milestones: Vec<Milestone>,
}

#[contracttype]
pub enum DataKey {
    Job(u64),
    NextJobId,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    JobNotFound = 1,
    MilestoneNotFound = 2,
    InvalidStatus = 3,
    Unauthorized = 4,
    TimeoutNotReached = 5,
    NoMilestones = 6,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Client creates a job with N milestones (title + amount). Funds are
    /// deposited per-milestone via `fund_milestone`, not here.
    pub fn create_job(
        env: Env,
        client: Address,
        freelancer: Address,
        token: Address,
        milestone_titles: Vec<String>,
        milestone_amounts: Vec<i128>,
    ) -> Result<u64, Error> {
        client.require_auth();

        if milestone_titles.is_empty() || milestone_titles.len() != milestone_amounts.len() {
            return Err(Error::NoMilestones);
        }

        let mut milestones: Vec<Milestone> = Vec::new(&env);
        for i in 0..milestone_titles.len() {
            milestones.push_back(Milestone {
                title: milestone_titles.get(i).unwrap(),
                amount: milestone_amounts.get(i).unwrap(),
                status: MilestoneStatus::Pending,
                proof_hash: Bytes::new(&env),
                delivered_at: 0,
            });
        }

        let job_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextJobId)
            .unwrap_or(0u64);
        env.storage()
            .instance()
            .set(&DataKey::NextJobId, &(job_id + 1));

        let job = Job {
            client,
            freelancer,
            token,
            milestones,
        };
        env.storage().persistent().set(&DataKey::Job(job_id), &job);

        Ok(job_id)
    }

    /// Client deposits the milestone amount into the contract's escrow.
    pub fn fund_milestone(env: Env, job_id: u64, milestone_index: u32) -> Result<(), Error> {
        let mut job = Self::load_job(&env, job_id)?;
        job.client.require_auth();

        let milestone = Self::milestone_at(&job, milestone_index)?;
        if milestone.status != MilestoneStatus::Pending {
            return Err(Error::InvalidStatus);
        }

        let token_client = token::Client::new(&env, &job.token);
        token_client.transfer(&job.client, &env.current_contract_address(), &milestone.amount);

        Self::update_status(&mut job, milestone_index, MilestoneStatus::Funded)?;
        env.storage().persistent().set(&DataKey::Job(job_id), &job);
        Ok(())
    }

    /// Freelancer submits proof of work for a funded milestone.
    pub fn mark_delivered(
        env: Env,
        job_id: u64,
        milestone_index: u32,
        proof_hash: Bytes,
    ) -> Result<(), Error> {
        let mut job = Self::load_job(&env, job_id)?;
        job.freelancer.require_auth();

        let milestone = Self::milestone_at(&job, milestone_index)?;
        if milestone.status != MilestoneStatus::Funded {
            return Err(Error::InvalidStatus);
        }

        let now = env.ledger().timestamp();
        let mut updated = milestone.clone();
        updated.status = MilestoneStatus::Delivered;
        updated.proof_hash = proof_hash;
        updated.delivered_at = now;
        job.milestones.set(milestone_index, updated);

        env.storage().persistent().set(&DataKey::Job(job_id), &job);
        Ok(())
    }

    /// Client approves delivered work; contract releases escrowed funds to freelancer.
    pub fn approve_milestone(env: Env, job_id: u64, milestone_index: u32) -> Result<(), Error> {
        let mut job = Self::load_job(&env, job_id)?;
        job.client.require_auth();

        let milestone = Self::milestone_at(&job, milestone_index)?;
        if milestone.status != MilestoneStatus::Delivered {
            return Err(Error::InvalidStatus);
        }

        let token_client = token::Client::new(&env, &job.token);
        token_client.transfer(
            &env.current_contract_address(),
            &job.freelancer,
            &milestone.amount,
        );

        Self::update_status(&mut job, milestone_index, MilestoneStatus::Approved)?;
        env.storage().persistent().set(&DataKey::Job(job_id), &job);
        Ok(())
    }

    /// Client disputes delivered work; funds stay locked pending off-chain arbitration.
    pub fn dispute_milestone(env: Env, job_id: u64, milestone_index: u32) -> Result<(), Error> {
        let mut job = Self::load_job(&env, job_id)?;
        job.client.require_auth();

        let milestone = Self::milestone_at(&job, milestone_index)?;
        if milestone.status != MilestoneStatus::Delivered {
            return Err(Error::InvalidStatus);
        }

        Self::update_status(&mut job, milestone_index, MilestoneStatus::Disputed)?;
        env.storage().persistent().set(&DataKey::Job(job_id), &job);
        Ok(())
    }

    /// Freelancer claims automatic release if the client hasn't responded
    /// within DEFAULT_TIMEOUT_SECS of delivery.
    pub fn claim_timeout_release(env: Env, job_id: u64, milestone_index: u32) -> Result<(), Error> {
        let mut job = Self::load_job(&env, job_id)?;
        job.freelancer.require_auth();

        let milestone = Self::milestone_at(&job, milestone_index)?;
        if milestone.status != MilestoneStatus::Delivered {
            return Err(Error::InvalidStatus);
        }

        let now = env.ledger().timestamp();
        if now < milestone.delivered_at + DEFAULT_TIMEOUT_SECS {
            return Err(Error::TimeoutNotReached);
        }

        let token_client = token::Client::new(&env, &job.token);
        token_client.transfer(
            &env.current_contract_address(),
            &job.freelancer,
            &milestone.amount,
        );

        Self::update_status(&mut job, milestone_index, MilestoneStatus::Approved)?;
        env.storage().persistent().set(&DataKey::Job(job_id), &job);
        Ok(())
    }

    /// Read-only job state query.
    pub fn get_job(env: Env, job_id: u64) -> Result<Job, Error> {
        Self::load_job(&env, job_id)
    }

    fn load_job(env: &Env, job_id: u64) -> Result<Job, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Job(job_id))
            .ok_or(Error::JobNotFound)
    }

    fn milestone_at(job: &Job, index: u32) -> Result<Milestone, Error> {
        job.milestones.get(index).ok_or(Error::MilestoneNotFound)
    }

    fn update_status(job: &mut Job, index: u32, status: MilestoneStatus) -> Result<(), Error> {
        let mut milestone = job.milestones.get(index).ok_or(Error::MilestoneNotFound)?;
        milestone.status = status;
        job.milestones.set(index, milestone);
        Ok(())
    }
}

mod test;
