"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAppContext } from "@/components/AppContext";

const SPACE_ICONS = ["★", "●", "⬡", "☆", "◉"];
const BRAND_COLORS = [
  "#00607a", // Brand Teal Accent
  "#0EA5E9", // Sky Blue
  "#10B981", // Emerald Green
  "#F59E0B", // Amber Gold
  "#EF4444", // Rose Red
];

const TEMPLATES = [
  { id: "software-sprint", name: "Software Dev", icon: "💻" },
  { id: "marketing-campaign", name: "Marketing", icon: "📣" },
  { id: "content-calendar", name: "Content", icon: "📅" },
  { id: "product-roadmap", name: "Product Roadmap", icon: "🗺️" },
  { id: "bug-tracker", name: "Bug Tracker", icon: "🐛" },
  { id: "client-project", name: "Client Project", icon: "💼" },
  { id: "hr-onboarding", name: "HR Onboarding", icon: "👥" },
  { id: "event-planning", name: "Event Planning", icon: "🎪" },
  { id: "blank", name: "Blank Space", icon: "✨" },
];

interface SpaceCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SpaceCreateModal({ onClose, onSuccess }: SpaceCreateModalProps) {
  const { activeOrgId } = useAppContext();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(SPACE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(BRAND_COLORS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !activeOrgId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Step 1: Create the space
      const space = await api.spaces.create(activeOrgId, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });

      // Step 2: Apply template if one was selected
      if (selectedTemplate && selectedTemplate !== "blank") {
        await api.templates.apply(space.id, selectedTemplate);
      } else {
        // Blank Space: create default list and default statuses (To Do, In Progress, Done)
        await api.lists.create(space.id, { name: "Main List" });
        await api.statuses.create(space.id, { name: "To Do", color: "#9E9E9E", type: "open", order: 0 });
        await api.statuses.create(space.id, { name: "In Progress", color: "#42A5F5", type: "open", order: 1 });
        await api.statuses.create(space.id, { name: "Done", color: "#66BB6A", type: "closed", order: 2 });
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create space");
    } finally {
      setIsLoading(false);
    }
  }

  const templatesList = TEMPLATES.filter((t) => t.id !== "blank");
  const blankTemplate = TEMPLATES.find((t) => t.id === "blank");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay with high-performance backdrop blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Dialog — Made significantly wider (max-w-[540px]) */}
      <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[16px] shadow-2xl w-full max-w-[540px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-wide">
            Create new space
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[8px] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-6 overflow-y-auto">
          {/* Space Name */}
          <div className="flex flex-col gap-2.5 mt-1">
            <label htmlFor="space-name" className="text-[12px] font-medium text-[var(--text-secondary)]">
              Space name
            </label>
            <input
              id="space-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product Engineering"
              autoFocus
              required
              className="w-full max-w-[380px] h-[40px] px-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-[14px] placeholder:[var(--text-tertiary)] focus:outline-none focus:ring-4 focus:ring-[#00607a]/15 focus:border-[#00607a] transition-all"
            />
          </div>

          {/* Icon Selection */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">
              Icon
            </label>
            <div className="flex items-center justify-center p-3 rounded-[12px] bg-[var(--bg-primary)] border border-[var(--border-subtle)]" style={{ gap: '16px' }}>
              {SPACE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-9 h-9 text-base rounded-[8px] flex items-center justify-center transition-all cursor-pointer flex-shrink-0 hover:scale-105 active:scale-95 ${selectedIcon === icon
                      ? "bg-[var(--accent-light)] text-[var(--accent-primary)] border-2 border-[var(--accent-primary)] shadow-sm font-bold scale-105"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent"
                    }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">
              Color
            </label>
            <div className="flex items-center justify-center p-3 rounded-[12px] bg-[var(--bg-primary)] border border-[var(--border-subtle)]" style={{ gap: '20px' }}>
              {BRAND_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full flex-shrink-0 transition-all cursor-pointer hover:scale-110 active:scale-95 ${selectedColor === color
                      ? "ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-elevated)] scale-110"
                      : "border border-[var(--border-subtle)] opacity-85 hover:opacity-100 hover:scale-105"
                    }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Template */}
          <div className="flex flex-col gap-3">
            <label className="text-[12px] font-medium text-[var(--text-secondary)]">
              Start from template
            </label>
            <div className="grid grid-cols-2 gap-3">
              {templatesList.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setSelectedTemplate(
                      selectedTemplate === t.id ? null : t.id
                    )
                  }
                  className={`flex items-center gap-3 px-4 py-3 h-[46px] rounded-[12px] transition-all cursor-pointer border text-left hover:scale-[1.02] active:scale-[0.98] ${selectedTemplate === t.id
                      ? "border-[var(--accent-primary)] bg-[var(--accent-light)] text-[var(--accent-primary)] font-semibold shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  <span className="text-base flex-shrink-0">{t.icon}</span>
                  <span className="text-[13px] font-medium leading-tight truncate text-[var(--text-primary)]">{t.name}</span>
                </button>
              ))}
            </div>

            {/* Blank Space option */}
            {blankTemplate && (
              <button
                type="button"
                onClick={() => setSelectedTemplate(selectedTemplate === "blank" ? null : "blank")}
                className={`mt-2 w-full flex items-center justify-between px-5 py-4 rounded-[12px] transition-all cursor-pointer border border-dashed hover:scale-[1.01] active:scale-[0.99] ${selectedTemplate === "blank"
                    ? "border-[var(--accent-primary)] bg-[var(--accent-light)] text-[var(--accent-primary)] font-semibold shadow-sm"
                    : "border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{blankTemplate.icon}</span>
                  <span className="text-[13.5px] font-medium text-[var(--text-primary)]">{blankTemplate.name}</span>
                </div>
                <span className="text-[11px] text-[var(--text-tertiary)] font-medium">Start from scratch</span>
              </button>
            )}
          </div>

          {error && (
            <p className="text-[12px] text-[var(--danger)] bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-[12px]">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-5 border-t border-[var(--border-subtle)] mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[12px] transition-all cursor-pointer border border-transparent active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-5 py-2 text-[13px] font-semibold bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white rounded-[12px] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
            >
              {isLoading && <Loader2 size={13} className="animate-spin" />}
              Create space
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
