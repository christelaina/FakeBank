// src/app/admin/leaderboard/page.tsx
import { notFound } from "next/navigation";
import { LeaderboardView } from "@/features/admin/components/LeaderboardView";
import { isLabEnabled } from "@/lib/lab/config";

export const dynamic = "force-dynamic";

export default function AdminLeaderboardPage() {
  if (!isLabEnabled()) notFound();
  return <LeaderboardView />;
}
