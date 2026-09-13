import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <Home className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <p className="text-blue-500 font-semibold text-lg mb-2">
          404
        </p>

        <h1 className="text-4xl font-bold text-white mb-4">
          Page Not Found
        </h1>

        <p className="text-slate-400 mb-8 leading-relaxed">
          Sorry, the page you are looking for does not exist
          or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}