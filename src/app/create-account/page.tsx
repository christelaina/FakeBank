"use client";

import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useRouter } from "next/navigation";

export default function CreateAccountPage() {
  const router = useRouter();
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm rounded-lg border border-surface-border bg-white p-6 shadow-panel">
        <RegisterForm onBackToSignIn={() => router.push("/sign-in")} />
      </div>
    </main>
  );
}
