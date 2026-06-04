"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toast = React.useMemo(() => ({
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    info: (msg: string) => addToast(msg, "info"),
    warning: (msg: string) => addToast(msg, "warning"),
  }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div className="fixed bottom-4 right-4 z-[999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let bgClass = "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)]";
          let icon = <Info className="text-[var(--priority-low)]" size={18} />;

          if (t.type === "success") {
            bgClass = "bg-[var(--bg-elevated)] border-[rgba(76,175,135,0.3)] text-[var(--text-primary)]";
            icon = <CheckCircle className="text-[var(--success)]" size={18} />;
          } else if (t.type === "error") {
            bgClass = "bg-[var(--bg-elevated)] border-[rgba(244,67,54,0.3)] text-[var(--text-primary)]";
            icon = <AlertCircle className="text-[var(--priority-urgent)]" size={18} />;
          } else if (t.type === "warning") {
            bgClass = "bg-[var(--bg-elevated)] border-[rgba(255,179,0,0.3)] text-[var(--text-primary)]";
            icon = <AlertCircle className="text-[var(--priority-medium)]" size={18} />;
          }

          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border shadow-[var(--shadow-lg)] transition-all duration-300 pointer-events-auto animate-in slide-in-from-right-5 ${bgClass}`}
              role="alert"
            >
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 text-sm font-medium pr-2">{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
