"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearSession, useSession } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useSession();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-[var(--text)] tracking-tight">todo<span className="text-[var(--accent)]">.</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-muted)] hidden sm:inline-block">
              {user?.email}
            </span>
            <button 
              onClick={handleLogout}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-md hover:bg-[var(--bg-input)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
