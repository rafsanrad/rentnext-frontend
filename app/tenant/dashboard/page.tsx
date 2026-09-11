"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Home,
  ClipboardList,
  Heart,
  User,
  LogOut,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
  Ban,
  MapPin,
  BedDouble,
  Bath,
  CalendarDays,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  phone?: string | null;
  address?: string | null;
  isBanned?: boolean;
  createdAt?: string;
}

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string | null;
  status: "AVAILABLE" | "RENTED" | "UNAVAILABLE";
}

interface Payment {
  id: string;
  status?: string;
  amount?: number;
  createdAt?: string;
}

interface RentalRequest {
  id: string;
  tenantId: string;
  propertyId: string;
  moveInDate: string;
  message?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
  property: Property;
  payment?: Payment | null;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: UserData;
}

interface RentalRequestsResponse {
  success: boolean;
  message: string;
  data: RentalRequest[];
}

const formatCurrency = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date: string) => {
  if (!date) {
    return "N/A";
  }

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusStyles = (status: RentalRequest["status"]) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock3,
      };

    case "APPROVED":
      return {
        label: "Approved",
        className: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle2,
      };

    case "REJECTED":
      return {
        label: "Rejected",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      };

    case "CANCELLED":
      return {
        label: "Cancelled",
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: Ban,
      };

    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: AlertCircle,
      };
  }
};

