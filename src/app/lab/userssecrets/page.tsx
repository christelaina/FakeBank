// src/app/lab/userssecrets/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/data-display/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminNoteDialog } from "@/features/lab/components/AdminNoteDialog";
import { LabSecretsNotice } from "@/features/lab/components/LabSecretsNotice";
import { isLabEnabled } from "@/lib/lab/config";
import { CRYPTO_IV, CRYPTO_KEY, CRYPTO_VICTIMS } from "@/lib/lab/crypto-victims";

export const dynamic = "force-dynamic";

const ADMIN_NOTE =
  "Gru here! Nobody can crack my passwords because I invented my own cipher. Definitely not AES, that's far too famous, far, far, far, far, far too famous. Add that to my list of inventions including AI and the Cancer cure. No one's gonna know what key size i used bc they would think of 192 and 256 since they have no imagination. My key and IV are also hidden in a far, far, far away place, which nobody on earth can read, except curious inspectors. Siri! Remind me to rotate them and hide them somewhere else! The minions can't read the passwords either bc i encoded them as an extra layer of security. Minions, do NOT look in the console. Nobody will ever crack it muhahahahhahahaha!!!!!!!!!!!";

export default function LabUserSecretsPage() {
  if (!isLabEnabled()) notFound();

  return (
    <div>
      <LabSecretsNotice iv={CRYPTO_IV} secretKey={CRYPTO_KEY} />
      <PageHeader
        title="Customer secrets"
        description="Passwords stored for the lab customers. Each value is encrypted."
        actions={<AdminNoteDialog note={ADMIN_NOTE} />}
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="text-brand-800">
              <tr>
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Encrypted password</th>
              </tr>
            </thead>
            <tbody>
              {CRYPTO_VICTIMS.map((victim) => (
                <tr key={victim.username} className="border-t border-brand-100">
                  <td className="px-4 py-3 font-mono">{victim.username}</td>
                  <td
                    className="px-4 py-3 font-mono break-all"
                    data-encoding="base64"
                    title="Base64-encoded for safe transport"
                  >
                    {victim.ciphertext}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="mt-4">
        <Link
          href="/lab/userssecrets/decrypt"
          className="inline-flex items-center rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
        >
          Decrypt a password
        </Link>
      </div>
    </div>
  );
}
