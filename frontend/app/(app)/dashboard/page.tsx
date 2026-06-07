"use client";

import React, { useState, useCallback } from "react";
import { useAppContext } from "@/components/AppContext";
import { BoardView } from "@/components/tasks/BoardView";
import { ListView } from "@/components/tasks/ListView";
import { CalendarView } from "@/components/tasks/CalendarView";
import { DashboardView } from "@/components/tasks/DashboardView";
import { MembersView } from "@/components/views/MembersView";
import { SettingsView } from "@/components/views/SettingsView";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { TaskCreateModal } from "@/components/modals/TaskCreateModal";
import { Task } from "@/lib/api-client";

export default function AppPage() {
  const { activeView, activeSpaceId } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleNewTask = useCallback(() => {
    setShowTaskModal(true);
  }, []);

  const handleTaskUpdate = useCallback((updated: Task) => {
    setSelectedTask(updated);
    setRefreshSignal((s) => s + 1);
  }, []);

  const handleTaskCreated = useCallback(() => {
    setShowTaskModal(false);
    setRefreshSignal((s) => s + 1);
  }, []);

  // No org/space selected yet — show welcome (except when viewing dashboard, global tasks, members, or settings)
  if (!activeSpaceId && activeView !== "dashboard" && activeView !== "list" && activeView !== "members" && activeView !== "settings") {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center px-6">
        <div className="text-6xl mb-2">🚀</div>
        <h2 className="text-[22px] font-bold text-[var(--text-primary)]">
          Welcome to setXup
        </h2>
        <p className="text-[var(--text-secondary)] text-[14px] max-w-sm">
          Select a space from the sidebar to start viewing tasks, or create a new space to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Main view */}
      <div className="flex-1 min-h-0 h-full">
        {activeView === "dashboard" && <DashboardView />}
        {activeView === "board" && activeSpaceId && (
          <BoardView
            onTaskClick={handleTaskClick}
            onNewTask={handleNewTask}
            refreshSignal={refreshSignal}
          />
        )}
        {activeView === "list" && (
          <ListView
            onTaskClick={handleTaskClick}
            refreshSignal={refreshSignal}
          />
        )}
        {activeView === "calendar" && activeSpaceId && (
          <CalendarView
            onTaskClick={handleTaskClick}
            refreshSignal={refreshSignal}
          />
        )}
        {activeView === "members" && <MembersView />}
        {activeView === "settings" && <SettingsView />}
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleTaskUpdate}
      />

      {/* Create Task Modal */}
      {showTaskModal && activeSpaceId && (
        <TaskCreateModal
          spaceId={activeSpaceId}
          onClose={() => setShowTaskModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}
    </div>
  );
}
