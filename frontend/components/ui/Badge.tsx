"use client";

import React from "react";

type BadgeVariant = "urgent" | "high" | "medium" | "low" | "none" | "default" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Render a dot + label with custom color (alternative API) */
  label?: string;
  color?: string;
  size?: BadgeSize;
  children?: React.ReactNode;
}

export function Badge({
  variant = "default",
  label,
  color,
  size = "md",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";

  // Custom color badge (used by TaskCard etc.)
  if (label !== undefined && color !== undefined) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClass} ${className}`}
        style={{ backgroundColor: `${color}20`, color }}
        {...props}
      >
        {label}
      </span>
    );
  }

  let classes = "badge ";
  switch (variant) {
    case "urgent":  classes += "badge-urgent"; break;
    case "high":    classes += "badge-high"; break;
    case "medium":  classes += "badge-medium"; break;
    case "low":     classes += "badge-low"; break;
    case "none":    classes += "badge-none"; break;
    case "success": classes += "bg-[rgba(76,175,135,0.12)] text-[var(--success)]"; break;
    case "warning": classes += "bg-[rgba(255,179,0,0.12)] text-[var(--priority-medium)]"; break;
    case "danger":  classes += "bg-[rgba(244,67,54,0.12)] text-[var(--priority-urgent)]"; break;
    case "info":    classes += "bg-[rgba(66,165,245,0.12)] text-[var(--priority-low)]"; break;
    default:        classes += "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"; break;
  }

  return (
    <span
      className={`${classes} font-medium rounded-full inline-flex items-center gap-1.5 ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
