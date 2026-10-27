// Shared lab types for progress and leaderboard responses. No secrets or victim data.
export type LabChallengeProgress = {
  id: string;
  title: string;
  description: string;
  points: number;
  solved: boolean;
  solvedAt: string | null;
};

export type LabProgress = {
  totalPoints: number;
  hintCost: number;
  solvedCount: number;
  challenges: LabChallengeProgress[];
};

export type LabLeaderboardRow = {
  rank: number;
  displayName: string;
  points: number;
  solvedCount: number;
};

export type LabMe = {
  enabled: boolean;
  role: "student" | "admin" | null;
};
