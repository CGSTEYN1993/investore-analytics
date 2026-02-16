"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already_verified">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/auth/verify-email?token=${token}`, {
          method: "POST",
        });

        const data = await response.json();

        if (response.ok) {
          if (data.already_verified) {
            setStatus("already_verified");
            setMessage("Your email has already been verified.");
          } else {
            setStatus("success");
            setMessage("Your email has been verified successfully!");
          }
        } else {
          setStatus("error");
          setMessage(data.detail || "Failed to verify email. The link may have expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {status === "loading" && (
              <div className="w-20 h-20 mx-auto bg-teal-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            )}
            {status === "already_verified" && (
              <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-400" />
              </div>
            )}
            {status === "error" && (
              <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "already_verified" && "Already Verified"}
            {status === "error" && "Verification Failed"}
          </h1>

          {/* Message */}
          <p className="text-slate-300 mb-6">{message}</p>

          {/* Actions */}
          {status === "loading" ? (
            <p className="text-slate-400 text-sm">Please wait while we verify your email...</p>
          ) : (
            <div className="space-y-3">
              {(status === "success" || status === "already_verified") && (
                <Link
                  href="/login"
                  className="block w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Continue to Login
                </Link>
              )}
              {status === "error" && (
                <>
                  <Link
                    href="/register"
                    className="block w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Create New Account
                  </Link>
                  <p className="text-slate-400 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-teal-400 hover:text-teal-300">
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Back to Home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-slate-400 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
