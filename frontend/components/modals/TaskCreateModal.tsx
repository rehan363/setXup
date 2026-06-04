"use client";

import React, { useState } from "react";
import { X, Loader2, CalendarDays, AlignLeft, Flag } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";

const PRIORITIES = [
  { value: "urgent", label: "Urgent", color: "#EF4444" },
  { value: "high",   label: "High",   color: "#F97316" },
  { value: "medium", label: "Medium", color: "#EAB308" },
  { value: "low",    label: "Low",    color: "#22C55E" },
  { value: "none",   label: "None",   color: "#94A3B8" },
];

interface TaskCreateModalProps {
  spaceId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskCreateModal({ spaceId, onClose, onSuccess }: TaskCreateModalProps) {
  const { statuses, lists, activeListId } = useAppContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [statusId, setStatusId] = useState<number | null>(
    statuses.length > 0 ? statuses[0].id : null
  );
  const [listId, setListId] = useState<number | null>(activeListId ?? (lists.length > 0 ? lists[0].id : null));
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await api.tasks.create({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        list_id: listId,
        status_id: statusId,
        due_date: dueDate || null,
      });
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create task");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] shadow-2xl w-full sm:max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
            Create Task
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Title */}
          <div>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name…"
              autoFocus
              required
              className="w-full text-[16px] font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] bg-transparent border-none focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="flex gap-2 items-start">
            <AlignLeft size={14} className="text-[var(--text-tertiary)] mt-1 flex-shrink-0" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={2}
              className="flex-1 text-[13px] text-[var(--text-secondary)] placeholder:text-[var(--text-tertiary)] bg-transparent border-none focus:outline-none resize-none"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--border-subtle)]" />

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            {/* Priority */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-1">
                <Flag size={10} /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="text-[12px] px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            {statuses.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={statusId ?? ""}
                  onChange={(e) => setStatusId(e.target.value ? Number(e.target.value) : null)}
                  className="text-[12px] px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer"
                >
                  <option value="">No status</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* List */}
            {lists.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                  List
                </label>
                <select
                  value={listId ?? ""}
                  onChange={(e) => setListId(e.target.value ? Number(e.target.value) : null)}
                  className="text-[12px] px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer"
                >
                  <option value="">No list</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Due date */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-1">
                <CalendarDays size={10} /> Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-[12px] px-2 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <p className="text-[13px] text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-[var(--radius-md)]">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="px-5 py-2 text-[13px] font-medium bg-[var(--accent-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2"
            >
              {isLoading && <Loader2 size={13} className="animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
