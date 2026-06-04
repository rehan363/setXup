"use client";

import React, { useState } from "react";
import { Check, CalendarDays, MoreHorizontal } from "lucide-react";
import { Task, Status } from "@/lib/api-client";
import { format, isPast, parseISO } from "date-fns";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#EF4444",
  high:   "#F97316",
  medium: "#EAB308",
  low:    "#22C55E",
  none:   "#94A3B8",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  high:   "High",
  medium: "Medium",
  low:    "Low",
  none:   "None",
};

interface TaskRowProps {
  task: Task;
  statuses: Status[];
  onClick: () => void;
  onStatusChange: (statusId: number | null) => void;
  onToggleComplete: () => void;
}

export function TaskRow({
  task,
  statuses,
  onClick,
  onStatusChange,
  onToggleComplete,
}: TaskRowProps) {
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !task.completed;
  const priorityColor = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.none;
  const currentStatus = statuses.find((s) => s.id === task.status_id);

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] last:border-0 group cursor-pointer transition-colors duration-100`}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete();
        }}
        className={`w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center transition-all cursor-pointer ${
          task.completed
            ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
            : "border-[var(--border-strong)] hover:border-[var(--accent-primary)]"
        }`}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && <Check size={10} strokeWidth={3} className="text-white" />}
      </button>

      {/* Title — clickable */}
      <div
        className="flex-1 min-w-0 flex items-center gap-3"
        onClick={onClick}
      >
        {/* Priority dot */}
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: priorityColor }}
          title={PRIORITY_LABELS[task.priority]}
        />
        <span
          className={`text-[13px] truncate ${
            task.completed
              ? "line-through text-[var(--text-tertiary)]"
              : "text-[var(--text-primary)]"
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Status select */}
      <div className="w-28 hidden sm:block" onClick={(e) => e.stopPropagation()}>
        <select
          value={task.status_id ?? ""}
          onChange={(e) =>
            onStatusChange(e.target.value ? Number(e.target.value) : null)
          }
          className="text-[11px] px-2 py-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] w-full cursor-pointer"
          style={
            currentStatus
              ? { color: currentStatus.color, borderColor: `${currentStatus.color}40` }
              : {}
          }
        >
          <option value="">No Status</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div className="w-24 hidden md:block">
        <span
          className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: `${priorityColor}20`,
            color: priorityColor,
          }}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      {/* Due date */}
      <div className="w-24 hidden lg:block">
        {task.due_date ? (
          <span
            className={`flex items-center gap-1 text-[11px] font-medium ${
              isOverdue ? "text-red-500" : "text-[var(--text-tertiary)]"
            }`}
          >
            <CalendarDays size={11} />
            {format(parseISO(task.due_date), "MMM d")}
          </span>
        ) : (
          <span className="text-[11px] text-[var(--text-tertiary)]">—</span>
        )}
      </div>

      {/* More actions (placeholder) */}
      <div className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-pointer"
          aria-label="More options"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}
