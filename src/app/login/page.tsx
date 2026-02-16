"use client";
/**
 * InvestOre Analytics - Secure Login Page
 */
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getPublicApiV1Url } from "@/lib/public-api-url";
import { 
  Eye, EyeOff, Mail, Lock, AlertCircle, 
  CheckCircle, Loader2, Shield 
} from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ApiError {
  detail: string;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/analysis";
  const verified = searchParams.get("verified");
  const reason = searchParams.get("reason");
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiV1Url = getPublicApiV1Url();

      const response = await fetch(
        `${apiV1Url}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend API is currently unavailable. Please try again later.");
      }

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiError;
        throw new Error(errorData.detail || "Login failed");
      }

      // Store tokens securely
      if (formData.rememberMe) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
      } else {
        sessionStorage.setItem("access_token", data.access_token);
        sessionStorage.setItem("refresh_token", data.refresh_token);
      }

      // Redirect to return URL or analysis dashboard
      router.push(returnUrl);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError("Unable to connect to the server. Please check your internet connection.");
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Auth required warning */}
      {reason === "auth_required" && (
        <div className="mb-6 flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 text-sm font-medium">Authentication Required</p>
            <p className="text-amber-300/70 text-sm mt-1">
              Please sign in to access this page. Your data is protected.
            </p>
          </div>
        </div>
      )}

      {/* Success message for verified email */}
      {verified && (
        <div className="mb-6 flex items-start gap-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-300 text-sm">
            Email verified successfully! You can now log in.
          </p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
      <p className="text-slate-400 mb-6">Sign in to access your dashboard</p>

      {/* Error message */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="current-password"
              className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-400">Remember me</span>
          </label>
          <Link 
            href="/forgot-password"
            className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-slate-600" />
        <span className="text-slate-500 text-sm">secure login</span>
        <div className="flex-1 h-px bg-slate-600" />
      </div>

      {/* Sign up link */}
      <p className="mt-6 text-center text-slate-400">
        Don&apos;t have an account?{" "}
        <Link 
          href="/register"
          className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
        >
          Create Account
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-950 via-metallic-900 to-metallic-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">
              Invest<span className="text-primary-500">Ore</span>
            </h1>
            <p className="text-slate-400 text-sm">Mining Intelligence Platform</p>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-metallic-800/50 backdrop-blur-xl border border-metallic-700 rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>

        {/* Security notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Shield className="w-4 h-4" />
          <span>Secured with industry-standard encryption</span>
        </div>
      </div>
    </div>
  );
}
