"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Plus, Filter, LogOut } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useAppContext, ActiveView } from "@/components/AppContext";
import { useSession, clearSession } from "@/lib/auth";

const VIEW_TABS: { id: ActiveView; label: string }[] = [
  { id: "board", label: "Board" },
  { id: "list", label: "List" },
  { id: "calendar", label: "Calendar" },
  { id: "dashboard", label: "Dashboard" },
];

interface TopbarProps {
  onNewTask?: () => void;
}

export function Topbar({ onNewTask }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { orgs, spaces, activeOrgId, activeSpaceId, activeView, setActiveView } = useAppContext();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useSession();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
      clearSession();
      window.location.href = "/login";
    }
  }

  const activeOrg = orgs.find((o) => o.id === activeOrgId);
  const activeSpace = spaces.find((s) => s.id === activeSpaceId);

  return (
    <div className="flex-shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      {/* ── Top bar row ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 h-[56px] gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13.5px] min-w-0">
          {activeOrg && (
            <>
              <span className="text-[var(--text-tertiary)] truncate">{activeOrg.name}</span>
              {activeSpace && (
                <>
                  <span className="text-[var(--text-tertiary)]">/</span>
                  <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                    {activeSpace.icon && (
                      <span className="text-base leading-none">{activeSpace.icon}</span>
                    )}
                    {activeSpace.name}
                  </span>
                </>
              )}
              {!activeSpace && (
                <>
                  <span className="text-[var(--text-tertiary)]">/</span>
                  <span className="font-medium text-[var(--text-primary)]">Dashboard</span>
                </>
              )}
            </>
          )}
          {!activeOrg && (
            <span className="text-[var(--text-secondary)]">WorkFlow</span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Filter — only show when viewing a space */}
          {activeSpaceId && (
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] transition-colors cursor-pointer border border-[var(--border-subtle)] hover:border-[var(--border-default)]"
              aria-label="Filter tasks"
            >
              <Filter size={13} />
              <span>Filter</span>
            </button>
          )}

          {/* New Task button */}
          {activeSpaceId && (
            <button
              onClick={onNewTask}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-[var(--accent-primary)] text-white rounded-[var(--radius-md)] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
              aria-label="Create new task"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* ── User Avatar + Dropdown ──────────────────── */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              {/* Trigger Avatar Button */}
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 hover:ring-2 hover:ring-blue-400/40 text-white font-bold text-[13px] flex items-center justify-center cursor-pointer transition-all shadow-md focus:outline-none"
                title="Account menu"
                aria-label="Open account menu"
              >
                {user.email ? user.email[0].toUpperCase() : "U"}
              </button>

              {/* ── Premium Dropdown ─────────────────────── */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden z-50"
                  style={{
                    top: "44px",
                    width: "250px",
                    boxShadow: "var(--shadow-lg)",
                    animation: "dropdownIn 0.15s cubic-bezier(0.16,1,0.3,1) forwards",
                  }}
                >
                  {/* ── User Info Section ─────────────────── */}
                  <div style={{ padding: "16px 16px 12px 16px" }}>
                    <div className="flex items-center" style={{ gap: "12px" }}>
                      {/* Avatar */}
                      <div
                        className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ width: "36px", height: "36px", fontSize: "14px", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}
                      >
                        {user.email ? user.email[0].toUpperCase() : "U"}
                      </div>

                      {/* Text info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[var(--text-tertiary)] uppercase font-semibold"
                          style={{ fontSize: "9px", letterSpacing: "0.1em", marginBottom: "1px" }}
                        >
                          Active User
                        </div>
                        <div
                          className="text-[var(--text-primary)] font-semibold truncate"
                          style={{ fontSize: "14px", lineHeight: "1.2" }}
                        >
                          {user.name || user.email?.split("@")[0]}
                        </div>
                        <div
                          className="text-[var(--text-secondary)] truncate"
                          style={{ fontSize: "11.5px", marginTop: "1px" }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="bg-[var(--border-subtle)]"
                    style={{ height: "1px", margin: "0 12px" }}
                  />

                  {/* ── Logout Section ────────────────────── */}
                  <div style={{ padding: "8px" }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center text-[var(--danger)] hover:bg-[var(--bg-hover)] rounded-lg font-medium transition-all duration-150 cursor-pointer"
                      style={{ gap: "8px", padding: "8px 12px", fontSize: "12.5px" }}
                    >
                      <LogOut size={14} className="flex-shrink-0" />
                      <span>Log out of account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── View Toggle Tabs ─────────────────────────────── */}
      {activeSpaceId && (
        <div className="flex items-center gap-2 px-6 border-t border-[var(--border-subtle)]">
          {VIEW_TABS.map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                aria-selected={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}