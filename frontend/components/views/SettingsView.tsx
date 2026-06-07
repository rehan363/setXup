"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Settings, ShieldAlert, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";

export function SettingsView() {
  const { activeOrgId, orgs, refreshOrgs, setActiveOrgId } = useAppContext();
  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeOrg) {
      setName(activeOrg.name);
    }
  }, [activeOrg]);

  async function handleDeleteWorkspace() {
    if (!activeOrgId || !activeOrg) return;
    setIsDeleting(true);
    setError(null);
    try {
      await api.orgs.delete(activeOrgId);
      
      // Determine the next active organization
      const nextOrgs = await api.orgs.list();
      const remainingOrgs = nextOrgs.filter((o) => o.id !== activeOrgId);
      if (remainingOrgs.length > 0) {
        setActiveOrgId(remainingOrgs[0].id);
      } else {
        setActiveOrgId(null);
      }
      
      await refreshOrgs();
      setShowDeleteModal(false);
      setDeleteConfirmName("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !activeOrgId) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.orgs.update(activeOrgId, {
        name: name.trim(),
      });
      setSuccess("Workspace settings updated successfully!");
      await refreshOrgs();
    } catch (err: any) {
      setError(err?.message ?? "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }

  if (!activeOrg) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <AlertCircle size={24} className="text-[var(--text-tertiary)]" />
        <p className="text-sm text-[var(--text-secondary)]">No active workspace selected.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6 animate-in">
      {/* ── Title Header ─────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
        <Settings size={20} className="text-[var(--accent-primary)]" />
        <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
          Workspace Settings
        </h2>
      </div>

      {/* ── Settings Form Card ────────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 shadow-sm">
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Workspace Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="org-name" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Workspace Name
            </label>
            <input
              id="org-name"
              type="text"
              required
              disabled={isSaving}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-all"
            />
          </div>



          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[var(--radius-lg)] text-xs">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-[var(--radius-lg)] text-xs">
              <CheckCircleIcon size={15} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex justify-end pt-1 border-t border-[var(--border-subtle)] mt-2">
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="px-5 py-2.5 rounded-[var(--radius-lg)] bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-[13px] font-bold shadow-md cursor-pointer transition-colors flex items-center gap-2"
            >
              {isSaving && <Loader2 size={13} className="animate-spin" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* ── Dangerous Area ──────────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-red-500/20 rounded-[var(--radius-xl)] p-5 flex items-start gap-4 shadow-sm bg-red-500/[0.02]">
        <ShieldAlert size={28} className="text-red-500 flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <h4 className="text-[13px] font-bold text-red-600 dark:text-red-500">
            Delete Workspace
          </h4>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            This workspace will be permanently deleted along with all its spaces, lists, comments, activity history, and tasks. This action is irreversible.
          </p>
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmName("");
                setShowDeleteModal(true);
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[12px] font-semibold rounded-[var(--radius-md)] cursor-pointer shadow-sm transition-colors"
            >
              Delete Organization
            </button>
          </div>
        </div>
      </div>

      {/* ── Premium Deletion Confirmation Modal ────────────────── */}
      {showDeleteModal && activeOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur overlay */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
            onClick={() => {
              if (!isDeleting) {
                setShowDeleteModal(false);
                setDeleteConfirmName("");
              }
            }}
          />

          {/* Dialog Container */}
          <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[14px] shadow-2xl w-full max-w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col p-6">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <div className="w-9 h-9 rounded-[8px] bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={16} />
              </div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                Delete workspace
              </h3>
            </div>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed mb-4">
              Are you sure you want to permanently delete the workspace <span className="font-semibold text-[var(--text-primary)]">"{activeOrg.name}"</span>?
              All spaces, folders, lists, comments, checklists, and tasks in this workspace will be completely erased. This action is irreversible.
            </p>

            <div className="flex flex-col gap-2 mb-5">
              <label className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
                Type the workspace name to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                placeholder={activeOrg.name}
                className="w-full h-[38px] px-3.5 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/35 transition-all placeholder:[var(--text-tertiary)]"
                disabled={isDeleting}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmName("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[8px] transition-colors cursor-pointer border border-transparent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWorkspace}
                disabled={isDeleting || deleteConfirmName !== activeOrg.name}
                className="px-4 py-2 text-[12.5px] font-semibold bg-red-650 hover:bg-red-700 text-white rounded-[8px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-md disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
