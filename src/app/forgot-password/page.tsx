"use client";
/**
 * InvestOre Analytics - Forgot Password Page
 */
import { getPublicApiV1Url } from '@/lib/public-api-url';
import { useState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${getPublicApiV1Url()}/auth/forgot-password?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      // Always show success (prevents email enumeration)
      setSuccess(true);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-metallic-950 via-metallic-900 to-metallic-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-metallic-800/50 backdrop-blur-xl border border-metallic-700 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-slate-400 mb-6">
              If an account exists with <strong className="text-white">{email}</strong>, 
              we&apos;ve sent password reset instructions.
            </p>

            <div className="bg-metallic-700/50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-slate-400">
                <strong className="text-slate-300">Didn&apos;t receive the email?</strong>
                <br />• Check your spam or junk folder
                <br />• Make sure you entered the correct email
                <br />• Wait a few minutes and try again
              </p>
            </div>

            <Link 
              href="/login"
              className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-primary-500/25"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-950 via-metallic-900 to-metallic-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">
              Invest<span className="text-primary-500">Ore</span>
            </h1>
          </Link>
        </div>

        <div className="bg-metallic-800/50 backdrop-blur-xl border border-metallic-700 rounded-2xl p-8 shadow-2xl">
          <Link 
            href="/login"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
          <p className="text-slate-400 mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-metallic-700/50 border border-metallic-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
