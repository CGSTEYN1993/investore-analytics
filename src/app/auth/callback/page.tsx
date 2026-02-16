"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing login...");

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const expiresIn = searchParams.get("expires_in");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(error);
      return;
    }

    if (!accessToken) {
      setStatus("error");
      setMessage("No authentication token received");
      return;
    }

    // Store tokens
    try {
      localStorage.setItem("access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      if (expiresIn) {
        const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
        localStorage.setItem("token_expiry", expiryTime.toString());
      }

      setStatus("success");
      setMessage("Login successful! Redirecting...");

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      setStatus("error");
      setMessage("Failed to save authentication data");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {status === "processing" && (
              <div className="w-20 h-20 mx-auto bg-teal-500/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
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
            {status === "processing" && "Completing Sign In"}
            {status === "success" && "Welcome Back!"}
            {status === "error" && "Sign In Failed"}
          </h1>

          {/* Message */}
          <p className="text-slate-300">{message}</p>

          {/* Error Actions */}
          {status === "error" && (
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
