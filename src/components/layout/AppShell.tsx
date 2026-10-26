"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

export function AppShell({
  children,
  userName,
  rawName,
}: {
  children: ReactNode;
  userName?: string;
  rawName?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // The sign-in pages have no navigation chrome.
  if (pathname === "/sign-in" || pathname === "/admin/sign-in") {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <Header
        userName={userName}
        rawName={rawName}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <div className="mx-auto flex max-w-7xl">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
