"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  phone?: string | null;
  address?: string | null;
}

interface MeResponse {
  success: boolean;
  message: string;
  data: User;
}

export default function TenantDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data: MeResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load user information."
          );
        }

        setUser(data.data);
      } catch (err) {
        console.error("Dashboard user error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-96 rounded bg-slate-200" />

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="h-32 rounded-2xl bg-slate-200" />
              <div className="h-32 rounded-2xl bg-slate-200" />
              <div className="h-32 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Unable to load dashboard
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {error || "User information was not found."}
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-6 border-b border-slate-200 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <h2 className="mt-3 font-semibold text-slate-900">
                {user.name}
              </h2>

              <p className="mt-1 truncate text-xs text-slate-500">
                {user.email}
              </p>

              <span className="mt-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                Tenant
              </span>
            </div>

            <nav className="space-y-1">
              <Link
                href="/tenant/dashboard"
                className="block rounded-lg bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600"
              >
                Dashboard
              </Link>

              <Link
                href="/properties"
                className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
              >
                Browse Properties
              </Link>

              <button
                type="button"
                className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
              >
                My Rental Requests
              </button>

              <button
                type="button"
                className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
              >
                Payment History
              </button>

              <button
                type="button"
                className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
              >
                Watchlist
              </button>

              <button
                type="button"
                className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
              >
                My Reviews
              </button>
            </nav>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1">
          <div className="mb-8">
            <p className="text-sm font-medium text-blue-600">
              Tenant Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">
              Welcome, {user.name}!
            </h1>

            <p className="mt-2 text-slate-600">
              Manage your rental activities and find your next home.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Rental Requests
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    0
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  🏠
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Payments
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    0
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl">
                  💳
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Watchlist
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    0
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl">
                  ❤️
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/properties"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="text-2xl">🔎</div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  Find a Property
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Browse available properties and find your next home.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-blue-600">
                  Browse Properties →
                </span>
              </Link>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-2xl">📋</div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  Rental Requests
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Track the status of your rental requests.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-slate-400">
                  Coming soon
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-2xl">💰</div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  Payment History
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  View your rental payment history.
                </p>

                <span className="mt-4 inline-block text-sm font-semibold text-slate-400">
                  Coming soon
                </span>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Profile Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your account information.
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                Account Active
              </span>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Full Name
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Address
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {user.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}