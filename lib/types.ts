export type MilestoneOnChainStatus =
  | "pending"
  | "funded"
  | "delivered"
  | "approved"
  | "disputed";

export type Milestone = {
  id: string;
  jobId: string;
  index: number;
  title: string;
  description: string;
  amount: number;
  status: MilestoneOnChainStatus;
  proofUrl?: string;
  proofHash?: string;
  deliveredAt?: string;
  deadline?: string;
};

export type Job = {
  id: string;
  onChainJobId?: string;
  title: string;
  description: string;
  client: string;
  freelancer: string;
  createdAt: string;
  milestones: Milestone[];
};

export type ProofEvent = {
  id: string;
  jobId: string;
  milestoneIndex: number;
  type: "funded" | "delivered" | "approved" | "disputed" | "timeout_released";
  message?: string;
  createdAt: string;
};
