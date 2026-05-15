/**
 * frontend/app/(auth)/layout.tsx
 * Layout wrapper for all auth pages (login + register).
 * Renders only the page content — no nav, no sidebar.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
