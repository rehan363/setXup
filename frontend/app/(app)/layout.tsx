"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, clearSession } from "@/lib/auth";
import { AppContextProvider, useAppContext } from "@/components/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SpaceCreateModal } from "@/components/modals/SpaceCreateModal";
import { TaskCreateModal } from "@/components/modals/TaskCreateModal";

// Inner layout that has access to AppContext
function AppShell({ children }: { children: React.ReactNode }) {
  const { activeSpaceId, refreshOrgs, refreshSpaces } = useAppContext();
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <Sidebar onNewSpace={() => setShowSpaceModal(true)} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar with breadcrumb + view toggle */}
        <Topbar onNewTask={() => setShowTaskModal(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto" id="main-content">
          {children}
        </main>
      </div>

      {/* Modals */}
      {showSpaceModal && (
        <SpaceCreateModal
          onClose={() => setShowSpaceModal(false)}
          onSuccess={() => {
            setShowSpaceModal(false);
            refreshSpaces();
          }}
        />
      )}
      {showTaskModal && activeSpaceId && (
        <TaskCreateModal
          spaceId={activeSpaceId}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
          }}
        />
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-tertiary)] text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <AppContextProvider>
      <AppShell>{children}</AppShell>
    </AppContextProvider>
  );
}
