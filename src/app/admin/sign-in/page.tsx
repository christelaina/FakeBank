// src/app/admin/sign-in/page.tsx
import { notFound } from "next/navigation";
import { AdminSignInForm } from "@/features/admin/components/AdminSignInForm";
import { isLabEnabled } from "@/lib/lab/config";

export const dynamic = "force-dynamic";

export default function AdminSignInPage() {
  if (!isLabEnabled()) notFound();
  return <AdminSignInForm />;
}
