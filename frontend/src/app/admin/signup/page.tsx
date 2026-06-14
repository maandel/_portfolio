"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Terminal, Lock, Mail, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import * as api from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminSignup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.adminSignup({ email, password });
      setSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to register account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg relative flex flex-col justify-between">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-card-border bg-background/50">
        <div className="flex items-center space-x-2 font-mono font-bold text-primary-500">
          <Terminal className="w-5 h-5" />
          <span>mandell.tech/admin</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Signup Box */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card-bg border border-card-border rounded-2xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Admin Registration</h1>
            <p className="text-xs font-mono text-text-muted">system_gateway:register_account</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-mono flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Registration completed! Routing to login gateway...</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 font-mono text-sm">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-xs uppercase text-text-muted font-bold">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-text-muted">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mandell.tech"
                  className="w-full bg-background border border-card-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 font-sans text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs uppercase text-text-muted font-bold">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-text-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-background border border-card-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 font-sans text-sm"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirm-password" className="block text-xs uppercase text-text-muted font-bold">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-text-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-background border border-card-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 font-sans text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center font-mono text-xs text-text-muted border-t border-card-border pt-4">
            Already registered?{" "}
            <Link href="/admin/login" className="text-primary-500 hover:underline">
              login_gateway
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center font-mono text-xs text-text-muted border-t border-card-border">
        <span>© {new Date().getFullYear()} mandell.tech • Authorization Required</span>
      </footer>
    </div>
  );
}