export default function TenantDashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);

  const [isUserLoading, setIsUserLoading] = useState(true);

  const [isRequestsLoading, setIsRequestsLoading] = useState(true);

  const [userError, setUserError] = useState("");
  const [requestsError, setRequestsError] = useState("");

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [cancelSuccess, setCancelSuccess] = useState("");

  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsUserLoading(true);
        setUserError("");

        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        const data: AuthResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load user information.");
        }

        setUser(data.data);
      } catch (error) {
        console.error("Tenant dashboard user error:", error);

        setUserError(
          error instanceof Error
            ? error.message
            : "Unable to load user information.",
        );
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchRentalRequests = async () => {
  try {
    setIsRequestsLoading(true);
    setRequestsError("");

    const response = await fetch(
      "/api/rental-requests/my",
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data: RentalRequestsResponse =
      await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message ||
          "Unable to load rental requests."
      );
    }

    // Only show active rental requests.
    // Cancelled requests remain in the database
    // but should not appear on the tenant dashboard.
    const activeRequests = (data.data || []).filter(
      (request) => request.status !== "CANCELLED"
    );

    setRentalRequests(activeRequests);
  } catch (error) {
    console.error(
      "Rental requests error:",
      error
    );

    setRequestsError(
      error instanceof Error
        ? error.message
        : "Unable to load rental requests."
    );
  } finally {
    setIsRequestsLoading(false);
  }
};

    fetchRentalRequests();
  }, []);

  const stats = useMemo(() => {
    return {
      total: rentalRequests.length,

      pending: rentalRequests.filter((request) => request.status === "PENDING")
        .length,

      approved: rentalRequests.filter(
        (request) => request.status === "APPROVED",
      ).length,

      rejected: rentalRequests.filter(
        (request) => request.status === "REJECTED",
      ).length,
    };
  }, [rentalRequests]);

  const handleCancelRequest = async (requestId: string) => {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this rental request?",
    );

    if (!shouldCancel) {
      return;
    }

    try {
      setCancellingId(requestId);
      setCancelError("");
      setCancelSuccess("");

      const response = await fetch(`/api/rental-requests/${requestId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel rental request.");
      }

      // Remove the cancelled request from the dashboard
      setRentalRequests((currentRequests) =>
        currentRequests.filter((request) => request.id !== requestId),
      );

      setCancelSuccess("Rental request cancelled successfully.");

      setTimeout(() => {
        setCancelSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Cancel rental request error:", error);

      setCancelError(
        error instanceof Error
          ? error.message
          : "Failed to cancel rental request.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      window.location.href = "/auth/login";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-gray-200 px-6 py-6">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-blue-600"
            >
              RentNest
            </Link>

            <p className="mt-1 text-sm text-gray-500">Tenant Dashboard</p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6">
            <Link
              href="/tenant/dashboard"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>

            <Link
              href="/properties"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <Search className="h-5 w-5" />
              Browse Properties
            </Link>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-400"
            >
              <ClipboardList className="h-5 w-5" />
              Rental Requests
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-400"
            >
              <Heart className="h-5 w-5" />
              Favorites
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-400"
            >
              <User className="h-5 w-5" />
              Profile
            </button>
          </nav>

          <div className="border-t border-gray-200 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="flex min-h-20 items-center justify-between px-5 py-4 sm:px-8">
              <div>
                <p className="text-sm text-gray-500">Welcome back,</p>

                {isUserLoading ? (
                  <div className="mt-1 h-7 w-40 animate-pulse rounded-lg bg-gray-200" />
                ) : (
                  <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    {user?.name || "Tenant"}
                  </h1>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/properties"
                  className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-600 sm:flex"
                >
                  <Search className="h-4 w-4" />
                  Browse Properties
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
            {/* Mobile navigation */}
            <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
              <Link
                href="/tenant/dashboard"
                className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>

              <Link
                href="/properties"
                className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700"
              >
                <Search className="h-4 w-4" />
                Properties
              </Link>

              <button
                type="button"
                className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-400"
              >
                <Heart className="h-4 w-4" />
                Favorites
              </button>
            </div>

            {/* User error */}
            {userError && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {userError}
              </div>
            )}

            {/* Stats */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Requests
                    </p>

                    {isRequestsLoading ? (
                      <div className="mt-2 h-9 w-12 animate-pulse rounded-lg bg-gray-200" />
                    ) : (
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>

                    {isRequestsLoading ? (
                      <div className="mt-2 h-9 w-12 animate-pulse rounded-lg bg-gray-200" />
                    ) : (
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {stats.pending}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                    <Clock3 className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Approved
                    </p>

                    {isRequestsLoading ? (
                      <div className="mt-2 h-9 w-12 animate-pulse rounded-lg bg-gray-200" />
                    ) : (
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {stats.approved}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-green-50 p-3 text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Rejected
                    </p>

                    {isRequestsLoading ? (
                      <div className="mt-2 h-9 w-12 animate-pulse rounded-lg bg-gray-200" />
                    ) : (
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {stats.rejected}
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl bg-red-50 p-3 text-red-600">
                    <XCircle className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </section>

            {/* Quick action */}
            <section className="mt-8 rounded-2xl bg-blue-600 p-6 text-white shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-medium text-blue-100">
                    Looking for a new place?
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    Find your next home
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                    Browse available properties and submit a rental request
                    directly to the landlord.
                  </p>
                </div>

                <Link
                  href="/properties"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  Browse Properties
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            {/* Rental Requests */}
            <section className="mt-8">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">Activity</p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    My Rental Requests
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Track the properties you have requested.
                  </p>
                </div>
              </div>

              {/* Success message */}
              {cancelSuccess && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  {cancelSuccess}
                </div>
              )}

              {/* Error message */}
              {cancelError && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {cancelError}
                </div>
              )}

              {/* Loading */}
              {isRequestsLoading && (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="animate-pulse p-5">
                        <div className="flex flex-col gap-5 md:flex-row">
                          <div className="h-48 w-full rounded-xl bg-gray-200 md:h-36 md:w-52" />

                          <div className="flex-1 space-y-4">
                            <div className="h-6 w-2/3 rounded bg-gray-200" />
                            <div className="h-4 w-1/3 rounded bg-gray-200" />
                            <div className="grid grid-cols-2 gap-3">
                              <div className="h-10 rounded bg-gray-200" />
                              <div className="h-10 rounded bg-gray-200" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {!isRequestsLoading && requestsError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div>
                      <h3 className="font-semibold text-red-800">
                        Unable to load rental requests
                      </h3>

                      <p className="mt-1 text-sm text-red-700">
                        {requestsError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty */}
              {!isRequestsLoading &&
                !requestsError &&
                rentalRequests.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <ClipboardList className="h-7 w-7" />
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-gray-900">
                      No rental requests yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                      You have not submitted any rental requests. Browse
                      available properties and find your next home.
                    </p>

                    <Link
                      href="/properties"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Browse Properties
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}

              {/* Request list */}
              {!isRequestsLoading &&
                !requestsError &&
                rentalRequests.length > 0 && (
                  <div className="space-y-4">
                    {rentalRequests.map((request) => {
                      const status = getStatusStyles(request.status);

                      const StatusIcon = status.icon;

                      return (
                        <div
                          key={request.id}
                          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                        >
                          <div className="p-5">
                            <div className="flex flex-col gap-5 md:flex-row">
                              {/* Property Image */}
                              <div className="h-52 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 md:h-36 md:w-52">
                                {request.property?.imageUrl ? (
                                  <img
                                    src={request.property.imageUrl}
                                    alt={request.property.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    <Home className="h-10 w-10" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h3 className="truncate text-lg font-bold text-gray-900">
                                        {request.property?.title}
                                      </h3>

                                      <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                      >
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {status.label}
                                      </span>
                                    </div>

                                    <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                                      <MapPin className="h-4 w-4 shrink-0" />

                                      <span className="truncate">
                                        {request.property?.location}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="shrink-0">
                                    <p className="text-lg font-bold text-blue-600">
                                      {formatCurrency(
                                        request.property?.price || 0,
                                      )}
                                    </p>

                                    <p className="text-right text-xs text-gray-400">
                                      / month
                                    </p>
                                  </div>
                                </div>

                                {/* Property details */}
                                <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2">
                                    <Home className="h-4 w-4 text-gray-400" />
                                    {request.property?.propertyType}
                                  </span>

                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2">
                                    <BedDouble className="h-4 w-4 text-gray-400" />
                                    {request.property?.bedrooms} Beds
                                  </span>

                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2">
                                    <Bath className="h-4 w-4 text-gray-400" />
                                    {request.property?.bathrooms} Baths
                                  </span>
                                </div>

                                {/* Request information */}
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                      <CalendarDays className="h-4 w-4" />
                                      Move-in Date
                                    </div>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                      {formatDate(request.moveInDate)}
                                    </p>
                                  </div>

                                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                      <Clock3 className="h-4 w-4" />
                                      Requested On
                                    </div>

                                    <p className="mt-1 text-sm font-semibold text-gray-900">
                                      {formatDate(request.createdAt)}
                                    </p>
                                  </div>
                                </div>

                                {/* Message */}
                                {request.message && (
                                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                                    <p className="text-xs font-semibold text-blue-700">
                                      Your message
                                    </p>

                                    <p className="mt-1 text-sm leading-6 text-blue-900">
                                      {request.message}
                                    </p>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                  <Link
                                    href={`/properties/${request.property?.id}`}
                                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                                  >
                                    View Property
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>

                                  {request.status === "PENDING" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCancelRequest(request.id)
                                      }
                                      disabled={cancellingId === request.id}
                                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      {cancellingId === request.id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          Cancelling...
                                        </>
                                      ) : (
                                        <>
                                          <Ban className="h-4 w-4" />
                                          Cancel Request
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
