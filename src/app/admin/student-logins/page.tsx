// src/app/admin/student-logins/page.tsx
import { notFound } from "next/navigation";
import { StudentLoginsView } from "@/features/admin/components/StudentLoginsView";
import { isLabEnabled } from "@/lib/lab/config";

export const dynamic = "force-dynamic";

export default function AdminStudentLoginsPage() {
  if (!isLabEnabled()) notFound();
  return <StudentLoginsView />;
}
