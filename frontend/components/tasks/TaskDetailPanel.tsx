"use client";

import React, { useEffect, useState } from "react";
import {
  X, Calendar, Flag, AlignLeft, MessageSquare,
  CheckSquare, Loader2, Send, Check, ChevronDown
} from "lucide-react";
import { api, Task, Comment, Status, Tag } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";
import { Badge } from "@/components/ui/Badge";
import { format, parseISO } from "date-fns";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#EF4444", high: "#F97316", medium: "#EAB308", low: "#22C55E", none: "#94A3B8",
};
const PRIORITY_OPTS = ["urgent", "high", "medium", "low", "none"] as const;

interface TaskDetailPanelProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (updated: Task) => void;
}

export function TaskDetailPanel({ task, onClose, onUpdate }: TaskDetailPanelProps) {
  const { statuses, tags: orgTags } = useAppContext();
  const [comments, setComments] = useState<Comment[]>([]);
  const [taskTags, setTaskTags] = useState<Tag[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const isOpen = task !== null;

  useEffect(() => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDesc(task.description ?? "");
    loadComments(task.id);
    loadTaskTags(task.id);
  }, [task?.id]);

  async function loadComments(taskId: number) {
    try {
      const data = await api.comments.list(taskId);
      setComments(data);
    } catch {}
  }

  async function loadTaskTags(taskId: number) {
    try {
      const data = await api.tags.listForTask(taskId);
      setTaskTags(data);
    } catch {}
  }

  async function handleTitleSave() {
    if (!task || editTitle === task.title) { setIsEditingTitle(false); return; }
    try {
      const updated = await api.tasks.update(task.id, { title: editTitle });
      onUpdate(updated);
    } catch {}
    setIsEditingTitle(false);
  }

  async function handleDescSave() {
    if (!task) return;
    try {
      const updated = await api.tasks.update(task.id, { description: editDesc || null });
      onUpdate(updated);
    } catch {}
    setIsEditingDesc(false);
  }

  async function handleStatusChange(statusId: number | null) {
    if (!task) return;
    try {
      let updated: Task;
      if (statusId) {
        updated = await api.tasks.updateStatus(task.id, statusId);
      } else {
        updated = await api.tasks.update(task.id, { status_id: null });
      }
      onUpdate(updated);
    } catch {}
  }

  async function handlePriorityChange(priority: string) {
    if (!task) return;
    try {
      const updated = await api.tasks.update(task.id, { priority });
      onUpdate(updated);
    } catch {}
  }

  async function handleDueDateChange(date: string) {
    if (!task) return;
    try {
      const updated = await api.tasks.update(task.id, { due_date: date || null });
      onUpdate(updated);
    } catch {}
  }

  async function handleToggleComplete() {
    if (!task) return;
    try {
      const updated = await api.tasks.update(task.id, { completed: !task.completed });
      onUpdate(updated);
    } catch {}
  }

  async function handleSendComment() {
    if (!task || !commentText.trim()) return;
    setIsSavingComment(true);
    try {
      const c = await api.comments.create(task.id, { content: commentText.trim() });
      setComments((prev) => [...prev, c]);
      setCommentText("");
    } catch {}
    setIsSavingComment(false);
  }

  const currentStatus = statuses.find((s) => s.id === task?.status_id);

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-40 w-full sm:w-[480px] bg-[var(--bg-primary)] border-l border-[var(--border-default)] shadow-2xl flex flex-col transition-transform duration-250 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {!task ? null : (
          <>
            {/* ── Header ────────────────────────────────── */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border-subtle)] flex-shrink-0">
              {/* Complete toggle */}
              <button
                onClick={handleToggleComplete}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  task.completed
                    ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                    : "border-[var(--border-strong)] hover:border-[var(--accent-primary)]"
                }`}
                aria-label="Toggle complete"
              >
                {task.completed && <Check size={11} strokeWidth={3} className="text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <input
                    value={editTitle}
                    autoFocus
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => { if (e.key === "Enter") handleTitleSave(); if (e.key === "Escape") setIsEditingTitle(false); }}
                    className="w-full text-[15px] font-semibold text-[var(--text-primary)] bg-transparent border-b-2 border-[var(--accent-primary)] focus:outline-none"
                  />
                ) : (
                  <h2
                    className={`text-[15px] font-semibold text-[var(--text-primary)] cursor-text truncate ${task.completed ? "line-through text-[var(--text-tertiary)]" : ""}`}
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {task.title}
                  </h2>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] transition-colors cursor-pointer flex-shrink-0"
                aria-label="Close panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Body ──────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* Meta fields */}
              <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex flex-col gap-3">
                {/* Status */}
                <MetaRow label="Status">
                  <select
                    value={task.status_id ?? ""}
                    onChange={(e) => handleStatusChange(e.target.value ? Number(e.target.value) : null)}
                    className="text-[12px] px-2 py-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer"
                    style={currentStatus ? { color: currentStatus.color } : {}}
                  >
                    <option value="">No Status</option>
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </MetaRow>

                {/* Priority */}
                <MetaRow label="Priority">
                  <div className="flex gap-1.5 flex-wrap">
                    {PRIORITY_OPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePriorityChange(p)}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full transition-all cursor-pointer capitalize ${
                          task.priority === p
                            ? "ring-2 ring-offset-1 ring-[var(--accent-primary)]"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: `${PRIORITY_COLORS[p]}20`,
                          color: PRIORITY_COLORS[p],
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </MetaRow>

                {/* Due date */}
                <MetaRow label="Due Date">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-[var(--text-tertiary)]" />
                    <input
                      type="date"
                      value={task.due_date ? task.due_date.split("T")[0] : ""}
                      onChange={(e) => handleDueDateChange(e.target.value)}
                      className="text-[12px] px-2 py-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer"
                    />
                    {task.due_date && (
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {format(parseISO(task.due_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                </MetaRow>

                {/* Tags */}
                {taskTags.length > 0 && (
                  <MetaRow label="Tags">
                    <div className="flex flex-wrap gap-1">
                      {taskTags.map((tag) => (
                        <Badge key={tag.id} label={tag.name} color={tag.color} size="sm" />
                      ))}
                    </div>
                  </MetaRow>
                )}
              </div>

              {/* Description */}
              <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-2">
                  <AlignLeft size={13} className="text-[var(--text-tertiary)]" />
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Description</span>
                </div>
                {isEditingDesc ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editDesc}
                      autoFocus
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-[13px] text-[var(--text-primary)] bg-[var(--bg-input)] border border-[var(--border-default)] rounded-[var(--radius-md)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleDescSave}
                        className="px-3 py-1.5 text-[12px] bg-[var(--accent-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setIsEditingDesc(false); setEditDesc(task.description ?? ""); }}
                        className="px-3 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    className="text-[13px] text-[var(--text-secondary)] leading-relaxed cursor-text min-h-[40px] hover:bg-[var(--bg-secondary)] rounded-[var(--radius-md)] px-1 py-1 transition-colors"
                  >
                    {task.description || (
                      <span className="text-[var(--text-tertiary)] italic">
                        Add a description…
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={13} className="text-[var(--text-tertiary)]" />
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                    Comments ({comments.length})
                  </span>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        U
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[12px] font-medium text-[var(--text-primary)]">You</span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">
                            {format(parseISO(c.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-[12px] text-[var(--text-tertiary)] italic">No comments yet.</p>
                  )}
                </div>

                {/* Comment input */}
                <div className="flex gap-2 items-end">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-1">
                    U
                  </div>
                  <div className="flex-1 flex gap-2 items-end bg-[var(--bg-input)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-3 py-2 focus-within:ring-1 focus-within:ring-[var(--accent-primary)]">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendComment();
                        }
                      }}
                      placeholder="Write a comment…"
                      rows={1}
                      className="flex-1 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] bg-transparent focus:outline-none resize-none"
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={isSavingComment || !commentText.trim()}
                      className="text-[var(--accent-primary)] hover:text-[var(--accent-hover)] disabled:opacity-40 cursor-pointer flex-shrink-0 mb-0.5"
                      aria-label="Send comment"
                    >
                      {isSavingComment ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-[11px] font-medium text-[var(--text-tertiary)] w-20 flex-shrink-0 pt-1 uppercase tracking-wide">
        {label}
      </span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
