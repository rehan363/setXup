"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday
} from "date-fns";
import { api, Task } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";

interface CalendarViewProps {
  onTaskClick: (task: Task) => void;
  refreshSignal?: number;
}

export function CalendarView({ onTaskClick, refreshSignal }: CalendarViewProps) {
  const { lists, activeSpaceId } = useAppContext();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadTasks = useCallback(async () => {
    if (!activeSpaceId) return;
    setIsLoading(true);
    try {
      const taskArrays = await Promise.all(lists.map((l) => api.lists.getTasks(l.id)));
      setAllTasks(taskArrays.flat());
    } catch (err: any) {
      setError(err?.message ?? "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [activeSpaceId, lists]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, refreshSignal]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  // Map tasks to due dates
  const tasksByDay: Record<string, Task[]> = {};
  allTasks.forEach((task) => {
    if (!task.due_date) return;
    const key = task.due_date.split("T")[0];
    if (!tasksByDay[key]) tasksByDay[key] = [];
    tasksByDay[key].push(task);
  });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-[12px] font-medium rounded-[var(--radius-md)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
        {/* Day labels */}
        <div className="grid grid-cols-7 bg-[var(--bg-secondary)]">
          {weekDays.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide border-b border-[var(--border-subtle)]"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {calDays.map((day, idx) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay[dayKey] ?? [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={idx}
                className={`min-h-[90px] p-1.5 border-r border-b border-[var(--border-subtle)] last:border-r-0 ${
                  !isCurrentMonth ? "opacity-40 bg-[var(--bg-secondary)]" : "bg-[var(--bg-primary)]"
                } ${idx % 7 === 6 ? "border-r-0" : ""}`}
              >
                {/* Day number */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-medium mb-1 ${
                  isCurrentDay
                    ? "bg-[var(--accent-primary)] text-white"
                    : "text-[var(--text-secondary)]"
                }`}>
                  {format(day, "d")}
                </div>

                {/* Task pills */}
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`w-full text-left text-[10px] font-medium truncate px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        task.completed
                          ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] line-through"
                          : "bg-[var(--accent-light)] text-[var(--accent-primary)] hover:brightness-95"
                      }`}
                    >
                      {task.title}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-[var(--text-tertiary)] px-1">
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
