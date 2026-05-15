"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";

interface TaskFormProps {
  onSubmit: (title: string, description?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function TaskForm({ onSubmit, isSubmitting }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    await onSubmit(title.trim(), description.trim() || undefined);
    
    // Reset form on success
    setTitle("");
    setDescription("");
    setIsExpanded(false);
    inputRef.current?.focus();
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 shadow-sm focus-within:border-[var(--border-focus)] transition-colors duration-200"
      aria-label="Create a new task"
    >
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="What needs to be done?"
          className="w-full bg-transparent border-none text-[var(--text)] font-medium text-[0.9375rem] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 p-0"
          disabled={isSubmitting}
          maxLength={200}
          required
        />
        
        {isExpanded && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-3">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-transparent border-none text-[var(--text-muted)] text-sm placeholder-[var(--text-muted)] opacity-70 focus:opacity-100 focus:outline-none focus:ring-0 p-0 resize-none min-h-[60px]"
              disabled={isSubmitting}
              maxLength={1000}
            />
            
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] mt-1">
              <span className="text-xs text-[var(--text-muted)]">
                {title.length}/200
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setTitle("");
                    setDescription("");
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="btn btn-primary !w-auto !mt-0 !py-1.5 !px-4 !text-sm flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="spinner w-3 h-3" aria-hidden="true" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {isSubmitting ? "Adding..." : "Add Task"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
