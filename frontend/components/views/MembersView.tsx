"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Users, Shield, User, Mail, Calendar, AlertCircle } from "lucide-react";
import { api, OrgMember } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";

export function MembersView() {
  const { activeOrgId, members, refreshMembers } = useAppContext();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "admin" | "member" | "guest">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeOrgId) {
      loadMembers();
    }
  }, [activeOrgId]);

  async function loadMembers() {
    setIsLoading(true);
    try {
      await refreshMembers();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !activeOrgId) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await api.orgs.inviteMember(activeOrgId, {
        email: email.trim(),
        role: role,
      });
      setSuccess(`Successfully invited ${email}!`);
      setEmail("");
      setRole("member");
      await refreshMembers();
    } catch (err: any) {
      setError(err?.message ?? "Failed to invite user. Please make sure the user is registered.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const roleColors = {
    owner: "badge-urgent", // red
    admin: "badge-high",   // orange
    member: "badge-low",   // blue
    guest: "badge-none",   // gray
  };

  const getInitials = (emailStr: string, nameStr?: string | null) => {
    if (nameStr) {
      return nameStr.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    }
    return emailStr.substring(0, 2).toUpperCase();
  };

  if (isLoading && members.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6 animate-in">
      {/* ── Title Header ─────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-4">
        <Users size={20} className="text-[var(--accent-primary)]" />
        <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
          Workspace Members
        </h2>
      </div>

      {/* ── Invite Form Section ───────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 shadow-sm">
        <h3 className="text-[13px] font-bold text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
          <Plus size={14} className="text-[var(--accent-primary)]" />
          Invite a Member
        </h3>
        <p className="text-[var(--text-tertiary)] text-[12px] mb-4">
          Add members to collaborate in this workspace. Users must be registered with an account to be added.
        </p>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Email */}
          <div className="flex-1 w-full flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={14} className="absolute left-3 text-[var(--text-tertiary)]" />
              <input
                type="email"
                required
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Role */}
          <div className="w-full sm:w-40 flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
              Workspace Role
            </label>
            <div className="relative flex items-center">
              <Shield size={14} className="absolute left-3 text-[var(--text-tertiary)]" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-[var(--text-primary)] text-[13px] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] cursor-pointer"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="w-full sm:w-auto h-[38px] px-5 bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white rounded-[var(--radius-md)] text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Invite
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-1.5 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[var(--radius-md)] text-[12px]">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-3 flex items-center gap-1.5 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-[var(--radius-md)] text-[12px]">
            <CheckCircleIcon size={14} className="flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* ── Members List Section ─────────────────────────── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 shadow-sm flex flex-col gap-3">
        <h3 className="text-[13px] font-bold text-[var(--text-primary)]">
          Active Members ({members.length})
        </h3>

        <div className="flex flex-col gap-0.5">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 py-2.5 px-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] rounded-[var(--radius-md)] transition-colors"
            >
              {/* Initials Avatar */}
              <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm">
                {getInitials(member.email ?? "U", member.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {member.name || member.email?.split("@")[0] || "Active User"}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] truncate flex items-center gap-1">
                  <Mail size={10} />
                  {member.email ?? "no-email@configured.com"}
                </p>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-3">
                <span className={`badge ${roleColors[member.role] || roleColors.member}`}>
                  {member.role}
                </span>

                {/* Joined Date */}
                <span className="text-[10px] text-[var(--text-tertiary)] hidden sm:flex items-center gap-1">
                  <Calendar size={10} />
                  Joined {new Date(member.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          ))}
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
