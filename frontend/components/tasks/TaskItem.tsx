"use client";

import { Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Task } from "@/lib/api-client";

interface TaskItemProps {
  task: Task;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function TaskItem({ task, onToggle, onDelete, isUpdating, isDeleting }: TaskItemProps) {
  return (
    <li 
      className={`group flex items-start gap-3 p-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius)] transition-all duration-200 hover:border-[var(--border-focus)] ${(isUpdating || isDeleting) ? "opacity-60 pointer-events-none" : ""}`}
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        disabled={isUpdating}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded flex items-center justify-center border transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:ring-offset-[var(--bg-input)] ${
          task.completed 
            ? "bg-[var(--success)] border-[var(--success)] text-white" 
            : "bg-transparent border-[var(--text-muted)] hover:border-[var(--accent)]"
        }`}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.completed && <Check size={14} strokeWidth={3} />}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`text-[0.9375rem] font-medium transition-all duration-200 break-words ${task.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]"}`}>
          {task.title}
        </p>
        {task.description && (
          <p className={`mt-1 text-sm transition-all duration-200 break-words ${task.completed ? "text-[var(--text-muted)] opacity-70" : "text-[var(--text-muted)]"}`}>
            {task.description}
          </p>
        )}
        <p className="mt-2 text-xs text-[var(--text-muted)] opacity-70">
          {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
        </p>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        disabled={isDeleting}
        className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--danger)] cursor-pointer sm:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 size={18} />
      </button>
    </li>
  );
}
