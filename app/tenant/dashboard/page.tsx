"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Heart,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Star,
  X,
  XCircle,
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

  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "ACTIVE"
    | "COMPLETED";

  createdAt: string;
  updatedAt?: string;

  property: Property;
  payment?: Payment | null;
}

interface WatchlistItem {
  id: string;
  propertyId: string;
  createdAt?: string;

  property: {
    id: string;
    title: string;
    description?: string;
    location: string;
    price: number;
    propertyType: string;
    bedrooms: number;
    bathrooms: number;
    amenities?: string[];
    imageUrl?: string | null;
    status: "AVAILABLE" | "RENTED" | "UNAVAILABLE";
    category?: {
      id?: string;
      name: string;
      description?: string | null;
    } | null;
  };
}

interface WatchlistResponse {
  success: boolean;
  message: string;
  data: WatchlistItem[];
}

export default function TenantDashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  const [rentalRequests, setRentalRequests] = useState<
    RentalRequest[]
  >([]);

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [watchlistError, setWatchlistError] = useState("");

  const [removingWatchlistId, setRemovingWatchlistId] = useState<
    string | null
  >(null);

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const [reviewingRequest, setReviewingRequest] =
    useState<RentalRequest | null>(null);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // ========================================
  // AUTH HEADERS
  // ========================================

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // ========================================
  // REDIRECT TO LOGIN
  // ========================================

  const redirectToLogin = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    window.location.replace("/auth/login");
  };

  // ========================================
  // LOAD DASHBOARD
  // ========================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setWatchlistLoading(true);

        setError("");
        setWatchlistError("");

        const authHeaders = getAuthHeaders();

        if (!authHeaders.Authorization) {
          redirectToLogin();
          return;
        }

        const [
          userResponse,
          requestResponse,
          watchlistResponse,
        ] = await Promise.all([
          fetch("/api/auth/me", {
            method: "GET",
            headers: {
              ...authHeaders,
            },
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/rental-requests/my", {
            method: "GET",
            headers: {
              ...authHeaders,
            },
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/watchlist", {
            method: "GET",
            headers: {
              ...authHeaders,
            },
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (
          userResponse.status === 401 ||
          requestResponse.status === 401 ||
          watchlistResponse.status === 401
        ) {
          redirectToLogin();
          return;
        }

        if (!userResponse.ok) {
          throw new Error("Failed to load user information.");
        }

        if (!requestResponse.ok) {
          throw new Error("Failed to load rental requests.");
        }

        const userData = await userResponse.json();
        const requestData = await requestResponse.json();

        if (!userData.success) {
          throw new Error(
            userData.message || "Failed to load user information.",
          );
        }

        if (!requestData.success) {
          throw new Error(
            requestData.message || "Failed to load rental requests.",
          );
        }

        setUser(userData.data);

        const requests = Array.isArray(requestData.data)
          ? requestData.data
          : [];

        setRentalRequests(
          requests.filter(
            (request: RentalRequest) => request.status !== "CANCELLED",
          ),
        );

        if (watchlistResponse.ok) {
          const watchlistData: WatchlistResponse =
            await watchlistResponse.json();

          if (
            watchlistData.success &&
            Array.isArray(watchlistData.data)
          ) {
            setWatchlist(watchlistData.data);
          } else {
            setWatchlist([]);
            setWatchlistError(
              watchlistData.message || "Failed to load watchlist.",
            );
          }
        } else {
          setWatchlist([]);
          setWatchlistError("Failed to load your watchlist.");
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setLoading(false);
        setWatchlistLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ========================================
  // REMOVE WATCHLIST
  // ========================================

  const handleRemoveFromWatchlist = async (propertyId: string) => {
    try {
      setRemovingWatchlistId(propertyId);
      setWatchlistError("");

      const response = await fetch(`/api/watchlist/${propertyId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to remove property from watchlist.",
        );
      }

      setWatchlist((current) =>
        current.filter((item) => item.propertyId !== propertyId),
      );

      setSuccess("Property removed from your watchlist.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Remove watchlist error:", err);

      setWatchlistError(
        err instanceof Error
          ? err.message
          : "Failed to remove property from watchlist.",
      );
    } finally {
      setRemovingWatchlistId(null);
    }
  };

  // ========================================
  // CANCEL REQUEST
  // ========================================

  const handleCancelRequest = async (requestId: string) => {
    try {
      setCancellingId(requestId);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/rental-requests/${requestId}/cancel`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
          },
          credentials: "include",
          cache: "no-store",
        },
      );

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to cancel rental request.",
        );
      }

      setRentalRequests((current) =>
        current.filter((request) => request.id !== requestId),
      );

      setSuccess("Rental request cancelled successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Cancel request error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel rental request.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ========================================
  // PAYMENT
  // ========================================

  const handlePayment = async (requestId: string) => {
    try {
      setPayingId(requestId);
      setError("");

      const response = await fetch(
        "/api/payments/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify({
            rentalRequestId: requestId,
          }),
          cache: "no-store",
        },
      );

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create payment session.",
        );
      }

      const checkoutUrl = data.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to start payment.",
      );

      setPayingId(null);
    }
  };

  // ========================================
  // REVIEW
  // ========================================

  const handleOpenReview = (request: RentalRequest) => {
    setReviewingRequest(request);
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
  };

  const handleCloseReview = () => {
    if (reviewSubmitting) {
      return;
    }

    setReviewingRequest(null);
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
  };

  const handleSubmitReview = async () => {
    if (!reviewingRequest) {
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      const authHeaders = getAuthHeaders();

      if (!authHeaders.Authorization) {
        throw new Error(
          "You are not logged in. Please login again.",
        );
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        credentials: "include",
        body: JSON.stringify({
          propertyId: reviewingRequest.propertyId,
          rentalRequestId: reviewingRequest.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
        cache: "no-store",
      });

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit review.",
        );
      }

      setRentalRequests((current) =>
        current.map((request) =>
          request.id === reviewingRequest.id
            ? {
                ...request,
                status: "COMPLETED",
              }
            : request,
        ),
      );

      setReviewSuccess(
        "Review submitted successfully. Rental completed.",
      );

      setReviewingRequest(null);
      setReviewRating(5);
      setReviewComment("");

      setTimeout(() => {
        setReviewSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Review submission error:", err);

      setReviewError(
        err instanceof Error
          ? err.message
          : "Failed to submit review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      window.location.replace("/auth/login");
    }
  };

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (
    status: RentalRequest["status"],
  ) => {
    switch (status) {
      case "PENDING":
        return {
          className:
            "border-yellow-200 bg-yellow-50 text-yellow-700",
          icon: Clock3,
        };

      case "APPROVED":
        return {
          className:
            "border-blue-200 bg-blue-50 text-blue-700",
          icon: CheckCircle2,
        };

      case "REJECTED":
        return {
          className:
            "border-red-200 bg-red-50 text-red-700",
          icon: XCircle,
        };

      case "ACTIVE":
        return {
          className:
            "border-cyan-200 bg-cyan-50 text-cyan-700",
          icon: CheckCircle2,
        };

      case "COMPLETED":
        return {
          className:
            "border-green-200 bg-green-50 text-green-700",
          icon: CheckCircle2,
        };

      case "CANCELLED":
        return {
          className:
            "border-gray-200 bg-gray-50 text-gray-600",
          icon: XCircle,
        };

      default:
        return {
          className:
            "border-gray-200 bg-gray-50 text-gray-600",
          icon: Clock3,
        };
    }
  };

  // ========================================
  // STATS
  // ========================================

  const totalRequests = rentalRequests.length;

  const pendingRequests = rentalRequests.filter(
    (request) => request.status === "PENDING",
  ).length;

  const approvedRequests = rentalRequests.filter(
    (request) => request.status === "APPROVED",
  ).length;

  const activeRequests = rentalRequests.filter(
    (request) => request.status === "ACTIVE",
  ).length;

  const completedRequests = rentalRequests.filter(
    (request) => request.status === "COMPLETED",
  ).length;

  const rejectedRequests = rentalRequests.filter(
    (request) => request.status === "REJECTED",
  ).length;

  const activeRentals = useMemo(
    () =>
      rentalRequests.filter(
        (request) => request.status === "ACTIVE",
      ),
    [rentalRequests],
  );

  const completedRentals = useMemo(
    () =>
      rentalRequests.filter(
        (request) => request.status === "COMPLETED",
      ),
    [rentalRequests],
  );

  const otherRequests = useMemo(
    () =>
      rentalRequests.filter(
        (request) =>
          request.status !== "ACTIVE" &&
          request.status !== "COMPLETED",
      ),
    [rentalRequests],
  );

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ========================================
  // REQUEST CARD
  // ========================================

  const renderRequestCard = (request: RentalRequest) => {
    const statusStyle = getStatusStyle(request.status);
    const StatusIcon = statusStyle.icon;

    const isPaid = request.payment?.status === "COMPLETED";

    const canPay =
      request.status === "APPROVED" && !isPaid;

    const canReview = request.status === "ACTIVE";

    return (
      <div
        key={request.id}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
      >
        <div className="p-5 sm:p-6">
          {/* TOP */}
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-24">
                {request.property.imageUrl ? (
                  <img
                    src={request.property.imageUrl}
                    alt={request.property.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Home size={26} className="text-gray-400" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <Link
                  href={`/properties/${request.propertyId}`}
                  className="line-clamp-2 text-lg font-semibold text-gray-900 transition hover:text-blue-600"
                >
                  {request.property.title}
                </Link>

                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={15} />
                  <span className="line-clamp-1">
                    {request.property.location}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>{request.property.propertyType}</span>
                  <span>{request.property.bedrooms} Beds</span>
                  <span>{request.property.bathrooms} Baths</span>
                </div>
              </div>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle.className}`}
            >
              <StatusIcon size={14} />
              {request.status}
            </div>
          </div>

          {/* DETAILS */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-1 text-xs text-gray-500">
                Monthly Rent
              </p>

              <p className="font-semibold text-gray-900">
                ৳{Number(request.property.price).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500">
                Move-in Date
              </p>

              <div className="flex items-center gap-2">
                <CalendarDays
                  size={15}
                  className="text-gray-400"
                />

                <p className="text-sm font-medium text-gray-700">
                  {formatDate(request.moveInDate)}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500">
                Request Date
              </p>

              <p className="text-sm font-medium text-gray-700">
                {formatDate(request.createdAt)}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-500">
                Payment
              </p>

              {isPaid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 size={15} />
                  <span className="text-sm font-medium">
                    Completed
                  </span>
                </div>
              ) : request.status === "APPROVED" ? (
                <div className="flex items-center gap-2 text-yellow-600">
                  <CreditCard size={15} />
                  <span className="text-sm font-medium">
                    Pending
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-400">
                  —
                </span>
              )}
            </div>
          </div>

          {/* MESSAGE */}
          {request.message && (
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start gap-2">
                <MessageSquare
                  size={16}
                  className="mt-0.5 shrink-0 text-gray-400"
                />

                <div>
                  <p className="mb-1 text-xs text-gray-500">
                    Your message
                  </p>

                  <p className="text-sm leading-relaxed text-gray-600">
                    {request.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/properties/${request.propertyId}`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              View Property
            </Link>

            {canPay && (
              <button
                type="button"
                onClick={() => handlePayment(request.id)}
                disabled={payingId === request.id}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {payingId === request.id ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Pay Now
                  </>
                )}
              </button>
            )}

            {request.status === "APPROVED" && isPaid && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                <CheckCircle2 size={16} />
                Payment Completed
              </div>
            )}

            {canReview && (
              <button
                type="button"
                onClick={() => handleOpenReview(request)}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700"
              >
                <Star size={16} />
                Leave Review
              </button>
            )}

            {request.status === "COMPLETED" && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                <CheckCircle2 size={16} />
                Review Completed
              </div>
            )}

            {request.status === "PENDING" && (
              <button
                type="button"
                onClick={() => handleCancelRequest(request.id)}
                disabled={cancellingId === request.id}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancellingId === request.id ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Cancel Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                RentNest
              </p>

              <h2 className="mt-1 text-sm text-gray-500">
                Tenant Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* WELCOME */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-600">
            Welcome back
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {user?.name || "Tenant"}
          </h1>

          <p className="mt-2 max-w-2xl text-gray-500">
            Manage your rental requests, payments, reviews and saved
            properties from one place.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle
              className="mt-0.5 shrink-0 text-red-500"
              size={20}
            />

            <div>
              <p className="font-medium text-red-700">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
            <CheckCircle2
              className="mt-0.5 shrink-0 text-green-500"
              size={20}
            />

            <p className="text-sm text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* REVIEW SUCCESS */}
        {reviewSuccess && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <Star
              className="mt-0.5 shrink-0 text-cyan-600"
              size={20}
              fill="currentColor"
            />

            <p className="text-sm text-cyan-700">
              {reviewSuccess}
            </p>
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Home size={20} className="text-blue-600" />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {totalRequests}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Total Requests
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50">
                <Clock3 size={20} className="text-yellow-600" />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {pendingRequests}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Pending
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <CheckCircle2 size={20} className="text-blue-600" />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {approvedRequests}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Approved
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50">
                <Home size={20} className="text-cyan-600" />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {activeRequests}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Active
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Star size={20} className="text-green-600" />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {completedRequests}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Completed
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                <XCircle size={20} className="text-red-500" />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {rejectedRequests}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Rejected
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Home size={17} />
            Browse Properties
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            Back to Home
          </Link>
        </div>

        {/* WATCHLIST */}
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Heart
                  size={22}
                  className="text-red-500"
                  fill="currentColor"
                />

                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  My Watchlist
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Properties you saved for later.
              </p>
            </div>

            {!watchlistLoading && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                {watchlist.length} saved
              </span>
            )}
          </div>

          {watchlistError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <p className="text-sm text-red-600">
                {watchlistError}
              </p>
            </div>
          )}

          {watchlistLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="h-48 animate-pulse bg-gray-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                    <div className="h-10 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <Heart
                  size={27}
                  className="text-red-500"
                />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Your watchlist is empty
              </h3>

              <p className="mb-5 text-sm text-gray-500">
                Save properties you like and easily find them here later.
              </p>

              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <Home size={17} />
                Explore Properties
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {watchlist.map((item) => {
                const property = item.property;
                const isRemoving =
                  removingWatchlistId === item.propertyId;

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {property.imageUrl ? (
                        <img
                          src={property.imageUrl}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Home size={35} className="text-gray-300" />
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm">
                        {property.propertyType}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveFromWatchlist(item.propertyId)
                        }
                        disabled={isRemoving}
                        aria-label="Remove from watchlist"
                        title="Remove from watchlist"
                        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRemoving ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                        ) : (
                          <Heart size={18} fill="currentColor" />
                        )}
                      </button>
                    </div>

                    <div className="p-5">
                      <Link
                        href={`/properties/${property.id}`}
                        className="line-clamp-1 text-lg font-semibold text-gray-900 transition hover:text-blue-600"
                      >
                        {property.title}
                      </Link>

                      <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin size={15} />

                        <span className="line-clamp-1">
                          {property.location}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span>{property.bedrooms} Beds</span>
                        <span>{property.bathrooms} Baths</span>

                        <span
                          className={
                            property.status === "AVAILABLE"
                              ? "font-medium text-green-600"
                              : "font-medium text-red-500"
                          }
                        >
                          {property.status}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            ৳
                            {Number(property.price).toLocaleString()}
                          </p>

                          <p className="text-xs text-gray-400">
                            per month
                          </p>
                        </div>

                        <Link
                          href={`/properties/${property.id}`}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ACTIVE RENTALS */}
        {activeRentals.length > 0 && (
          <section className="mb-10">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={22}
                  className="text-cyan-600"
                />

                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Active Rentals
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Your currently active rental properties.
              </p>
            </div>

            <div className="space-y-5">
              {activeRentals.map(renderRequestCard)}
            </div>
          </section>
        )}

        {/* RENTAL REQUESTS */}
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Rental Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track your pending, approved and rejected rental requests.
            </p>
          </div>

          {otherRequests.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Home size={26} className="text-blue-600" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No pending requests
              </h3>

              <p className="mb-5 text-sm text-gray-500">
                Browse properties and send a rental request when you find
                the right home.
              </p>

              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {otherRequests.map(renderRequestCard)}
            </div>
          )}
        </section>

        {/* COMPLETED RENTALS */}
        {completedRentals.length > 0 && (
          <section className="mb-10">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Star
                  size={22}
                  className="text-green-600"
                />

                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Rental History
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Your completed rental history.
              </p>
            </div>

            <div className="space-y-5">
              {completedRentals.map(renderRequestCard)}
            </div>
          </section>
        )}
      </main>

      {/* REVIEW MODAL */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close review modal"
            onClick={handleCloseReview}
            disabled={reviewSubmitting}
            className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
          />

          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <p className="mb-1 text-xs font-medium text-cyan-600">
                  Complete Rental
                </p>

                <h2 className="text-xl font-bold text-gray-900">
                  Leave a Review
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseReview}
                disabled={reviewSubmitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* BODY */}
            <div className="p-5">
              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-1 text-xs text-gray-500">
                  Property
                </p>

                <p className="font-semibold text-gray-900">
                  {reviewingRequest.property.title}
                </p>

                <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={14} />

                  {reviewingRequest.property.location}
                </div>
              </div>

              {/* RATING */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Your Rating
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      disabled={reviewSubmitting}
                      className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                      aria-label={`Rate ${rating} out of 5`}
                    >
                      <Star
                        size={32}
                        className={
                          rating <= reviewRating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                        fill={
                          rating <= reviewRating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  {reviewRating} out of 5 stars
                </p>
              </div>

              {/* COMMENT */}
              <div className="mb-5">
                <label
                  htmlFor="review-comment"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(event.target.value)
                  }
                  disabled={reviewSubmitting}
                  rows={5}
                  maxLength={1000}
                  placeholder="Share your experience with this rental property..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:opacity-50"
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {reviewComment.length}/1000
                </p>
              </div>

              {/* ERROR */}
              {reviewError && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <p className="text-sm text-red-600">
                    {reviewError}
                  </p>
                </div>
              )}

              {/* INFO */}
              <div className="mb-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-xs leading-relaxed text-cyan-700">
                  After submitting your review, this rental will be marked
                  as completed.
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseReview}
                  disabled={reviewSubmitting}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={reviewSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star size={16} fill="currentColor" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}