import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SafeText } from "@/components/SafeText";
import { formatCad } from "@/lib/formatting/currency";
import type { Account } from "@/types/banking";
import Link from "next/link";

const statusTone = {
  active: "success",
  frozen: "warning",
  closed: "muted",
} as const;

export function AccountCard({ account }: { account: Account }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <SafeText
              as="h3"
              className="font-semibold text-brand-950"
              value={account.nickname || account.name}
            />
            <p className="mt-1 text-sm text-brand-800/70">
              {account.name} · {account.maskedNumber}
            </p>
          </div>
          <Badge tone={statusTone[account.status]}>{account.status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-brand-800/60">Current balance</p>
            <p className="mt-1 font-semibold text-brand-950">
              {formatCad(account.balance)}
            </p>
          </div>
          <div>
            <p className="text-brand-800/60">Available</p>
            <p className="mt-1 font-semibold text-brand-950">
              {formatCad(account.availableBalance)}
            </p>
          </div>
        </div>
        <Link
          href={`/accounts/${account.id}`}
          className="inline-flex text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
