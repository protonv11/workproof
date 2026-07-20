#![cfg(test)]

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::Env;

fn setup(env: &Env) -> (Address, Address, Address, EscrowContractClient) {
    let contract_id = env.register_contract(None, EscrowContract);
    let client = Address::generate(env);
    let freelancer = Address::generate(env);
    let token_admin = Address::generate(env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_asset_client = token::StellarAssetClient::new(env, &token_contract.address());
    token_asset_client.mint(&client, &10_000);

    (
        client,
        freelancer,
        token_contract.address(),
        EscrowContractClient::new(env, &contract_id),
    )
}

#[test]
fn full_happy_path() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, freelancer, token, escrow) = setup(&env);

    let titles = Vec::from_array(&env, [String::from_str(&env, "Design")]);
    let amounts = Vec::from_array(&env, [500i128]);

    let job_id = escrow.create_job(&client, &freelancer, &token, &titles, &amounts);

    escrow.fund_milestone(&job_id, &0);
    let job = escrow.get_job(&job_id);
    assert_eq!(job.milestones.get(0).unwrap().status, MilestoneStatus::Funded);

    escrow.mark_delivered(&job_id, &0, &Bytes::from_array(&env, &[1, 2, 3]));
    let job = escrow.get_job(&job_id);
    assert_eq!(job.milestones.get(0).unwrap().status, MilestoneStatus::Delivered);

    escrow.approve_milestone(&job_id, &0);
    let job = escrow.get_job(&job_id);
    assert_eq!(job.milestones.get(0).unwrap().status, MilestoneStatus::Approved);

    let token_client = token::Client::new(&env, &token);
    assert_eq!(token_client.balance(&freelancer), 500);
}

#[test]
fn timeout_release_after_deadline() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, freelancer, token, escrow) = setup(&env);
    let titles = Vec::from_array(&env, [String::from_str(&env, "Build")]);
    let amounts = Vec::from_array(&env, [200i128]);
    let job_id = escrow.create_job(&client, &freelancer, &token, &titles, &amounts);

    escrow.fund_milestone(&job_id, &0);
    escrow.mark_delivered(&job_id, &0, &Bytes::from_array(&env, &[9]));

    env.ledger().with_mut(|l| l.timestamp += DEFAULT_TIMEOUT_SECS + 1);

    escrow.claim_timeout_release(&job_id, &0);
    let job = escrow.get_job(&job_id);
    assert_eq!(job.milestones.get(0).unwrap().status, MilestoneStatus::Approved);
}

#[test]
fn dispute_locks_funds() {
    let env = Env::default();
    env.mock_all_auths();

    let (client, freelancer, token, escrow) = setup(&env);
    let titles = Vec::from_array(&env, [String::from_str(&env, "Audit")]);
    let amounts = Vec::from_array(&env, [300i128]);
    let job_id = escrow.create_job(&client, &freelancer, &token, &titles, &amounts);

    escrow.fund_milestone(&job_id, &0);
    escrow.mark_delivered(&job_id, &0, &Bytes::from_array(&env, &[7]));
    escrow.dispute_milestone(&job_id, &0);

    let job = escrow.get_job(&job_id);
    assert_eq!(job.milestones.get(0).unwrap().status, MilestoneStatus::Disputed);

    let token_client = token::Client::new(&env, &token);
    assert_eq!(token_client.balance(&freelancer), 0);
}
