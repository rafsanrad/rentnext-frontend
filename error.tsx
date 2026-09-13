"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("RentNest application error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <p className="text-red-500 font-semibold text-lg mb-2">
          Something went wrong
        </p>

        <h1 className="text-3xl font-bold text-white mb-4">
          We could not load this page
        </h1>

        <p className="text-slate-400 mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or
          return to the RentNest homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}