"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEnvironment } from "@/lib/config/environment";
import { Bell, Menu, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function Header({
  onMenuClick,
  userName = "Jordan Ellis",
}: {
  onMenuClick?: () => void;
  userName?: string;
}) {
  const env = useMemo(() => getEnvironment(), []);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-white/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white"
            aria-hidden
          >
            FB
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold leading-none text-brand-950">
              FakeBank
            </p>
            <p className="truncate text-xs text-brand-800/70">
              Cedar Grove Financial
            </p>
          </div>
        </Link>

        <div className="ml-auto hidden max-w-md flex-1 items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-700/50" />
            <Input
              className="pl-9"
              placeholder="Search accounts, transfers, documents"
              aria-label="Quick search"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {env.isMockMode ? (
            <Badge tone="muted" title="Using local mock data provider">
              Mock data
            </Badge>
          ) : (
            <Badge tone="warning" title="Configured for live API mode">
              Live API
            </Badge>
          )}

          <Button variant="ghost" size="sm" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">{userName}</span>
            </Button>
            {profileOpen ? (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-lg border border-surface-border bg-white p-2 shadow-panel"
              >
                <p className="px-2 py-1.5 text-xs text-brand-800/70">
                  Signed in (mock session)
                </p>
                <Link
                  href="/profile"
                  className="block rounded-md px-2 py-2 text-sm hover:bg-brand-50"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  Profile and Settings
                </Link>
                <Link
                  href="/security"
                  className="block rounded-md px-2 py-2 text-sm hover:bg-brand-50"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  Security Center
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
