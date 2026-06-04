"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { api, Task, Status } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";
import { TaskCard } from "./TaskCard";

interface BoardColumn {
  status: Status;
  tasks: Task[];
}

interface BoardViewProps {
  onTaskClick: (task: Task) => void;
  onNewTask: () => void;
  refreshSignal?: number;
}

export function BoardView({ onTaskClick, onNewTask, refreshSignal }: BoardViewProps) {
  const { statuses, lists, activeSpaceId } = useAppContext();

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ taskId: number; fromStatusId: number | null } | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);

  // Load tasks for all lists in this space
  const loadTasks = useCallback(async () => {
    if (!activeSpaceId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch tasks from all lists in this space
      const taskArrays = await Promise.all(lists.map((l) => api.lists.getTasks(l.id)));
      const combined = taskArrays.flat();
      setAllTasks(combined);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [activeSpaceId, lists]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, refreshSignal]);

  // Group tasks by status
  const columns: BoardColumn[] = statuses.map((status) => ({
    status,
    tasks: allTasks.filter((t) => t.status_id === status.id),
  }));

  // Tasks with no status
  const unstagedTasks = allTasks.filter((t) => t.status_id === null);
  if (unstagedTasks.length > 0) {
    columns.unshift({
      status: { id: -1, space_id: -1, name: "No Status", color: "#94A3B8", type: "open", order: -1 },
      tasks: unstagedTasks,
    });
  }

  // ── Drag & Drop ─────────────────────────────────────────────
  async function handleDrop(targetStatusId: number | null) {
    if (!dragging) return;
    if (dragging.fromStatusId === targetStatusId) {
      setDragging(null);
      setDragOverColumn(null);
      return;
    }

    // Optimistic update
    setAllTasks((prev) =>
      prev.map((t) =>
        t.id === dragging.taskId
          ? { ...t, status_id: targetStatusId === -1 ? null : targetStatusId }
          : t
      )
    );
    setDragging(null);
    setDragOverColumn(null);

    try {
      if (targetStatusId && targetStatusId !== -1) {
        await api.tasks.updateStatus(dragging.taskId, targetStatusId);
      } else {
        await api.tasks.update(dragging.taskId, { status_id: null });
      }
    } catch {
      // Revert on failure
      loadTasks();
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-[var(--text-secondary)] text-[14px]">{error}</p>
        <button
          onClick={loadTasks}
          className="px-4 py-2 text-[13px] bg-[var(--accent-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] cursor-pointer transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3">
        <div className="text-5xl">📋</div>
        <h3 className="text-[var(--text-primary)] font-semibold">No statuses yet</h3>
        <p className="text-[var(--text-secondary)] text-[13px]">
          Create a status to start organizing your tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex gap-6 p-6 h-full" style={{ minWidth: `${columns.length * 304 + 80}px` }}>
        {columns.map((col) => (
          <BoardColumn
            key={col.status.id}
            column={col}
            isDragOver={dragOverColumn === col.status.id}
            onDragStart={(taskId) => setDragging({ taskId, fromStatusId: col.status.id })}
            onDragOver={() => setDragOverColumn(col.status.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => handleDrop(col.status.id)}
            onTaskClick={onTaskClick}
            onNewTask={onNewTask}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Board Column ─────────────────────────────────────── */
interface BoardColumnProps {
  column: BoardColumn;
  isDragOver: boolean;
  onDragStart: (taskId: number) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onTaskClick: (task: Task) => void;
  onNewTask: () => void;
}

function BoardColumn({
  column,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskClick,
  onNewTask,
}: BoardColumnProps) {
  const { status, tasks } = column;

  return (
    <div
      className={`flex flex-col w-[280px] flex-shrink-0 rounded-[var(--radius-xl)] transition-colors ${
        isDragOver
          ? "bg-[var(--accent-light)] ring-2 ring-[var(--accent-primary)]"
          : "bg-[var(--bg-secondary)]"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 sticky top-0">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: status.color }}
        />
        <span className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide flex-1 truncate">
          {status.name}
        </span>
        <span className="text-[11px] text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-3 min-h-[80px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={() => onDragStart(task.id)}
          />
        ))}

        {tasks.length === 0 && !isDragOver && (
          <div className="flex items-center justify-center min-h-[80px] border-2 border-dashed border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-[var(--text-tertiary)] text-[12px]">
            Drop here
          </div>
        )}
      </div>

      {/* Add task */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewTask}
          className="w-full flex items-center gap-1.5 px-2.5 py-2.5 text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
        >
          <Plus size={13} />
          Add task
        </button>
      </div>
    </div>
  );
}
