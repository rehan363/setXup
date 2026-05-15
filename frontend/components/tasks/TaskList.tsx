"use client";

import { useState, useEffect, useCallback } from "react";
import { api, Task, ApiError } from "@/lib/api-client";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";
import { Inbox } from "lucide-react";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await api.tasks.list();
      setTasks(data.tasks);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load tasks. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (title: string, description?: string) => {
    setIsSubmitting(true);
    try {
      setError(null);
      const newTask = await api.tasks.create({ title, description });
      // Optimistic-like behavior by putting new task at top immediately
      setTasks(prev => [newTask, ...prev]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create task.");
      }
      throw err; // So form can catch it if needed, or we just rely on state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (id: number, completed: boolean) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));

    try {
      const updatedTask = await api.tasks.update(id, { completed });
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (err) {
      // Revert on error
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t));
      setError("Failed to update task.");
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDeleteTask = async (id: number) => {
    setDeletingIds(prev => new Set(prev).add(id));
    
    // Optimistic delete
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await api.tasks.delete(id);
    } catch (err) {
      // Revert on error
      setTasks(previousTasks);
      setError("Failed to delete task.");
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Group tasks by completion status for better UX
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Your Tasks</h1>
        <p className="text-[var(--text-muted)] text-sm">Manage your daily priorities.</p>
      </div>

      {error && (
        <div className="alert-error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <TaskForm onSubmit={handleCreateTask} isSubmitting={isSubmitting} />

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-[var(--bg-input)] animate-pulse rounded-[var(--radius)] border border-[var(--border)]" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[var(--bg-card)] border border-dashed border-[var(--border)] rounded-[var(--radius-lg)]">
          <Inbox className="w-12 h-12 text-[var(--text-muted)] mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-[var(--text)]">No tasks yet</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-[250px]">
            Add a task above to get started with your productivity journey.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {incompleteTasks.length > 0 && (
            <ul className="flex flex-col gap-3" aria-label="Incomplete tasks">
              {incompleteTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={handleToggleTask} 
                  onDelete={handleDeleteTask}
                  isUpdating={updatingIds.has(task.id)}
                  isDeleting={deletingIds.has(task.id)}
                />
              ))}
            </ul>
          )}

          {completedTasks.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider pl-1">
                Completed ({completedTasks.length})
              </h3>
              <ul className="flex flex-col gap-3 opacity-80" aria-label="Completed tasks">
                {completedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={handleToggleTask} 
                    onDelete={handleDeleteTask}
                    isUpdating={updatingIds.has(task.id)}
                    isDeleting={deletingIds.has(task.id)}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
