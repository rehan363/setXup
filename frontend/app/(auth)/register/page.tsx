"use client";

/**
 * frontend/app/(auth)/register/page.tsx  —  T020 (US1)
 *
 * Registration page. On success: auto-logs in, stores session, redirects.
 * Acceptance scenarios covered:
 *   ✓ New user registers → account created
 *   ✓ Duplicate email → inline 409 error
 *   ✓ Password < 8 chars → client-side validation error
 *   ✓ Loading state while request is in-flight
 *   ✓ Keyboard accessible
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api, ApiError } from "@/lib/api-client";
import { setSession, getToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);

  // Redirect already-authenticated users
  useEffect(() => {
    if (getToken()) router.replace("/dashboard");
  }, [router]);

  // Focus email on mount
  useEffect(() => { emailRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!email.trim())      { setError("Email is required."); return; }
    if (password.length < 8){ setError("Password must be at least 8 characters."); return; }
    if (password !== confirm){ setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      // 1. Register
      await api.auth.register({ email: email.trim(), password });

      // 2. Auto-login so the user lands in the app immediately
      const { token, user } = await api.auth.login({ email: email.trim(), password });
      setSession(token, user);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("That email is already registered. Try logging in.");
        } else if (err.status === 400) {
          setError(err.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-card">
        {/* Brand */}
        <p className="auth-logo">set<span>X</span>up<span>.</span></p>
        <p className="auth-tagline">Create your account</p>

        {/* Error banner */}
        {error && (
          <div className="alert-error" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate aria-label="Create account form">
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Email
            </label>
            <input
              ref={emailRef}
              id="reg-email"
              className="form-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Password
              <span style={{ fontWeight: 400, marginLeft: "0.25rem" }}>
                (min 8 characters)
              </span>
            </label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">
              Confirm password
            </label>
            <input
              id="reg-confirm"
              className={`form-input${confirm && confirm !== password ? " error" : ""}`}
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
            />
            {confirm && confirm !== password && (
              <span className="form-error" aria-live="polite">
                Passwords don&apos;t match
              </span>
            )}
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading
              ? <><span className="spinner" aria-hidden="true" /> Creating account…</>
              : "Create account"}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account?{" "}
          <Link href="/login" className="btn btn-link">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
