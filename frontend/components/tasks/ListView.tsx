"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { api, Task, Status } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";
import { TaskRow } from "./TaskRow";

interface ListViewProps {
  onTaskClick: (task: Task) => void;
  refreshSignal?: number;
}

export function ListView({ onTaskClick, refreshSignal }: ListViewProps) {
  const { statuses, lists, activeSpaceId } = useAppContext();

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeSpaceId) {
        const taskArrays = await Promise.all(lists.map((l) => api.lists.getTasks(l.id)));
        setAllTasks(taskArrays.flat());
      } else {
        const res = await api.tasks.list();
        setAllTasks(res.tasks);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [activeSpaceId, lists]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, refreshSignal]);

  async function handleStatusChange(task: Task, newStatusId: number | null) {
    // Optimistic update
    setAllTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status_id: newStatusId } : t))
    );
    try {
      if (newStatusId) {
        await api.tasks.updateStatus(task.id, newStatusId);
      } else {
        await api.tasks.update(task.id, { status_id: null });
      }
    } catch {
      loadTasks();
    }
  }

  async function handleToggleComplete(task: Task) {
    // Optimistic update
    setAllTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await api.tasks.update(task.id, { completed: !task.completed });
    } catch {
      loadTasks();
    }
  }

  // Group by status
  type Group = { statusId: number | null; label: string; color: string; tasks: Task[] };
  const groups: Group[] = [];

  if (activeSpaceId) {
    const noStatus = allTasks.filter((t) => t.status_id === null);
    if (noStatus.length > 0) {
      groups.push({ statusId: null, label: "No Status", color: "#94A3B8", tasks: noStatus });
    }

    for (const status of statuses) {
      const tasks = allTasks.filter((t) => t.status_id === status.id);
      if (tasks.length > 0) {
        groups.push({ statusId: status.id, label: status.name, color: status.color, tasks });
      }
    }
  } else {
    // Global My Tasks: Group by completion status
    const todoTasks = allTasks.filter((t) => !t.completed);
    const doneTasks = allTasks.filter((t) => t.completed);

    if (todoTasks.length > 0) {
      groups.push({ statusId: 0, label: "To Do", color: "#FFB300", tasks: todoTasks });
    }
    if (doneTasks.length > 0) {
      groups.push({ statusId: 1, label: "Done", color: "#66BB6A", tasks: doneTasks });
    }
  }

  function toggleGroup(key: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-[var(--text-secondary)] text-sm">{error}</p>
        <button
          onClick={loadTasks}
          className="px-4 py-2 text-sm bg-[var(--accent-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (allTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="text-5xl">✅</div>
        <h3 className="text-[var(--text-primary)] font-semibold">No tasks yet</h3>
        <p className="text-[var(--text-secondary)] text-[13px]">
          Create your first task to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto max-w-5xl mx-auto w-full">
      {/* Table header */}
      <div className="flex items-center gap-4 px-4 py-3 text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide border-b border-[var(--border-subtle)] mb-1">
        <div className="w-5" /> {/* checkbox col */}
        <div className="flex-1">Task</div>
        <div className="w-28 hidden sm:block">Status</div>
        <div className="w-24 hidden md:block">Priority</div>
        <div className="w-24 hidden lg:block">Due Date</div>
        <div className="w-8" /> {/* actions */}
      </div>

      {/* Groups */}
      {groups.map((group) => {
        const key = String(group.statusId ?? "none");
        const isCollapsed = collapsedGroups.has(key);

        return (
          <div key={key} className="mb-4">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(key)}
              className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-[var(--bg-secondary)] rounded-[var(--radius-md)] transition-colors cursor-pointer group"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <span className="text-[12px] font-semibold text-[var(--text-secondary)] flex-1">
                {group.label}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded-full">
                {group.tasks.length}
              </span>
              <ChevronDown
                size={14}
                className={`text-[var(--text-tertiary)] transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
              />
            </button>

            {/* Rows */}
            {!isCollapsed && (
              <div className="flex flex-col">
                {group.tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    statuses={statuses}
                    onClick={() => onTaskClick(task)}
                    onStatusChange={(statusId) => handleStatusChange(task, statusId)}
                    onToggleComplete={() => handleToggleComplete(task)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
