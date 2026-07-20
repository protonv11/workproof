import type { Job, ProofEvent } from "@/lib/types";

export const mockJobs: Job[] = [
  {
    id: "job-1",
    title: "Landing page redesign",
    description: "Redesign the marketing site with a new glassmorphic visual system.",
    client: "GBCLIENT...WXYZ",
    freelancer: "GBFREELANCE...ABCD",
    createdAt: "2026-07-10T10:00:00Z",
    milestones: [
      {
        id: "m-1-1",
        jobId: "job-1",
        index: 0,
        title: "Wireframes",
        description: "Deliver low-fi wireframes for hero, pricing, footer.",
        amount: 400,
        status: "approved",
        proofUrl: "https://figma.com/file/example",
        deliveredAt: "2026-07-12T14:00:00Z",
      },
      {
        id: "m-1-2",
        jobId: "job-1",
        index: 1,
        title: "Hi-fi design",
        description: "Full visual design in Figma with component library.",
        amount: 800,
        status: "delivered",
        proofUrl: "https://figma.com/file/example-hifi",
        deliveredAt: "2026-07-18T09:00:00Z",
        deadline: "2026-07-22T09:00:00Z",
      },
      {
        id: "m-1-3",
        jobId: "job-1",
        index: 2,
        title: "Frontend build",
        description: "Implement in Next.js + Tailwind, responsive pass.",
        amount: 1200,
        status: "pending",
      },
    ],
  },
  {
    id: "job-2",
    title: "Smart contract audit",
    description: "Security review of Soroban escrow contract before mainnet.",
    client: "GBCLIENT2...WXYZ",
    freelancer: "GBFREELANCE2...ABCD",
    createdAt: "2026-07-05T10:00:00Z",
    milestones: [
      {
        id: "m-2-1",
        jobId: "job-2",
        index: 0,
        title: "Initial review",
        description: "Static analysis + manual review report.",
        amount: 1500,
        status: "disputed",
        proofUrl: "https://example.com/report.pdf",
        deliveredAt: "2026-07-15T09:00:00Z",
      },
    ],
  },
];

export const mockProofEvents: ProofEvent[] = [
  { id: "e1", jobId: "job-1", milestoneIndex: 0, type: "funded", createdAt: "2026-07-10T10:05:00Z" },
  { id: "e2", jobId: "job-1", milestoneIndex: 0, type: "delivered", createdAt: "2026-07-12T14:00:00Z" },
  { id: "e3", jobId: "job-1", milestoneIndex: 0, type: "approved", createdAt: "2026-07-13T08:00:00Z" },
  { id: "e4", jobId: "job-1", milestoneIndex: 1, type: "funded", createdAt: "2026-07-13T09:00:00Z" },
  { id: "e5", jobId: "job-1", milestoneIndex: 1, type: "delivered", createdAt: "2026-07-18T09:00:00Z" },
  { id: "e6", jobId: "job-2", milestoneIndex: 0, type: "funded", createdAt: "2026-07-05T10:05:00Z" },
  { id: "e7", jobId: "job-2", milestoneIndex: 0, type: "delivered", createdAt: "2026-07-15T09:00:00Z" },
  { id: "e8", jobId: "job-2", milestoneIndex: 0, type: "disputed", createdAt: "2026-07-16T09:00:00Z" },
];
