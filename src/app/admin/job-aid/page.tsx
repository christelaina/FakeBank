import { notFound } from "next/navigation";
import { JobAidView } from "@/features/admin/components/JobAidView";
import { isLabEnabled } from "@/lib/lab/config";

export const dynamic = "force-dynamic";

export default function AdminJobAidPage() {
  if (!isLabEnabled()) notFound();
  return <JobAidView />;
}
