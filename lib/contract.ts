import { Client as EscrowClient, networks } from "@/lib/generated/escrow-client";
import { signXdr } from "@/lib/wallet";

const CONTRACT_ID = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID ?? networks.testnet.contractId;
const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";

function client(sourceAddress: string) {
  return new EscrowClient({
    contractId: CONTRACT_ID,
    networkPassphrase: networks.testnet.networkPassphrase,
    rpcUrl: RPC_URL,
    publicKey: sourceAddress,
    signTransaction: async (xdr: string) => ({ signedTxXdr: await signXdr(xdr, sourceAddress) }),
  });
}

/**
 * Thin wrapper around the deployed Soroban escrow contract
 * (contract/src/lib.rs, deployed at CONTRACT_ID above). Each call simulates,
 * signs via Freighter, and submits — see generated bindings in
 * lib/generated/escrow-client.ts.
 */
export const escrowContract = {
  async createJob(
    source: string,
    args: {
      client: string;
      freelancer: string;
      token: string;
      milestone_titles: string[];
      milestone_amounts: bigint[];
    }
  ) {
    const tx = await client(source).create_job(args);
    const sent = await tx.signAndSend();
    return sent.result;
  },

  async fundMilestone(source: string, jobId: bigint, milestoneIndex: number) {
    const tx = await client(source).fund_milestone({ job_id: jobId, milestone_index: milestoneIndex });
    const sent = await tx.signAndSend();
    return sent.result;
  },

  async markDelivered(source: string, jobId: bigint, milestoneIndex: number, proofHash: Buffer) {
    const tx = await client(source).mark_delivered({
      job_id: jobId,
      milestone_index: milestoneIndex,
      proof_hash: proofHash,
    });
    const sent = await tx.signAndSend();
    return sent.result;
  },

  async approveMilestone(source: string, jobId: bigint, milestoneIndex: number) {
    const tx = await client(source).approve_milestone({ job_id: jobId, milestone_index: milestoneIndex });
    const sent = await tx.signAndSend();
    return sent.result;
  },

  async disputeMilestone(source: string, jobId: bigint, milestoneIndex: number) {
    const tx = await client(source).dispute_milestone({ job_id: jobId, milestone_index: milestoneIndex });
    const sent = await tx.signAndSend();
    return sent.result;
  },

  async claimTimeoutRelease(source: string, jobId: bigint, milestoneIndex: number) {
    const tx = await client(source).claim_timeout_release({
      job_id: jobId,
      milestone_index: milestoneIndex,
    });
    const sent = await tx.signAndSend();
    return sent.result;
  },

  async getJob(source: string, jobId: bigint) {
    const tx = await client(source).get_job({ job_id: jobId });
    return tx.result;
  },
};
