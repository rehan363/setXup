"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Settings, ShieldAlert, Palette, AlertCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";

export function SettingsView() {
  const { activeOrgId, orgs, refreshOrgs } = useAppContext();
  const activeOrg = orgs.find((o) => o.id === activeOrgId);

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [brandColor, setBrandColor] = useState("#6C47FF");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (activeOrg) {
      setName(activeOrg.name);
      setLogoUrl(activeOrg.logo_url ?? "");
      setBrandColor(activeOrg.brand_color ?? "#6C47FF");
    }
  }, [activeOrg]);

  const colors = [
    { value: "#6C47FF", label: "Purple" },
    { value: "#0EA5E9", label: "Blue" },
    { value: "#10B981", label: "Green" },
    { value: "#F59E0B", label: "Orange" },
    { value: "#EF4444", label: "Red" },
    { value: "#8B5CF6", label: "Violet" },
    { value: "#EC4899", label: "Pink" },
    { value: "#14B8A6", label: "Teal" },
  ];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !activeOrgId) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.orgs.update(activeOrgId, {
        name: name.trim(),
        logo_url: logoUrl.trim() || null as any,
        brand_color: brandColor,
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

          {/* Logo URL */}
          <div className="flex flex-col gap-2">
            <label htmlFor="logo-url" className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Logo Image URL
            </label>
            <input
              id="logo-url"
              type="url"
              disabled={isSaving}
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-4 py-2.5 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none transition-all"
            />
          </div>

          {/* Brand Color */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <Palette size={12} /> Workspace Brand Color
            </span>
            <div className="flex items-center gap-2.5 py-1.5 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  disabled={isSaving}
                  onClick={() => setBrandColor(color.value)}
                  style={{ backgroundColor: color.value }}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 active:scale-95 cursor-pointer relative ${
                    brandColor === color.value 
                      ? "ring-2 ring-offset-2 ring-[var(--accent-primary)] scale-110" 
                      : "opacity-80 hover:opacity-100"
                  }`}
                  title={color.label}
                />
              ))}
            </div>
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
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-[12px] font-semibold rounded-[var(--radius-md)] cursor-not-allowed opacity-60 shadow-sm"
              title="Delete workspace is currently restricted"
              disabled
            >
              Delete Organization
            </button>
          </div>
        </div>
      </div>
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
