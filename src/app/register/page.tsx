"use client";
/**
 * InvestOre Analytics - Secure Registration Page
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, EyeOff, Mail, Lock, User, AlertCircle, 
  CheckCircle, Loader2, Shield, Check, X
} from "lucide-react";
import { getPublicApiV1Url } from "@/lib/public-api-url";

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Check password strength in real-time
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

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
    
    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements");
      return;
    }
    
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }
    
    if (!formData.acceptTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiV1Url = getPublicApiV1Url();

      const response = await fetch(
        `${apiV1Url}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.fullName
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
        throw new Error(data.detail || "Registration failed");
      }

      setSuccess(true);
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

  // Success state - show check email message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-metallic-950 via-metallic-900 to-metallic-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="bg-metallic-800/50 backdrop-blur-xl border border-metallic-700 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-teal-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-slate-400 mb-6">
              We&apos;ve sent a verification link to <strong className="text-white">{formData.email}</strong>. Please click the link to verify your account.
            </p>

            <div className="bg-metallic-700/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-slate-300 mb-2">What happens next:</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-teal-400 text-xs font-bold">1</span>
                  Check your inbox (and spam folder)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-teal-400 text-xs font-bold">2</span>
                  Click the verification link in the email
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-teal-400 text-xs font-bold">3</span>
                  Log in and start exploring mining data
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link 
                href="/login"
                className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-primary-500/25 text-center"
              >
                Go to Login
              </Link>
              <p className="text-slate-500 text-sm">
                Didn&apos;t receive the email?{" "}
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-primary-400 hover:text-primary-300"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <li className={`flex items-center gap-2 text-sm ${met ? "text-green-400" : "text-slate-400"}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {text}
    </li>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-950 via-metallic-900 to-metallic-950 flex items-center justify-center p-4 py-12">
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

        {/* Registration Card */}
        <div className="bg-metallic-800/50 backdrop-blur-xl border border-metallic-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 mb-6">Start your mining intelligence journey</p>

          {/* Error message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-3 bg-metallic-700/50 border border-metallic-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 bg-metallic-700/50 border border-metallic-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 bg-metallic-700/50 border border-metallic-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password requirements */}
              {formData.password && (
                <ul className="mt-3 space-y-1">
                  <PasswordRequirement met={passwordStrength.hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={passwordStrength.hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={passwordStrength.hasLowercase} text="One lowercase letter" />
                  <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                  <PasswordRequirement met={passwordStrength.hasSpecialChar} text="One special character (!@#$%^&*)" />
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 bg-metallic-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    formData.confirmPassword && !passwordsMatch 
                      ? "border-red-500" 
                      : passwordsMatch && formData.confirmPassword 
                        ? "border-green-500" 
                        : "border-metallic-600"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Terms acceptance */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="w-4 h-4 mt-1 rounded border-metallic-600 bg-metallic-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
              />
              <span className="text-sm text-slate-400">
                I agree to the{" "}
                <Link href="/terms" className="text-primary-500 hover:text-primary-400">
                  Terms of Service
                </Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-primary-500 hover:text-primary-400">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch || !formData.acceptTerms}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-slate-400">
            Already have an account?{" "}
            <Link 
              href="/login"
              className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Security notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Shield className="w-4 h-4" />
          <span>Your data is encrypted and stored securely</span>
        </div>
      </div>
    </div>
  );
}
