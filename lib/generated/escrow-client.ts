import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDKDKYTQOV2HJ4HFAVLCYH4Y37PQGPY576UVYYEPEHSSCTNEAYJVSSKX",
  }
} as const


export interface Job {
  client: string;
  freelancer: string;
  milestones: Array<Milestone>;
  token: string;
}

export const Errors = {
  1: {message:"JobNotFound"},
  2: {message:"MilestoneNotFound"},
  3: {message:"InvalidStatus"},
  4: {message:"Unauthorized"},
  5: {message:"TimeoutNotReached"},
  6: {message:"NoMilestones"}
}

export type DataKey = {tag: "Job", values: readonly [u64]} | {tag: "NextJobId", values: void};


export interface Milestone {
  amount: i128;
  delivered_at: u64;
  proof_hash: Buffer;
  status: MilestoneStatus;
  title: string;
}

export type MilestoneStatus = {tag: "Pending", values: void} | {tag: "Funded", values: void} | {tag: "Delivered", values: void} | {tag: "Approved", values: void} | {tag: "Disputed", values: void};

export interface Client {
  /**
   * Construct and simulate a get_job transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Read-only job state query.
   */
  get_job: ({job_id}: {job_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Job>>>

  /**
   * Construct and simulate a create_job transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Client creates a job with N milestones (title + amount). Funds are
   * deposited per-milestone via `fund_milestone`, not here.
   */
  create_job: ({client, freelancer, token, milestone_titles, milestone_amounts}: {client: string, freelancer: string, token: string, milestone_titles: Array<string>, milestone_amounts: Array<i128>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a fund_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Client deposits the milestone amount into the contract's escrow.
   */
  fund_milestone: ({job_id, milestone_index}: {job_id: u64, milestone_index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a mark_delivered transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Freelancer submits proof of work for a funded milestone.
   */
  mark_delivered: ({job_id, milestone_index, proof_hash}: {job_id: u64, milestone_index: u32, proof_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a approve_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Client approves delivered work; contract releases escrowed funds to freelancer.
   */
  approve_milestone: ({job_id, milestone_index}: {job_id: u64, milestone_index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a dispute_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Client disputes delivered work; funds stay locked pending off-chain arbitration.
   */
  dispute_milestone: ({job_id, milestone_index}: {job_id: u64, milestone_index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a claim_timeout_release transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Freelancer claims automatic release if the client hasn't responded
   * within DEFAULT_TIMEOUT_SECS of delivery.
   */
  claim_timeout_release: ({job_id, milestone_index}: {job_id: u64, milestone_index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAA0pvYgAAAAAEAAAAAAAAAAZjbGllbnQAAAAAABMAAAAAAAAACmZyZWVsYW5jZXIAAAAAABMAAAAAAAAACm1pbGVzdG9uZXMAAAAAA+oAAAfQAAAACU1pbGVzdG9uZQAAAAAAAAAAAAAFdG9rZW4AAAAAAAAT",
        "AAAAAAAAABpSZWFkLW9ubHkgam9iIHN0YXRlIHF1ZXJ5LgAAAAAAB2dldF9qb2IAAAAAAQAAAAAAAAAGam9iX2lkAAAAAAAGAAAAAQAAA+kAAAfQAAAAA0pvYgAAAAAD",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABgAAAAAAAAALSm9iTm90Rm91bmQAAAAAAQAAAAAAAAARTWlsZXN0b25lTm90Rm91bmQAAAAAAAACAAAAAAAAAA1JbnZhbGlkU3RhdHVzAAAAAAAAAwAAAAAAAAAMVW5hdXRob3JpemVkAAAABAAAAAAAAAARVGltZW91dE5vdFJlYWNoZWQAAAAAAAAFAAAAAAAAAAxOb01pbGVzdG9uZXMAAAAG",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAgAAAAEAAAAAAAAAA0pvYgAAAAABAAAABgAAAAAAAAAAAAAACU5leHRKb2JJZAAAAA==",
        "AAAAAAAAAHpDbGllbnQgY3JlYXRlcyBhIGpvYiB3aXRoIE4gbWlsZXN0b25lcyAodGl0bGUgKyBhbW91bnQpLiBGdW5kcyBhcmUKZGVwb3NpdGVkIHBlci1taWxlc3RvbmUgdmlhIGBmdW5kX21pbGVzdG9uZWAsIG5vdCBoZXJlLgAAAAAACmNyZWF0ZV9qb2IAAAAAAAUAAAAAAAAABmNsaWVudAAAAAAAEwAAAAAAAAAKZnJlZWxhbmNlcgAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAABBtaWxlc3RvbmVfdGl0bGVzAAAD6gAAABAAAAAAAAAAEW1pbGVzdG9uZV9hbW91bnRzAAAAAAAD6gAAAAsAAAABAAAD6QAAAAYAAAAD",
        "AAAAAQAAAAAAAAAAAAAACU1pbGVzdG9uZQAAAAAAAAUAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAMZGVsaXZlcmVkX2F0AAAABgAAAAAAAAAKcHJvb2ZfaGFzaAAAAAAADgAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAD01pbGVzdG9uZVN0YXR1cwAAAAAAAAAABXRpdGxlAAAAAAAAEA==",
        "AAAAAAAAAEBDbGllbnQgZGVwb3NpdHMgdGhlIG1pbGVzdG9uZSBhbW91bnQgaW50byB0aGUgY29udHJhY3QncyBlc2Nyb3cuAAAADmZ1bmRfbWlsZXN0b25lAAAAAAACAAAAAAAAAAZqb2JfaWQAAAAAAAYAAAAAAAAAD21pbGVzdG9uZV9pbmRleAAAAAAEAAAAAQAAA+kAAAPtAAAAAAAAAAM=",
        "AAAAAAAAADhGcmVlbGFuY2VyIHN1Ym1pdHMgcHJvb2Ygb2Ygd29yayBmb3IgYSBmdW5kZWQgbWlsZXN0b25lLgAAAA5tYXJrX2RlbGl2ZXJlZAAAAAAAAwAAAAAAAAAGam9iX2lkAAAAAAAGAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAAAAAAKcHJvb2ZfaGFzaAAAAAAADgAAAAEAAAPpAAAD7QAAAAAAAAAD",
        "AAAAAAAAAE9DbGllbnQgYXBwcm92ZXMgZGVsaXZlcmVkIHdvcms7IGNvbnRyYWN0IHJlbGVhc2VzIGVzY3Jvd2VkIGZ1bmRzIHRvIGZyZWVsYW5jZXIuAAAAABFhcHByb3ZlX21pbGVzdG9uZQAAAAAAAAIAAAAAAAAABmpvYl9pZAAAAAAABgAAAAAAAAAPbWlsZXN0b25lX2luZGV4AAAAAAQAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAAAAAFBDbGllbnQgZGlzcHV0ZXMgZGVsaXZlcmVkIHdvcms7IGZ1bmRzIHN0YXkgbG9ja2VkIHBlbmRpbmcgb2ZmLWNoYWluIGFyYml0cmF0aW9uLgAAABFkaXNwdXRlX21pbGVzdG9uZQAAAAAAAAIAAAAAAAAABmpvYl9pZAAAAAAABgAAAAAAAAAPbWlsZXN0b25lX2luZGV4AAAAAAQAAAABAAAD6QAAA+0AAAAAAAAAAw==",
        "AAAAAgAAAAAAAAAAAAAAD01pbGVzdG9uZVN0YXR1cwAAAAAFAAAAAAAAAAAAAAAHUGVuZGluZwAAAAAAAAAAAAAAAAZGdW5kZWQAAAAAAAAAAAAAAAAACURlbGl2ZXJlZAAAAAAAAAAAAAAAAAAACEFwcHJvdmVkAAAAAAAAAAAAAAAIRGlzcHV0ZWQ=",
        "AAAAAAAAAGtGcmVlbGFuY2VyIGNsYWltcyBhdXRvbWF0aWMgcmVsZWFzZSBpZiB0aGUgY2xpZW50IGhhc24ndCByZXNwb25kZWQKd2l0aGluIERFRkFVTFRfVElNRU9VVF9TRUNTIG9mIGRlbGl2ZXJ5LgAAAAAVY2xhaW1fdGltZW91dF9yZWxlYXNlAAAAAAAAAgAAAAAAAAAGam9iX2lkAAAAAAAGAAAAAAAAAA9taWxlc3RvbmVfaW5kZXgAAAAABAAAAAEAAAPpAAAD7QAAAAAAAAAD" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_job: this.txFromJSON<Result<Job>>,
        create_job: this.txFromJSON<Result<u64>>,
        fund_milestone: this.txFromJSON<Result<void>>,
        mark_delivered: this.txFromJSON<Result<void>>,
        approve_milestone: this.txFromJSON<Result<void>>,
        dispute_milestone: this.txFromJSON<Result<void>>,
        claim_timeout_release: this.txFromJSON<Result<void>>
  }
}