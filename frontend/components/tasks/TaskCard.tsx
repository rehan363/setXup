"use client";

import React from "react";
import { CalendarDays, MessageSquare, Paperclip } from "lucide-react";
import { Task } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";
import { format, isPast, parseISO } from "date-fns";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: () => void;
}

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
  none:   "—",
};

export function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !task.completed;
  const priorityColor = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.none;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onClick={onClick}
      className="group bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-[var(--radius-lg)] p-3 flex flex-col gap-2.5 cursor-pointer hover:shadow-sm transition-all duration-150 active:scale-[0.98]"
    >
      {/* Priority indicator */}
      <div className="flex items-center justify-between gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: priorityColor }}
          title={`${PRIORITY_LABELS[task.priority]} priority`}
        />
        {task.completed && (
          <span className="text-[10px] text-green-500 font-medium bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded-full">
            Done
          </span>
        )}
      </div>

      {/* Title */}
      <h4
        className={`text-[13px] font-medium leading-snug text-[var(--text-primary)] line-clamp-3 ${
          task.completed ? "line-through text-[var(--text-tertiary)]" : ""
        }`}
      >
        {task.title}
      </h4>

      {/* Description snippet */}
      {task.description && (
        <p className="text-[11px] text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2">
          {/* Due date */}
          {task.due_date && (
            <span
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isOverdue
                  ? "text-red-500"
                  : "text-[var(--text-tertiary)]"
              }`}
            >
              <CalendarDays size={11} />
              {format(parseISO(task.due_date), "MMM d")}
            </span>
          )}
        </div>

        {/* Priority badge — only when not none */}
        {task.priority !== "none" && (
          <Badge
            label={PRIORITY_LABELS[task.priority]}
            color={priorityColor}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
