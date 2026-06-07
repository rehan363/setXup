"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";
import {
  Loader2,
  List,
  Kanban,
  Calendar,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Users,
  Layers,
  Zap,
  Activity,
  CheckSquare
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [showcaseTab, setShowcaseTab] = useState<"list" | "board" | "calendar">("list");

  // Stateful Mock Showcase Data for interactive checklist
  const [tasks, setTasks] = useState([
    { id: 1, title: "🚀 Launch setXup Product Landing Page", assignee: "RU", status: "In Progress", priority: "Urgent", completion: "4/5", checked: false },
    { id: 2, title: "📊 Design interactive showcase tabs", assignee: "AM", status: "Done", priority: "High", completion: "8/8", checked: true },
    { id: 3, title: "🔒 Update token route middleware redirects", assignee: "SL", status: "To Do", priority: "Medium", completion: "0/3", checked: false },
    { id: 4, title: "💡 Team brainstorming session", assignee: "RU", status: "To Do", priority: "Low", completion: "1/2", checked: false }
  ]);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isChecked = !t.checked;
        const total = parseInt(t.completion.split('/')[1] || "3", 10);
        return {
          ...t,
          checked: isChecked,
          status: isChecked ? "Done" : "To Do",
          completion: isChecked ? `${total}/${total}` : `0/${total}`
        };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen theme-teal bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 font-sans selection:bg-[var(--accent-primary)] selection:text-white">
      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg-primary)]/80 border-b border-[var(--border-subtle)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight select-none">
              <span className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold shadow-md shadow-[var(--accent-primary)]/20">X</span>
              <span>set<span className="text-[var(--accent-primary)]">X</span>up</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-medium text-[var(--text-tertiary)]">
              <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
              <a href="#showcase" className="hover:text-[var(--text-primary)] transition-colors">Showcase</a>
              <a href="#benefits" className="hover:text-[var(--text-primary)] transition-colors">Benefits</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {isLoading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-[var(--text-tertiary)]" />
              </div>
            ) : isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-[12.5px] font-bold rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-primary)]/10 cursor-pointer transition-all flex items-center gap-1.5 hover:translate-y-[-1px] hover:shadow-[var(--accent-primary)]/20"
              >
                Go to Workspace <ArrowRight size={13} />
              </Link>
            ) : (
               <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-[12.5px] font-bold rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)] text-[var(--text-primary)] cursor-pointer transition-colors hover:translate-y-[-0.5px]"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-[12.5px] font-bold rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent-primary)]/10 hover:shadow-[var(--accent-primary)]/20 cursor-pointer transition-all hover:translate-y-[-1px] button-premium-shine"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative px-6 pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Floating Glowing Orbs */}
        <div className="glow-orb bg-[var(--accent-primary)]/15 dark:bg-[var(--accent-primary)]/10 w-96 h-96 -top-20 -left-20 pointer-events-none" />
        <div className="glow-orb bg-[#008ba8]/15 dark:bg-[#008ba8]/10 w-[450px] h-[450px] top-40 -right-20 pointer-events-none" style={{ animationDelay: "-6s" }} />

        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,96,122,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,96,122,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Dynamic moving/looping line backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1440px] h-[500px] pointer-events-none z-0 opacity-85 dark:opacity-100 select-none">
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="10" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="laser-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00607a" />
                <stop offset="45%" stopColor="#008ba8" />
                <stop offset="75%" stopColor="#00b2d6" />
                <stop offset="100%" stopColor="#00607a" />
              </linearGradient>
            </defs>

            <style>{`
              @keyframes flow {
                from {
                  stroke-dashoffset: 2400;
                }
                to {
                  stroke-dashoffset: 0;
                }
              }
              .laser-line {
                stroke-dasharray: 450 1950;
                animation: flow 7s linear infinite;
              }
            `}</style>

            {/* Background aura path */}
            <path
              d="M -50 380 C 300 320, 500 130, 600 130 C 680 130, 780 20, 720 20 C 660 20, 600 130, 720 160 C 800 180, 1140 350, 1490 300"
              stroke="var(--accent-primary)"
              strokeWidth="8"
              strokeOpacity="0.12"
              filter="url(#laser-glow)"
              strokeLinecap="round"
            />

            {/* Moving laser light path */}
            <path
              d="M -50 380 C 300 320, 500 130, 600 130 C 680 130, 780 20, 720 20 C 660 20, 600 130, 720 160 C 800 180, 1140 350, 1490 300"
              stroke="url(#laser-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              className="laser-line"
            />
          </svg>
        </div>

        {/* Floating SaaS Card Left: Checklist */}
        <div className="absolute left-4 xl:left-12 top-[30%] hidden lg:flex flex-col gap-3 p-4.5 w-56 rounded-2xl bg-[var(--bg-primary)]/85 border border-[var(--border-subtle)] backdrop-blur-md shadow-xl select-none float-card-left z-20 pointer-events-none hover:border-[var(--accent-primary)]/30 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <span className="text-[10px] uppercase font-extrabold text-[var(--accent-primary)] dark:text-[#008ba8] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              Active sprint
            </span>
            <span className="text-[9px] text-[var(--text-tertiary)] font-bold">4/5 completed</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10.5px] font-bold text-[var(--text-primary)]">
              <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</div>
              <span className="line-through opacity-70">Design user flows</span>
            </div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold text-[var(--text-primary)]">
              <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold">✓</div>
              <span className="line-through opacity-70">Setup auth middleware</span>
            </div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold text-[var(--text-primary)]">
              <div className="w-4 h-4 rounded border border-[var(--border-strong)] bg-[var(--bg-primary)]" />
              <span>Launch landing page</span>
            </div>
          </div>
        </div>

        {/* Floating SaaS Card Right: Project Overview */}
        <div className="absolute right-4 xl:right-12 top-[35%] hidden lg:flex flex-col gap-3.5 p-4.5 w-56 rounded-2xl bg-[var(--bg-primary)]/85 border border-[var(--border-subtle)] backdrop-blur-md shadow-xl select-none float-card-right z-20 pointer-events-none hover:border-[var(--accent-primary)]/30 hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: "-3.5s" }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-md">Urgent priority</span>
            <span className="text-[9px] text-[var(--text-tertiary)] font-bold">Due June 10</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">📊 UI showcase dashboard widget</h4>
            <div className="flex items-center gap-2 mt-1 select-none">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/20 border-2 border-[var(--bg-primary)] text-[var(--accent-primary)] font-bold text-[8px] flex items-center justify-center">RU</div>
                <div className="w-6 h-6 rounded-full bg-blue-500/25 border-2 border-[var(--bg-primary)] text-blue-500 font-bold text-[8px] flex items-center justify-center">AM</div>
              </div>
              <span className="text-[9px] text-[var(--text-tertiary)] font-medium">Assigned to team</span>
            </div>
          </div>
          <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[75%]" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-primary)]/25 bg-[var(--accent-primary)]/5 dark:bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] dark:text-[#008ba8] text-xs font-semibold select-none backdrop-blur-md transition-all duration-300 hover:border-[var(--accent-primary)]/45 hover:bg-[var(--accent-primary)]/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008ba8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-primary)]"></span>
            </span>
            <Sparkles size={12} className="text-[var(--accent-primary)] animate-pulse" />
            <span>Next-Generation Productivity Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.12] text-[var(--text-primary)] max-w-3xl">
            Set up your entire team's workflow in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00607a] via-[#007b9c] to-[#008ba8] dark:from-[#008ba8] dark:via-[#009fb2] dark:to-[#00b0c2] font-black relative inline-block">
              one place
              <span className="absolute bottom-1.5 left-0 w-full h-[5px] bg-[var(--accent-primary)]/20 rounded-full" />
            </span>
          </h1>

          <p className="text-base md:text-xl text-[var(--text-tertiary)] max-w-2xl leading-relaxed">
            Welcome to the future of work. <strong>setXup</strong> brings task list speed, collaborative boards, and interactive calendar scheduling into a single, cohesive workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-2.5">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-bold shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/35 cursor-pointer transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center gap-2 group button-premium-shine"
              >
                Go to Workspace
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-bold shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/35 cursor-pointer transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center gap-2 group button-premium-shine"
                >
                  Get setXup Free
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3.5 rounded-xl border border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] text-[14px] font-bold cursor-pointer transition-all hover:translate-y-[-1px] active:translate-y-0 hover:border-[var(--border-strong)]"
                >
                  Book a demo
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Custom Premium SVG Vector Graph - Interface Mesh */}
        <div className="max-w-5xl mx-auto mt-16 relative border border-[var(--border-subtle)] rounded-[20px] bg-[var(--bg-secondary)] shadow-2xl p-2.5 overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00607a] via-[#008ba8] to-[#00b2d6]" />
          <div className="border border-[var(--border-subtle)] rounded-[12px] bg-[var(--bg-primary)] p-4 flex flex-col gap-3 min-h-[220px] select-none">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="w-48 h-5 rounded bg-[var(--bg-secondary)] text-[9px] text-[var(--text-tertiary)] flex items-center justify-center">
                setxup.com/workspace/project
              </div>
              <div className="w-6" />
            </div>
            {/* SVG mesh illustration */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-8">
              <div className="flex flex-col gap-3 max-w-sm">
                <span className="px-2.5 py-1 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] dark:text-[#008ba8] text-[10px] font-extrabold uppercase w-max tracking-wider">Production Stable</span>
                <h3 className="text-xl font-bold">Unify all your tasks in visual spaces</h3>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  Eliminate tools fragmentation. Switch views in real-time between boards, lists, and calendars, with robust user isolation and zero layout shifts.
                </p>
              </div>
              <div className="flex-1 w-full max-w-[420px] h-[160px] relative">
                <svg className="w-full h-full" viewBox="0 0 400 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Decorative mesh connections */}
                  <path d="M40 80 L160 30 M160 30 L280 120 M280 120 L360 50 M160 30 L360 50 M40 80 L280 120" stroke="var(--accent-primary)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                  
                  {/* Nodes */}
                  <circle cx="40" cy="80" r="16" fill="var(--bg-secondary)" stroke="var(--border-strong)" strokeWidth="1.5" />
                  <path d="M35 80 L45 80 M40 75 L40 85" stroke="var(--text-primary)" strokeWidth="1.5" />

                  <g transform="translate(130, 10)">
                    <rect width="60" height="40" rx="8" fill="var(--bg-secondary)" stroke="var(--border-strong)" strokeWidth="1.5" />
                    <rect x="8" y="10" width="16" height="4" rx="2" fill="var(--accent-primary)" />
                    <rect x="8" y="18" width="44" height="3" rx="1.5" fill="var(--text-tertiary)" opacity="0.5" />
                    <rect x="8" y="26" width="30" height="3" rx="1.5" fill="var(--text-tertiary)" opacity="0.5" />
                  </g>

                  <g transform="translate(250, 95)">
                    <rect width="60" height="40" rx="8" fill="var(--bg-secondary)" stroke="var(--border-strong)" strokeWidth="1.5" />
                    <rect x="8" y="10" width="16" height="4" rx="2" fill="green" opacity="0.6" />
                    <rect x="8" y="18" width="44" height="3" rx="1.5" fill="var(--text-tertiary)" opacity="0.5" />
                    <rect x="8" y="26" width="30" height="3" rx="1.5" fill="var(--text-tertiary)" opacity="0.5" />
                  </g>

                  <g transform="translate(330, 30)">
                    <circle cx="20" cy="20" r="18" fill="var(--accent-light)" />
                    <path d="M15 20 L19 24 L26 16" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive Showcase Section ─────────────────────────── */}
      <section id="showcase" className="py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-subtle)] transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center flex flex-col items-center gap-3 mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
              Experience the Workspace
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] max-w-lg leading-relaxed">
              No static templates here. Try checking off a task in the list below or click the tabs to preview real-time views.
            </p>

            {/* Showcase Tab Selector */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] mt-5 shadow-sm">
              <button
                onClick={() => setShowcaseTab("list")}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                  showcaseTab === "list"
                    ? "bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-primary)]/20"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/40"
                }`}
              >
                <List size={13} />
                List View
              </button>
              <button
                onClick={() => setShowcaseTab("board")}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                  showcaseTab === "board"
                    ? "bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-primary)]/20"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/40"
                }`}
              >
                <Kanban size={13} />
                Board View
              </button>
              <button
                onClick={() => setShowcaseTab("calendar")}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-2 ${
                  showcaseTab === "calendar"
                    ? "bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--accent-primary)]/20"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/40"
                }`}
              >
                <Calendar size={13} />
                Calendar View
              </button>
            </div>
          </div>

          {/* Interactive Screen container */}
          <div className="border border-[var(--border-subtle)] rounded-[20px] bg-[var(--bg-primary)] shadow-2xl overflow-hidden min-h-[350px] flex flex-col">
            {/* Header controls */}
            <div className="bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-5 py-3.5 flex items-center justify-between gap-3 text-xs select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                <span className="font-bold text-[var(--text-primary)]">Design Sprint Workspace</span>
              </div>
              <div className="flex items-center gap-4 text-[var(--text-tertiary)] font-medium">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" /> Filter: All Tasks</span>
                <span>Sorted by: Priority</span>
              </div>
            </div>

            {/* Showcase View Panel */}
            <div className="flex-1 p-6 overflow-auto animate-in">
              {/* TAB 1: LIST VIEW */}
              {showcaseTab === "list" && (
                <div className="flex flex-col gap-2.5 min-w-[500px]">
                  <div className="grid grid-cols-12 text-[10px] uppercase font-extrabold text-[var(--text-tertiary)] tracking-wider border-b border-[var(--border-subtle)] pb-2.5 px-3 select-none">
                    <div className="col-span-6">Task Title</div>
                    <div className="col-span-2">Assignee</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Priority</div>
                  </div>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`grid grid-cols-12 items-center text-xs border border-[var(--border-subtle)] rounded-xl p-3 hover:border-[var(--accent-primary)]/40 hover:bg-[var(--bg-secondary)] transition-all cursor-pointer bg-[var(--bg-primary)] hover:translate-x-0.5 shadow-sm group ${
                        task.checked ? "opacity-70" : ""
                      }`}
                    >
                      <div className="col-span-6 font-semibold flex items-center gap-3 text-[var(--text-primary)]">
                        <div className="flex items-center justify-center cursor-pointer">
                          {task.checked ? (
                            <div className="w-4.5 h-4.5 rounded-md bg-emerald-500 text-white flex items-center justify-center transition-all border border-emerald-500">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-md border border-[var(--border-strong)] hover:border-[var(--accent-primary)] bg-[var(--bg-primary)] transition-all" />
                          )}
                        </div>
                        <span className={`transition-all duration-200 select-none ${task.checked ? "line-through text-[var(--text-tertiary)]" : ""}`}>
                          {task.title}
                        </span>
                        {task.completion && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            task.checked ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                          }`}>
                            {task.completion}
                          </span>
                        )}
                      </div>
                      <div className="col-span-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-[9px] flex items-center justify-center border border-[var(--accent-primary)]/10">
                          {task.assignee}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                          task.status === "Done"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : task.status === "In Progress"
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className={`font-semibold flex items-center gap-1.5 ${
                          task.priority === "Urgent"
                            ? "text-red-500"
                            : task.priority === "High"
                            ? "text-orange-500"
                            : "text-[var(--text-tertiary)]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === "Urgent"
                              ? "bg-red-500 animate-ping"
                              : task.priority === "High"
                              ? "bg-orange-500"
                              : "bg-[var(--text-tertiary)]"
                          }`} />
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: BOARD VIEW */}
              {showcaseTab === "board" && (
                <div className="grid grid-cols-3 gap-5 min-w-[550px] h-full items-start">
                  {/* Column 1 */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold px-1 text-[var(--text-tertiary)] select-none">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        To Do
                      </span>
                      <span className="w-5 h-5 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] font-bold">2</span>
                    </div>
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-2.5 hover:shadow-md transition-shadow cursor-grab group/card hover:border-[var(--accent-primary)]/35">
                      <span className="text-[9px] text-orange-500 font-extrabold uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded-md w-max">Priority: Medium</span>
                      <p className="text-xs font-bold leading-snug group-hover/card:text-[var(--accent-primary)] transition-colors">🔒 Update token route middleware redirects</p>
                      <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-orange-500 h-full w-[0%]" />
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 mt-1">
                        <span className="text-[9px] text-[var(--text-tertiary)]">0/3 items</span>
                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-[9px] flex items-center justify-center border border-[var(--accent-primary)]/10">SL</div>
                      </div>
                    </div>
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-2.5 hover:shadow-md transition-shadow cursor-grab group/card hover:border-[var(--accent-primary)]/35">
                      <span className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-md w-max">Priority: Low</span>
                      <p className="text-xs font-bold leading-snug group-hover/card:text-[var(--accent-primary)] transition-colors">💡 Team brainstorming session</p>
                      <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-gray-400 h-full w-[50%]" />
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 mt-1">
                        <span className="text-[9px] text-[var(--text-tertiary)]">1/2 items</span>
                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-[9px] flex items-center justify-center border border-[var(--accent-primary)]/10">RU</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold px-1 text-blue-500 select-none">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        In Progress
                      </span>
                      <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center text-[10px] font-bold">1</span>
                    </div>
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-2.5 hover:shadow-md transition-shadow cursor-grab ring-1 ring-[var(--accent-primary)]/30 group/card hover:border-[var(--accent-primary)]/50">
                      <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-md w-max flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
                        Priority: Urgent
                      </span>
                      <p className="text-xs font-bold leading-snug text-[var(--text-primary)] group-hover/card:text-[var(--accent-primary)] transition-colors">🚀 Launch setXup Product Landing Page</p>
                      <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-[var(--accent-primary)] h-full w-[80%]" />
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 mt-1">
                        <span className="text-[9px] text-[var(--text-tertiary)]">4/5 items</span>
                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold text-[9px] flex items-center justify-center border border-[var(--accent-primary)]/20">RU</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold px-1 text-emerald-500 select-none">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Done
                      </span>
                      <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-[10px] font-bold">1</span>
                    </div>
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col gap-2.5 opacity-65 hover:opacity-100 transition-all cursor-grab group/card hover:border-[var(--accent-primary)]/35">
                      <span className="text-[9px] text-orange-500 font-extrabold uppercase tracking-wider bg-orange-500/10 px-2 py-0.5 rounded-md w-max">Priority: High</span>
                      <p className="text-xs font-bold leading-snug line-through text-[var(--text-tertiary)]">📊 Design interactive showcase tabs</p>
                      <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden mt-1">
                        <div className="bg-emerald-500 h-full w-full" />
                      </div>
                      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2.5 mt-1">
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">8/8 completed</span>
                        <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-[9px] flex items-center justify-center border border-[var(--accent-primary)]/10 font-bold">AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CALENDAR VIEW */}
              {showcaseTab === "calendar" && (
                <div className="flex flex-col gap-2.5 min-w-[500px]">
                  {/* Month header */}
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2.5 mb-2 select-none">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                      <span>June 2026</span>
                    </span>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] cursor-pointer text-[10px] font-bold transition-colors">⟨</span>
                      <span className="px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] cursor-pointer text-[10px] font-bold transition-colors">⟩</span>
                    </div>
                  </div>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider select-none">
                    <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mt-1.5">
                    {/* Blank slots */}
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 rounded-xl border border-transparent" />
                    ))}
                    {/* Days */}
                    {Array.from({ length: 14 }).map((_, i) => {
                      const dayNum = i + 1;
                      return (
                        <div key={i} className="h-16 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 p-1.5 flex flex-col justify-between items-start text-[10px] hover:bg-[var(--bg-secondary)] hover:border-[var(--accent-primary)]/30 transition-all shadow-sm">
                          <span className="font-bold text-[var(--text-tertiary)]">{dayNum}</span>
                          {dayNum === 5 && (
                            <div className="w-full truncate px-2 py-0.5 rounded-lg bg-[#00607a]/10 text-[#00607a] font-extrabold text-[8px] border border-[#00607a]/20 shadow-sm leading-tight hover:scale-[1.03] transition-transform">
                              🚀 Launch Landing
                            </div>
                          )}
                          {dayNum === 9 && (
                            <div className="w-full truncate px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold text-[8px] border border-orange-500/20 shadow-sm leading-tight hover:scale-[1.03] transition-transform">
                              📊 Tab showcase
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid Section ─────────────────────────────────── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative">
        {/* Subtle decorative glowing spot in features */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent-primary)]/5 dark:bg-[var(--accent-primary)]/[0.03] w-[500px] h-[500px] rounded-full filter blur-3xl pointer-events-none z-0" />

        <div className="text-center flex flex-col items-center gap-3 mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00607a] to-[#008ba8] dark:from-[#008ba8] dark:to-[#00b2d6]">
              enterprise execution
            </span>
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] max-w-md leading-relaxed font-medium">
            Every feature is optimized for swift, organized task tracking without the bloat of traditional enterprise tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {/* Item 1 */}
          <div className="card-interactive p-6 flex flex-col gap-4.5 rounded-2xl shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[var(--accent-light)] text-[var(--accent-primary)] flex items-center justify-center border border-[var(--accent-primary)]/10 shadow-sm">
              <Layers size={19} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Spaces & Folders</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed font-medium">
              Create separate Spaces for Marketing, Engineering, Operations, and HR. Keep your priorities segregated.
            </p>
          </div>

          {/* Item 2 */}
          <div className="card-interactive p-6 flex flex-col gap-4.5 rounded-2xl shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] dark:text-[#008ba8] flex items-center justify-center border border-[var(--accent-primary)]/10 shadow-sm">
              <CheckSquare size={19} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Boards & Lists</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed font-medium">
              Switch in one click between Board, List, and Calendar. Never lose track of timelines or work progress.
            </p>
          </div>

          {/* Item 3 */}
          <div className="card-interactive p-6 flex flex-col gap-4.5 rounded-2xl shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/10 shadow-sm">
              <Activity size={19} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Checklists</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed font-medium">
              Subdivide complex tasks into quick actionable checklist items. Track granular completion status instantly.
            </p>
          </div>

          {/* Item 4 */}
          <div className="card-interactive p-6 flex flex-col gap-4.5 rounded-2xl shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/10 shadow-sm">
              <Users size={19} />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Isolation & Security</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed font-medium">
              Robust organization isolation ensures members only access authorized assets. Delete workspaces cleanly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Social Proof & Testimonials ─────────────────────────────── */}
      <section id="benefits" className="py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-subtle)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div className="text-center flex flex-col items-center gap-3 mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)]">
              Adopted by high-growth engineering teams
            </h2>
            <p className="text-sm text-[var(--text-tertiary)] max-w-sm leading-relaxed font-medium">
              See what engineers are saying about their transition to setXup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-6.5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[var(--accent-primary)]/20 transition-all duration-300">
              <p className="text-xs text-[var(--text-tertiary)] italic leading-relaxed font-medium">
                "Our team transitioned from ClickUp to setXup last month. The speed of the UI is incredible—there is absolutely zero lag when switching views or completing tasks."
              </p>
              <div className="flex items-center gap-2.5 mt-6 border-t border-[var(--border-subtle)] pt-4 select-none">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center border border-[var(--accent-primary)]/10 shadow-sm">AL</div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Alex L.</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-medium">Tech Lead, Techify</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-6.5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[var(--accent-primary)]/20 transition-all duration-300">
              <p className="text-xs text-[var(--text-tertiary)] italic leading-relaxed font-medium">
                "Task lists and checklists in setXup are so intuitive. The interface isn't cluttered with widgets we don't use, and the dark mode support is extremely premium."
              </p>
              <div className="flex items-center gap-2.5 mt-6 border-t border-[var(--border-subtle)] pt-4 select-none">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center border border-[var(--accent-primary)]/10 shadow-sm">SN</div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Sarah N.</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-medium">Product Manager, Flowly</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] p-6.5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[var(--accent-primary)]/20 transition-all duration-300">
              <p className="text-xs text-[var(--text-tertiary)] italic leading-relaxed font-medium">
                "The organization security setup in setXup is exactly what we needed to organize client tasks safely without overlapping user scopes. Highly recommend."
              </p>
              <div className="flex items-center gap-2.5 mt-6 border-t border-[var(--border-subtle)] pt-4 select-none">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold text-xs flex items-center justify-center border border-[var(--accent-primary)]/10 shadow-sm">MK</div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Michael K.</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-medium">CTO, SecuriCorp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner Section ────────────────────────────────────── */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto flex flex-col items-center gap-6 relative select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,96,122,0.06)_0%,transparent_65%)] pointer-events-none" />
        <Zap className="text-[var(--accent-primary)] animate-pulse" size={32} />
        <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)]">
          Ready to set up your workflow?
        </h2>
        <p className="text-sm text-[var(--text-tertiary)] max-w-md leading-relaxed font-medium">
          Create your account today and experience ClickUp-level task tracking with lightning performance.
        </p>
        <div className="mt-2.5 relative z-10">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-bold shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/35 cursor-pointer transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center gap-2 button-premium-shine"
            >
              Go to Workspace <ArrowRight size={14} />
            </Link>
          ) : (
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-bold shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/35 cursor-pointer transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center gap-2 button-premium-shine"
            >
              Start for Free <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 transition-colors duration-200 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
              <span className="w-7 h-7 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center font-bold">X</span>
              <span>setXup</span>
            </Link>
            <p className="text-xs text-[var(--text-tertiary)] max-w-xs leading-relaxed">
              The high-performance, responsive task management platform built for modern collaboration.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Product</h4>
            <ul className="flex flex-col gap-2 text-xs text-[var(--text-tertiary)]">
              <li><a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a></li>
              <li><a href="#showcase" className="hover:text-[var(--text-primary)] transition-colors">Showcase</a></li>
              <li><span className="opacity-50">Security API</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Company</h4>
            <ul className="flex flex-col gap-2 text-xs text-[var(--text-tertiary)]">
              <li><span className="opacity-50">About</span></li>
              <li><span className="opacity-50">Careers</span></li>
              <li><span className="opacity-50">Privacy Policy</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Support</h4>
            <ul className="flex flex-col gap-2 text-xs text-[var(--text-tertiary)]">
              <li><span className="opacity-50">Documentation</span></li>
              <li><span className="opacity-50">Status</span></li>
              <li><span className="opacity-50">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-[var(--border-subtle)] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[var(--text-tertiary)]">
            © 2026 setXup Inc. All rights reserved.
          </p>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Designed for Hackathon II. Built with Next.js & FastAPI.
          </p>
        </div>
      </footer>
    </div>
  );
}
