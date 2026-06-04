"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAppContext } from "@/components/AppContext";
import { useSession } from "@/lib/auth";
import { Space, api } from "@/lib/api-client";

interface SidebarProps {
  onNewSpace?: () => void;
}

export function Sidebar({ onNewSpace }: SidebarProps) {
  const { user } = useSession();
  const {
    orgs,
    spaces,
    activeOrgId,
    activeSpaceId,
    setActiveSpaceId,
    setActiveView,
    activeView,
    isLoadingOrgs,
    isLoadingSpaces,
    refreshSpaces,
  } = useAppContext();

  const [collapsed, setCollapsed] = useState(false);
  const [expandedSpaces, setExpandedSpaces] = useState<Set<number>>(new Set());

  const [spaceToDelete, setSpaceToDelete] = useState<{ id: number; name: string } | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDeleteSpace(spaceId: number, spaceName: string) {
    setSpaceToDelete({ id: spaceId, name: spaceName });
    setConfirmName("");
  }

  async function confirmDeleteSpace() {
    if (!spaceToDelete) return;
    setIsDeleting(true);
    try {
      await api.spaces.delete(spaceToDelete.id);
      refreshSpaces();
      if (activeSpaceId === spaceToDelete.id) {
        setActiveSpaceId(null);
        setActiveView("dashboard");
      }
      setSpaceToDelete(null);
      setConfirmName("");
    } catch (err: any) {
      alert(err?.message ?? "Failed to delete space");
    } finally {
      setIsDeleting(false);
    }
  }

  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  function toggleSpaceExpand(spaceId: number) {
    setExpandedSpaces((prev) => {
      const next = new Set(prev);
      if (next.has(spaceId)) next.delete(spaceId);
      else next.add(spaceId);
      return next;
    });
  }

  function handleSpaceClick(space: Space) {
    setActiveSpaceId(space.id);
    setActiveView("board");
  }

  function handleDashboard() {
    setActiveSpaceId(null);
    setActiveView("dashboard");
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const isSpaceActive = (spaceId: number) => activeSpaceId === spaceId;
  const isDashboardActive = activeView === "dashboard" && activeSpaceId === null;
  const isMyTasksActive = activeView === "list" && activeSpaceId === null;

  return (
    <aside
      className={`flex flex-col h-screen sticky top-0 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all duration-200 flex-shrink-0 ${
        collapsed ? "rigid-sidebar-collapsed" : "rigid-sidebar"
      }`}
    >
      {/* ── Org Switcher / Logo ─────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] min-h-[56px]">
        {!collapsed && (
          <>
            <div
              className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: activeOrg?.brand_color ?? "#6C47FF" }}
            >
              {activeOrg ? getInitials(activeOrg.name) : "W"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate leading-tight">
                {activeOrg?.name ?? "WorkFlow"}
              </p>
              {orgs.length > 1 && (
                <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                  {orgs.length} workspaces
                </p>
              )}
            </div>
          </>
        )}
        {collapsed && (
          <div
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-white text-xs font-bold mx-auto"
            style={{ backgroundColor: activeOrg?.brand_color ?? "#6C47FF" }}
          >
            {activeOrg ? getInitials(activeOrg.name) : "W"}
          </div>
        )}
      </div>

      {/* ── Collapse Toggle ─────────────────────────────── */}

      {/* ── Nav Items ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5">
        {/* Dashboard */}
        <NavItem
          icon={<LayoutDashboard size={16} />}
          label="Dashboard"
          collapsed={collapsed}
          active={isDashboardActive}
          onClick={handleDashboard}
        />

        {/* My Tasks */}
        <NavItem
          icon={<CheckSquare size={16} />}
          label="My Tasks"
          collapsed={collapsed}
          active={isMyTasksActive}
          onClick={() => {
            setActiveSpaceId(null);
            setActiveView("list");
          }}
        />

        {/* Divider + Spaces Label */}
        <div className={`mt-6 mb-2.5 ${collapsed ? "px-0" : "px-1"}`}>
          {!collapsed && (
            <p className="text-[11px] uppercase font-semibold text-[var(--text-tertiary)] tracking-widest">
              Spaces
            </p>
          )}
          {collapsed && <div className="h-px bg-[var(--border-subtle)] mx-1" />}
        </div>

        {/* Spaces list */}
        {isLoadingSpaces && (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={16} className="animate-spin text-[var(--text-tertiary)]" />
          </div>
        )}

        {!isLoadingSpaces &&
          spaces.map((space) => {
            const isActive = isSpaceActive(space.id);
            const isExpanded = expandedSpaces.has(space.id);

            return (
              <div key={space.id} className="relative group">
                <div
                  onClick={() => {
                    handleSpaceClick(space);
                    if (!collapsed) toggleSpaceExpand(space.id);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left transition-all duration-150 cursor-pointer group ${
                    isActive
                      ? "bg-[var(--accent-light)] text-[var(--accent-primary)] border-l-[3px] border-[var(--accent-primary)] pl-[10px]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
                  title={collapsed ? space.name : undefined}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Space Icon */}
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 text-base leading-none text-center">
                      {space.icon ?? "◆"}
                    </span>

                    {!collapsed && (
                      <span className="flex-1 text-[13px] font-medium truncate">
                        {space.name}
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSpace(space.id, space.name);
                      }}
                      className="p-1 rounded-[6px] hover:bg-red-500/10 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex-shrink-0"
                      title="Delete space"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {/* + New Space */}
        {!collapsed ? (
          <button
            onClick={onNewSpace}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors text-[13px] cursor-pointer border border-dashed border-[var(--border-default)] hover:border-[var(--border-strong)]"
          >
            <Plus size={14} />
            <span>New Space</span>
          </button>
        ) : (
          <button
            onClick={onNewSpace}
            className="w-full flex items-center justify-center p-2 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
            title="New Space"
          >
            <Plus size={16} />
          </button>
        )}

        {/* Loading orgs indicator */}
        {isLoadingOrgs && !collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 text-[var(--text-tertiary)] text-xs">
            <Loader2 size={12} className="animate-spin" />
            Loading workspaces...
          </div>
        )}

        {/* No org state */}
        {!isLoadingOrgs && orgs.length === 0 && !collapsed && (
          <div className="px-2 py-3 text-center">
            <Building2 size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs text-[var(--text-tertiary)]">No workspace yet</p>
          </div>
        )}
      </nav>

      {/* ── Bottom Items ─────────────────────────────────── */}
      <div className="border-t border-[var(--border-subtle)] py-3 px-3 flex flex-col gap-1">
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer mt-1"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && <span className="text-[12px]">Collapse</span>}
        </button>
      </div>

      {/* Premium Deletion Confirmation Modal */}
      {spaceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
            onClick={() => {
              if (!isDeleting) {
                setSpaceToDelete(null);
                setConfirmName("");
              }
            }}
          />

          {/* Dialog Container */}
          <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[14px] shadow-2xl w-full max-w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col p-6">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <div className="w-9 h-9 rounded-[8px] bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 size={16} />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Delete space
              </h3>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed mb-4">
              Are you sure you want to permanently delete <span className="font-semibold text-[var(--text-primary)]">"{spaceToDelete.name}"</span>?
              All tasks, checklists, custom statuses, and views in this space will be completely erased. This cannot be undone.
            </p>

            <div className="flex flex-col gap-2 mb-5">
              <label className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                Type the space name to confirm
              </label>
              <input
                type="text"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={spaceToDelete.name}
                className="w-full h-[38px] px-3.5 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/35 transition-all placeholder:[var(--text-tertiary)]"
                disabled={isDeleting}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSpaceToDelete(null);
                  setConfirmName("");
                }}
                disabled={isDeleting}
                className="px-4.5 py-2 text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[8px] transition-colors cursor-pointer border border-transparent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSpace}
                disabled={isDeleting || confirmName !== spaceToDelete.name}
                className="px-4.5 py-2 text-[12.5px] font-semibold bg-red-650 hover:bg-red-700 text-white rounded-[8px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-600/10 disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                Delete space
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ── Reusable Nav Item ─────────────────────────────── */
function NavItem({
  icon,
  label,
  collapsed,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-left transition-all duration-150 cursor-pointer ${
        active
          ? "bg-[var(--accent-light)] text-[var(--accent-primary)] font-medium"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">{icon}</span>
      {!collapsed && (
        <>
          <span className="flex-1 text-[13.5px] truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="ml-auto text-[10px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}
