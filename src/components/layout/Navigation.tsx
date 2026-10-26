"use client";

import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import {
  ArrowLeftRight,
  Flag,
  FileText,
  LayoutDashboard,
  LineChart,
  ListOrdered,
  Shield,
  Trophy,
  UserRound,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { LabMe } from "@/types/lab";

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

// Lab links are added only when LAB_MODE is on and the role matches. Default state is hidden.
export const labStudentNavItem = { href: "/lab/progress", label: "Progress", icon: Flag } as const;
export const labAdminNavItem = { href: "/admin/leaderboard", label: "Leaderboard", icon: Trophy } as const;

type NavItem = { href: string; label: string; icon: typeof Flag };

export function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [labItems, setLabItems] = useState<NavItem[]>([]);

  useEffect(() => {
    apiRequest<LabMe>("/api/lab/me", { sameOrigin: true })
      .then((me) => {
        if (!me.enabled) return;
        if (me.role === "student") setLabItems([labStudentNavItem]);
        if (me.role === "admin") setLabItems([labAdminNavItem]);
      })
      .catch(() => {
        // Lab status is optional; the banking navigation renders without it.
      });
  }, []);

  const items: NavItem[] = [...navigationItems, ...labItems];

  return (
    <nav aria-label="Primary" className="space-y-1">
      {items.map((item) => {
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
