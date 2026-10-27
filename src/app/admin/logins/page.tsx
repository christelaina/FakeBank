// src/app/admin/logins/page.tsx
import { notFound } from "next/navigation";
import { LoginsView } from "@/features/admin/components/LoginsView";
import { isLabEnabled } from "@/lib/lab/config";

export const dynamic = "force-dynamic";

export default function AdminLoginsPage() {
  if (!isLabEnabled()) notFound();
  return <LoginsView />;
}
