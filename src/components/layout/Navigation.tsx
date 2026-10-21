"use client";

import { cn } from "@/lib/utils/cn";
import {
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  LineChart,
  ListOrdered,
  Shield,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navigationItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { href: "/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/investments", label: "Investments", icon: LineChart },
  { href: "/profile", label: "Profile and Settings", icon: UserRound },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/security", label: "Security Center", icon: Shield },
] as const;

export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="space-y-1">
      {navigationItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-700 text-white"
                : "text-brand-900 hover:bg-brand-50",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
