"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyle = {
    border: "1px solid #e8e6e1",
    backgroundColor: "#fafaf8",
    color: "#2c2825",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#c4947a";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#e8e6e1";
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      // Auto-login after successful signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        setError("Account created but sign-in failed. Please try logging in.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div
        className="rounded-xl p-8"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e8e6e1",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="font-bold">Command</span>
            <span className="italic font-normal"> Center</span>
          </h1>
          <p
            className="text-sm tracking-wide"
            style={{ fontFamily: "var(--font-body)", color: "#8a8580" }}
          >
            Create your account
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: "#c4626a10",
              color: "#c4626a",
              border: "1px solid #c4626a20",
              fontFamily: "var(--font-body)",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-medium mb-1.5 tracking-wide uppercase"
              style={{ color: "#6b6560" }}
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              className="w-full rounded-lg px-4 h-11 text-sm outline-none transition-all duration-200"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium mb-1.5 tracking-wide uppercase"
              style={{ color: "#6b6560" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg px-4 h-11 text-sm outline-none transition-all duration-200"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium mb-1.5 tracking-wide uppercase"
              style={{ color: "#6b6560" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              minLength={8}
              className="w-full rounded-lg px-4 h-11 text-sm outline-none transition-all duration-200"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-medium mb-1.5 tracking-wide uppercase"
              style={{ color: "#6b6560" }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full rounded-lg px-4 h-11 text-sm outline-none transition-all duration-200"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg h-11 text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#c4947a",
              color: "#ffffff",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#b5856b";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c4947a")}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: "#e8e6e1" }} />
          <span
            className="text-xs tracking-wide"
            style={{ color: "#a09a95", fontFamily: "var(--font-body)" }}
          >
            or continue with
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#e8e6e1" }} />
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3" style={{ fontFamily: "var(--font-body)" }}>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full rounded-lg h-11 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer"
            style={{
              border: "1px solid #e8e6e1",
              backgroundColor: "#ffffff",
              color: "#2c2825",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafaf8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
            className="w-full rounded-lg h-11 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer"
            style={{
              border: "1px solid #e8e6e1",
              backgroundColor: "#ffffff",
              color: "#2c2825",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fafaf8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </button>
        </div>

        {/* Sign In Link */}
        <p
          className="text-center text-sm mt-6"
          style={{ color: "#8a8580", fontFamily: "var(--font-body)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium transition-colors duration-200"
            style={{ color: "#c4947a" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#b5856b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#c4947a")}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
