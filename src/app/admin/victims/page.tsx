import { notFound } from "next/navigation";
import { VictimAccountsView } from "@/features/admin/components/VictimAccountsView";
import { isLabEnabled } from "@/lib/lab/config";

export const dynamic = "force-dynamic";

export default function AdminVictimsPage() {
  if (!isLabEnabled()) notFound();
  return <VictimAccountsView />;
}
