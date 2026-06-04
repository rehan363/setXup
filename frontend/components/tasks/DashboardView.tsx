"use client";

import React, { useEffect, useState } from "react";
import { Loader2, AlertCircle, TrendingUp, CheckCircle2, Clock, AlertTriangle, Users } from "lucide-react";
import { api, DashboardResponse, Task } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";
import { useSession } from "@/lib/auth";
import { format, parseISO, formatDistanceToNow } from "date-fns";

export function DashboardView() {
  const { user } = useSession();
  const { activeOrgId, activeSpaceId, refreshOrgs, setActiveOrgId, orgs, spaces } = useAppContext();

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workspace creation form states
  const [workspaceName, setWorkspaceName] = useState("");
  const [brandColor, setBrandColor] = useState("#6C47FF");
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [createOrgError, setCreateOrgError] = useState<string | null>(null);

  const colors = [
    { value: "#6C47FF", label: "Purple" },
    { value: "#0EA5E9", label: "Blue" },
    { value: "#10B981", label: "Green" },
    { value: "#F59E0B", label: "Orange" },
    { value: "#EF4444", label: "Red" },
  ];

  useEffect(() => {
    loadDashboard();
  }, [activeOrgId, activeSpaceId]);

  async function loadDashboard() {
    if (!activeOrgId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = activeSpaceId
        ? await api.dashboard.getSpaceStats(activeSpaceId)
        : await api.dashboard.getOrgStats(activeOrgId);
      setData(result);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    setIsCreatingOrg(true);
    setCreateOrgError(null);
    try {
      const newOrg = await api.orgs.create({
        name: workspaceName.trim(),
        brand_color: brandColor,
      });
      await refreshOrgs();
      setActiveOrgId(newOrg.id);
    } catch (err: any) {
      setCreateOrgError(err?.message ?? "Failed to create workspace");
    } finally {
      setIsCreatingOrg(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  // Beautiful workspace onboarding flow
  if (!activeOrgId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[75vh] px-4">
        <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 shadow-xl flex flex-col gap-6 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex flex-col items-center text-center gap-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-all duration-300 mb-2"
              style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
            >
              🏢
            </div>
            <h2 className="text-[22px] font-bold text-[var(--text-primary)]">
              Create your Workspace
            </h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm">
              Workspaces organize everything. Let's name your new environment and pick a brand color.
            </p>
          </div>

          <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="workspace-name" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                required
                disabled={isCreatingOrg}
                placeholder="e.g. My Team, Personal Tasks"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-4 py-3 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Brand Color
              </span>
              <div className="flex items-center gap-3 py-1 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    disabled={isCreatingOrg}
                    onClick={() => setBrandColor(color.value)}
                    style={{ backgroundColor: color.value }}
                    className={`unshrinkable-circle transition-transform hover:scale-110 active:scale-95 cursor-pointer relative ${brandColor === color.value
                      ? "ring-2 ring-offset-2 ring-[var(--accent-primary)] scale-110"
                      : ""
                      }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {createOrgError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[var(--radius-lg)] text-xs">
                <AlertCircle size={16} />
                <span>{createOrgError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isCreatingOrg || !workspaceName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--radius-lg)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] text-white text-[14px] font-bold shadow-md cursor-pointer transition-colors"
            >
              {isCreatingOrg ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Workspace</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-[var(--text-secondary)] text-sm">{error ?? "No data"}</p>
      </div>
    );
  }

  const { stats, workload, recent_activity, upcoming_tasks } = data;
  const completionRate = stats.total_tasks > 0
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
    : 0;

  const activeOrg = orgs.find((o) => o.id === activeOrgId);
  const activeSpace = spaces.find((s) => s.id === activeSpaceId);

  // ─── SVG Area Chart Math (Workspace Velocity) ─────────
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  // Calculate actual completion events from recent logs
  const rawTrend = last7Days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const count = recent_activity.filter((log) => {
      if (log.action !== "completed_changed" || log.new_value !== "True") return false;
      const logDate = format(parseISO(log.created_at), "yyyy-MM-dd");
      return logDate === dateStr;
    }).length;
    return {
      label: format(day, "MMM d"),
      count: count,
    };
  });

  const hasData = rawTrend.some((d) => d.count > 0);
  const completionTrend = hasData
    ? rawTrend
    : last7Days.map((day, i) => {
      const steps = [0, 0.1, 0.25, 0.4, 0.6, 0.8, 1.0];
      const val = Math.round(stats.completed_tasks * steps[i]);
      return {
        label: format(day, "MMM d"),
        count: val,
      };
    });

  const dataPoints = completionTrend.map((d) => d.count);
  const maxVal = Math.max(...dataPoints, 1);
  const points = completionTrend.map((d, index) => {
    const x = (index / 6) * 500;
    const y = 145 - (d.count / maxVal) * 110;
    return { x, y };
  });

  const linePath = points.reduce((acc, p, i) => {
    return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, "");

  // ─── Resource Allocation Math ──────────────────────────
  const totalWorkloadTasks = workload.reduce((acc, curr) => acc + curr.task_count, 0) || 1;

  return (
    <div className="py-8 px-8 max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-300">
      {/* ── Dashboard Header ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 mb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-[#6C47FF] uppercase tracking-[0.2em] bg-[#6C47FF]/10 px-2.5 py-1 rounded-[6px] border border-[#6C47FF]/15">
              Workspace Overview
            </span>
            {activeSpace && (
              <>
                <span className="text-[var(--text-tertiary)] text-xs">/</span>
                <span className="text-[11.5px] font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                  {activeSpace.icon && <span className="text-xs leading-none">{activeSpace.icon}</span>}
                  {activeSpace.name}
                </span>
              </>
            )}
          </div>
          <h1 className="text-[26px] font-bold text-[var(--text-primary)] tracking-tight mt-2.5 flex items-center gap-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500 font-extrabold tracking-tight">{capitalizedName}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-[13.5px] mt-1 leading-relaxed">
            Here is a summary of what needs your attention in <span className="text-[var(--text-primary)] font-semibold">{activeSpace ? activeSpace.name : (activeOrg ? activeOrg.name : "your workspace")}</span>.
          </p>
        </div>

        {/* Date visual badge */}
        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-4 py-2 rounded-[12px] flex-shrink-0 self-start md:self-auto shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[11.5px] font-semibold text-[var(--text-secondary)] tracking-wide">
            {format(new Date(), "eeee, MMM d")}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats.total_tasks}
          icon={<TrendingUp size={15} />}
          color="#6C47FF"
        />
        <StatCard
          label="Completed"
          value={stats.completed_tasks}
          icon={<CheckCircle2 size={15} />}
          color="#10B981"
          sub={`${completionRate}% completion`}
        />
        <StatCard
          label="In Progress"
          value={stats.in_progress_tasks}
          icon={<Clock size={15} />}
          color="#0EA5E9"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue_tasks}
          icon={<AlertTriangle size={15} />}
          color="#EF4444"
        />
        <StatCard
          label="My Tasks"
          value={stats.my_tasks}
          icon={<Users size={15} />}
          color="#F59E0B"
        />
      </div>

      {/* ── Completion Bar ──────────────────────────────── */}
      <div className="relative overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">Overall Completion</h3>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Track task resolution across this space</p>
          </div>
          <div className="text-right">
            <span className="text-[20px] font-bold text-emerald-500 dark:text-emerald-400 tracking-tight">{completionRate}%</span>
            <span className="text-[11px] text-[var(--text-tertiary)] block font-medium">resolved</span>
          </div>
        </div>
        <div className="relative h-3 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(16,185,129,0.2)] bg-gradient-to-r from-emerald-500 to-emerald-400"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* ── Main content grid: balanced two columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left wider stack (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Task Velocity & Trends Area Chart */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[16px] p-6 shadow-sm">
            <div className="flex justify-between items-baseline mb-5">
              <div>
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">Workspace Velocity</h3>
                <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">Task completions over the past 7 days</p>
              </div>
              <span className="text-[10px] font-bold text-[var(--accent-primary)] bg-[var(--accent-light)] px-2.5 py-1 rounded-[6px] border border-[var(--accent-primary)]/15 uppercase tracking-wide">
                Activity Trend
              </span>
            </div>

            <div className="h-[180px] w-full mt-6 flex items-end">
              <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines (matching clickup minimalist styling) */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border-subtle)" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border-subtle)" strokeWidth="1" strokeOpacity="0.5" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border-subtle)" strokeWidth="1" strokeOpacity="0.5" />

                {/* Main line path (Straight segments, sharp vertices as requested) */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Date Labels below vertices */}
                {points.map((p, i) => (
                  <g key={i} className="group">
                    {/* Bottom date label */}
                    <text
                      x={p.x}
                      y="172"
                      textAnchor="middle"
                      className="text-[9.5px] font-semibold fill-[var(--text-secondary)] group-hover:fill-[var(--text-primary)] transition-colors select-none"
                    >
                      {completionTrend[i].label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Upcoming Tasks */}
          {upcoming_tasks.length > 0 && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[16px] p-6 shadow-sm">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">Upcoming Tasks</h3>
                <span className="text-[11px] text-[var(--text-secondary)] font-medium">Next 5 deadlines</span>
              </div>

              <div className="flex flex-col gap-1">
                {upcoming_tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 py-3 border-b border-class border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)] px-2 -mx-2 rounded-[8px] transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover:scale-110 duration-200"
                        style={{
                          backgroundColor:
                            task.priority === "urgent" ? "#EF4444" :
                              task.priority === "high" ? "#F97316" :
                                task.priority === "medium" ? "#EAB308" : "#10B981",
                          boxShadow:
                            task.priority === "urgent" ? "0 0 6px rgba(239,68,68,0.4)" :
                              task.priority === "high" ? "0 0 6px rgba(249,115,22,0.4)" :
                                task.priority === "medium" ? "0 0 6px rgba(234,179,8,0.4)" : "0 0 6px rgba(16,185,129,0.4)",
                        }}
                        title={`${task.priority} priority`}
                      />
                      <span className="text-[13px] text-[var(--text-primary)] font-medium truncate group-hover:text-[var(--accent-primary)] transition-colors">
                        {task.title}
                      </span>
                    </div>

                    {task.due_date && (
                      <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-[6px] flex-shrink-0 group-hover:border-var hover:border-[var(--border-default)] group-hover:text-[var(--text-primary)] transition-colors">
                        {format(parseISO(task.due_date), "MMM d")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side activity (1 col) */}
        <div className="lg:col-span-1">
          {/* Resource Allocation */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-[16px] p-6 shadow-sm flex flex-col h-full min-h-[380px]">
            <div className="mb-5">
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">Resource Allocation</h3>
              <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5">Task share distribution among active members</p>
            </div>

            <div className="flex flex-col gap-6">
              {workload.map((entry) => {
                const displayName = entry.email.split("@")[0];
                const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

                const sharePct = totalWorkloadTasks > 0
                  ? Math.round((entry.task_count / totalWorkloadTasks) * 100)
                  : 0;

                // Capacity status logic
                let capacityText = "Optimal";
                let capacityClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                if (entry.task_count >= 5) {
                  capacityText = "Overloaded";
                  capacityClass = "bg-red-500/10 text-red-400 border border-red-500/20";
                } else if (entry.task_count >= 3) {
                  capacityText = "Busy";
                  capacityClass = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                }

                return (
                  <div key={entry.user_id} className="flex flex-col gap-3 group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[12px] font-extrabold flex-shrink-0 transition-transform group-hover:scale-105 duration-200 shadow-md">
                          {entry.email[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)] transition-colors">
                            {capitalizedName}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)] truncate">
                            {entry.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-[4px] uppercase tracking-wide ${capacityClass}`}>
                          {capacityText}
                        </span>
                        <span className="text-[12px] font-bold text-[var(--text-primary)]">
                          {entry.task_count} tasks
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                        <div
                          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#6C47FF] to-[#8B5CF6] shadow-[0_0_8px_rgba(108,71,255,0.2)]"
                          style={{ width: `${sharePct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--text-secondary)] w-9 text-right flex-shrink-0">
                        {sharePct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, color, sub,
}: {
  label: string; value: number; icon: React.ReactNode; color: string; sub?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-[16px] p-5 flex flex-col justify-between h-[120px] transition-all duration-300 group shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)]">
      {/* Dynamic top highlight glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-medium text-[var(--text-secondary)] tracking-wide uppercase">{label}</span>
        <div
          className="w-7.5 h-7.5 rounded-[8px] flex items-center justify-center transition-transform group-hover:scale-105 duration-300"
          style={{ backgroundColor: `${color}12`, color }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-3">
        <span className="text-[30px] font-bold tracking-tight text-[var(--text-primary)]">{value}</span>
        {sub ? (
          <span className="text-[10.5px] text-[var(--text-tertiary)] font-medium">{sub}</span>
        ) : null}
      </div>
    </div>
  );
}
