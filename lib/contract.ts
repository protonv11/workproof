import * as Sentry from "@sentry/nextjs";
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
 * Wraps a Soroban call with an RPC-level breadcrumb so failures (simulation,
 * signing, submission, timeout) are traceable in Sentry even before the
 * caller adds its own job/milestone context tags.
 */
async function withBreadcrumb<T>(method: string, run: () => Promise<T>): Promise<T> {
  Sentry.addBreadcrumb({ category: "soroban_rpc", message: method, level: "info" });
  try {
    return await run();
  } catch (e) {
    Sentry.addBreadcrumb({ category: "soroban_rpc", message: `${method} failed`, level: "error" });
    throw e;
  }
}

/**
 * Thin wrapper around the deployed Soroban escrow contract
 * (contract/src/lib.rs, deployed at CONTRACT_ID above). Each call simulates,
 * signs via Freighter, and submits — see generated bindings in
 * lib/generated/escrow-client.ts.
 */
export const escrowContract = {
  createJob(
    source: string,
    args: {
      client: string;
      freelancer: string;
      token: string;
      milestone_titles: string[];
      milestone_amounts: bigint[];
    }
  ) {
    return withBreadcrumb("create_job", async () => {
      const tx = await client(source).create_job(args);
      const sent = await tx.signAndSend();
      return sent.result.unwrap();
    });
  },

  fundMilestone(source: string, jobId: bigint, milestoneIndex: number) {
    return withBreadcrumb("fund_milestone", async () => {
      const tx = await client(source).fund_milestone({ job_id: jobId, milestone_index: milestoneIndex });
      const sent = await tx.signAndSend();
      return sent.result;
    });
  },

  markDelivered(source: string, jobId: bigint, milestoneIndex: number, proofHash: Buffer) {
    return withBreadcrumb("mark_delivered", async () => {
      const tx = await client(source).mark_delivered({
        job_id: jobId,
        milestone_index: milestoneIndex,
        proof_hash: proofHash,
      });
      const sent = await tx.signAndSend();
      return sent.result;
    });
  },

  approveMilestone(source: string, jobId: bigint, milestoneIndex: number) {
    return withBreadcrumb("approve_milestone", async () => {
      const tx = await client(source).approve_milestone({ job_id: jobId, milestone_index: milestoneIndex });
      const sent = await tx.signAndSend();
      return sent.result;
    });
  },

  disputeMilestone(source: string, jobId: bigint, milestoneIndex: number) {
    return withBreadcrumb("dispute_milestone", async () => {
      const tx = await client(source).dispute_milestone({ job_id: jobId, milestone_index: milestoneIndex });
      const sent = await tx.signAndSend();
      return sent.result;
    });
  },

  claimTimeoutRelease(source: string, jobId: bigint, milestoneIndex: number) {
    return withBreadcrumb("claim_timeout_release", async () => {
      const tx = await client(source).claim_timeout_release({
        job_id: jobId,
        milestone_index: milestoneIndex,
      });
      const sent = await tx.signAndSend();
      return sent.result;
    });
  },

  getJob(source: string, jobId: bigint) {
    return withBreadcrumb("get_job", async () => {
      const tx = await client(source).get_job({ job_id: jobId });
      return tx.result;
    });
  },
};
