"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Terminal, Lock, Mail, ArrowRight, ShieldAlert, ShieldCheck, KeyRound } from "lucide-react";
import * as api from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message || "OTP generated and emailed successfully.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to trigger recovery. Check email exists.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.verifyOTP(email, otp);
      setMessage(res.message || "OTP validated. Proceed to reset password.");
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Invalid or expired 6-digit OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({ email, otp, new_password: newPassword });
      setMessage(res.message || "Password successfully changed.");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
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

      {/* Forgot Box */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card-bg border border-card-border rounded-2xl p-8 shadow-xl space-y-6">

          {/* Header depending on step */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {step === 1 && "Password Recovery"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Reset Password"}
            </h1>
            <p className="text-xs font-mono text-text-muted">
              {step === 1 && "system_gateway:request_otp_token"}
              {step === 2 && "system_gateway:verify_secure_otp"}
              {step === 3 && "system_gateway:change_credentials"}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-mono flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg text-xs font-mono flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* STEP 1: Input Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4 font-mono text-sm">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Input 6-Digit OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4 font-mono text-sm">
              <div className="space-y-1">
                <label htmlFor="otp" className="block text-xs uppercase text-text-muted font-bold">6-Digit Verification Code</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-text-muted">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    pattern="\d{6}"
                    className="w-full bg-background border border-card-border rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 font-sans text-sm tracking-widest font-bold"
                    required
                  />
                </div>
                <p className="text-[10px] text-text-muted mt-1">Check Celery logs or your inbox. Valid for 10 minutes.</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-background border border-card-border hover:bg-card-bg text-foreground py-3 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Change Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4 font-mono text-sm">
              <div className="space-y-1">
                <label htmlFor="new-password" className="block text-xs uppercase text-text-muted font-bold">New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-text-muted">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
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
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-card-border text-white py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm Change</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center font-mono text-xs text-text-muted border-t border-card-border pt-4">
            Remembered password?{" "}
            <Link href="/admin/login" className="text-primary-500 hover:underline">
              login_gateway
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 text-center font-mono text-xs text-text-muted border-t border-card-border">
        <span>© {new Date().getFullYear()} mandell.tech • Password Recovery Wizard</span>
      </footer>
    </div>
  );
}
