"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ReactNode, useState } from "react";

export function AppShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header
        userName={userName}
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
