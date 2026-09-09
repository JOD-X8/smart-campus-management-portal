"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { SearchModal } from "./search-modal";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <SearchModal />
    </div>
  );
}
