"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api";

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: "TENANT" | "LANDLORD";
      phone?: string | null;
      address?: string | null;
    };
    token: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TENANT" as "TENANT" | "LANDLORD",
    phone: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
        }),
      });

      if (!response.success) {
        throw new Error(response.message || "Registration failed.");
      }

      setSuccess("Registration successful! Redirecting...");

      setTimeout(() => {
        router.push("/auth/login");
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            RentNest
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-slate-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Join RentNest and find your perfect rental.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => handleChange("email", event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                I want to
              </label>

              <select
                id="role"
                value={formData.role}
                onChange={(event) => handleChange("role", event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="TENANT">Rent a Property</option>

                <option value="LANDLORD">List My Property</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Address
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="address"
                value={formData.address}
                onChange={(event) =>
                  handleChange("address", event.target.value)
                }
                placeholder="Enter your address"
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
