import { Badge } from "@/components/ui/badge";
import { SafeText } from "@/components/SafeText";
import { formatCad, formatCanadianDate } from "@/lib/formatting/currency";
import type { Transaction } from "@/types/banking";

const statusTone = {
  posted: "success",
  pending: "warning",
  failed: "danger",
} as const;

export function TransactionTable({
  transactions,
  accountNames,
}: {
  transactions: Transaction[];
  accountNames?: Record<string, string>;
}) {
  if (transactions.length === 0) {
    return (
      <p className="px-1 py-8 text-center text-sm text-brand-800/70">
        No transactions match your filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-brand-800/60">
          <tr>
            <th className="px-3 py-3 font-medium">Date</th>
            <th className="px-3 py-3 font-medium">Description</th>
            <th className="px-3 py-3 font-medium">Category</th>
            <th className="px-3 py-3 font-medium">Account</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id} className="border-b border-surface-border/70 last:border-0">
              <td className="whitespace-nowrap px-3 py-3 text-brand-800/80">
                {formatCanadianDate(txn.date)}
              </td>
              <td className="px-3 py-3">
                <SafeText value={txn.description} className="font-medium text-brand-950" />
              </td>
              <td className="px-3 py-3 text-brand-800/80">{txn.category}</td>
              <td className="px-3 py-3 text-brand-800/80">
                {accountNames?.[txn.accountId] ?? txn.accountId}
              </td>
              <td className="px-3 py-3">
                <Badge tone={statusTone[txn.status]}>{txn.status}</Badge>
              </td>
              <td
                className={`whitespace-nowrap px-3 py-3 text-right font-semibold ${
                  txn.direction === "credit" ? "text-emerald-700" : "text-brand-950"
                }`}
              >
                {txn.direction === "credit" ? "+" : "−"}
                {formatCad(txn.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
