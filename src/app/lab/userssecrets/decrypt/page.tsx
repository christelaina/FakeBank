// src/app/lab/userssecrets/decrypt/page.tsx
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/data-display/PageHeader";
import { CryptoCheckForm } from "@/features/lab/components/CryptoCheckForm";
import { isLabEnabled } from "@/lib/lab/config";

export const dynamic = "force-dynamic";

export default function DecryptPasswordPage() {
  if (!isLabEnabled()) notFound();

  return (
    <div>
      <PageHeader
        title="Decrypt a password"
        description="Decrypt a stored password with the key and IV, then check it here."
      />
      <CryptoCheckForm />
    </div>
  );
}
