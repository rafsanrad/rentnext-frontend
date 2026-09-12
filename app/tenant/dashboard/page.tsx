"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
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

export default function TenantDashboardPage() {
  const [user, setUser] =
    useState<UserData | null>(null);

  const [rentalRequests, setRentalRequests] =
    useState<RentalRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [cancellingId, setCancellingId] =
    useState<string | null>(null);

  const [payingId, setPayingId] =
    useState<string | null>(null);

  const [reviewingRequest, setReviewingRequest] =
    useState<RentalRequest | null>(null);

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const [reviewError, setReviewError] =
    useState("");

  const [reviewSuccess, setReviewSuccess] =
    useState("");

  // ========================================
  // AUTH HEADERS
  // ========================================

  const getAuthHeaders = (): Record<
    string,
    string
  > => {
    const token =
      localStorage.getItem("accessToken");

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
    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem("user");

    window.location.assign(
      "/auth/login"
    );
  };

  // ========================================
  // LOAD DASHBOARD
  // ========================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const authHeaders =
          getAuthHeaders();

        if (!authHeaders.Authorization) {
          redirectToLogin();
          return;
        }

        const [
          userResponse,
          requestResponse,
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
        ]);

        if (
          userResponse.status === 401 ||
          requestResponse.status === 401
        ) {
          redirectToLogin();
          return;
        }

        if (!userResponse.ok) {
          throw new Error(
            "Failed to load user information."
          );
        }

        if (!requestResponse.ok) {
          throw new Error(
            "Failed to load rental requests."
          );
        }

        const userData =
          await userResponse.json();

        const requestData =
          await requestResponse.json();

        if (!userData.success) {
          throw new Error(
            userData.message ||
              "Failed to load user information."
          );
        }

        if (!requestData.success) {
          throw new Error(
            requestData.message ||
              "Failed to load rental requests."
          );
        }

        setUser(userData.data);

        const requests =
          Array.isArray(requestData.data)
            ? requestData.data
            : [];

        setRentalRequests(
          requests.filter(
            (request: RentalRequest) =>
              request.status !==
              "CANCELLED"
          )
        );
      } catch (err) {
        console.error(
          "Dashboard loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ========================================
  // CANCEL REQUEST
  // ========================================

  const handleCancelRequest = async (
    requestId: string
  ) => {
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
        }
      );

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to cancel rental request."
        );
      }

      setRentalRequests(
        (currentRequests) =>
          currentRequests.filter(
            (request) =>
              request.id !== requestId
          )
      );

      setSuccess(
        "Rental request cancelled successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error(
        "Cancel request error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel rental request."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ========================================
  // PAYMENT
  // ========================================

  const handlePayment = async (
    requestId: string
  ) => {
    try {
      setPayingId(requestId);

      setError("");

      const response = await fetch(
        "/api/payments/create-checkout-session",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...getAuthHeaders(),
          },

          credentials: "include",

          body: JSON.stringify({
            rentalRequestId:
              requestId,
          }),

          cache: "no-store",
        }
      );

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to create payment session."
        );
      }

      const checkoutUrl =
        data.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(
          "Stripe checkout URL was not returned."
        );
      }

      window.location.assign(
        checkoutUrl
      );
    } catch (err) {
      console.error(
        "Payment error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to start payment."
      );

      setPayingId(null);
    }
  };

  // ========================================
  // OPEN REVIEW
  // ========================================

  const handleOpenReview = (
    request: RentalRequest
  ) => {
    setReviewingRequest(request);

    setReviewRating(5);

    setReviewComment("");

    setReviewError("");

    setReviewSuccess("");
  };

  // ========================================
  // CLOSE REVIEW
  // ========================================

  const handleCloseReview = () => {
    if (reviewSubmitting) {
      return;
    }

    setReviewingRequest(null);

    setReviewRating(5);

    setReviewComment("");

    setReviewError("");
  };

  // ========================================
  // SUBMIT REVIEW
  // ========================================

  const handleSubmitReview = async () => {
    if (!reviewingRequest) {
      return;
    }

    try {
      setReviewSubmitting(true);

      setReviewError("");

      const authHeaders =
        getAuthHeaders();

      if (!authHeaders.Authorization) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...authHeaders,
          },

          credentials: "include",

          body: JSON.stringify({
            propertyId:
              reviewingRequest.propertyId,

            rentalRequestId:
              reviewingRequest.id,

            rating: reviewRating,

            comment:
              reviewComment.trim(),
          }),

          cache: "no-store",
        }
      );

      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const responseText =
        await response.text();

      let data;

      try {
        data = JSON.parse(
          responseText
        );
      } catch {
        console.error(
          "Review response was not JSON:",
          responseText
        );

        throw new Error(
          "Server returned an invalid response."
        );
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to submit review."
        );
      }

      setRentalRequests(
        (currentRequests) =>
          currentRequests.map(
            (request) =>
              request.id ===
              reviewingRequest.id
                ? {
                    ...request,
                    status:
                      "COMPLETED",
                  }
                : request
          )
      );

      setReviewSuccess(
        "Review submitted successfully. Rental completed."
      );

      setReviewingRequest(null);

      setReviewRating(5);

      setReviewComment("");

      setTimeout(() => {
        setReviewSuccess("");
      }, 4000);
    } catch (err) {
      console.error(
        "Review submission error:",
        err
      );

      setReviewError(
        err instanceof Error
          ? err.message
          : "Failed to submit review."
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
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",

          headers: {
            ...getAuthHeaders(),
          },

          credentials: "include",
        }
      );
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );
    } finally {
      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem("user");

      window.location.assign(
        "/auth/login"
      );
    }
  };

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (
    status: RentalRequest["status"]
  ) => {
    switch (status) {
      case "PENDING":
        return {
          className:
            "bg-yellow-50 text-yellow-700 border-yellow-200",
          icon: Clock3,
        };

      case "APPROVED":
        return {
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
          icon: CheckCircle2,
        };

      case "REJECTED":
        return {
          className:
            "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
        };

      case "ACTIVE":
        return {
          className:
            "bg-cyan-50 text-cyan-700 border-cyan-200",
          icon: CheckCircle2,
        };

      case "COMPLETED":
        return {
          className:
            "bg-green-50 text-green-700 border-green-200",
          icon: CheckCircle2,
        };

      case "CANCELLED":
        return {
          className:
            "bg-gray-50 text-gray-600 border-gray-200",
          icon: XCircle,
        };

      default:
        return {
          className:
            "bg-gray-50 text-gray-600 border-gray-200",
          icon: Clock3,
        };
    }
  };

  // ========================================
  // STATS
  // ========================================

  const totalRequests =
    rentalRequests.length;

  const pendingRequests =
    rentalRequests.filter(
      (request) =>
        request.status === "PENDING"
    ).length;

  const approvedRequests =
    rentalRequests.filter(
      (request) =>
        request.status === "APPROVED"
    ).length;

  const activeRequests =
    rentalRequests.filter(
      (request) =>
        request.status === "ACTIVE"
    ).length;

  const completedRequests =
    rentalRequests.filter(
      (request) =>
        request.status === "COMPLETED"
    ).length;

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

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

      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-2xl font-bold tracking-tight text-gray-900"
              >
                Rent
                <span className="text-blue-600">
                  Nest
                </span>
              </Link>

              <p className="text-xs text-gray-500 mt-1">
                Tenant Dashboard
              </p>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:block text-right">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}

        <div className="mb-8">
          <p className="text-blue-600 text-sm font-medium mb-2">
            Welcome back
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {user?.name || "Tenant"}
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your rental requests,
            payments and reviews.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle
              className="text-red-500 shrink-0 mt-0.5"
              size={20}
            />

            <div>
              <p className="font-medium text-red-700">
                Something went wrong
              </p>

              <p className="text-sm text-red-600 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <CheckCircle2
              className="text-green-500 shrink-0 mt-0.5"
              size={20}
            />

            <p className="text-sm text-green-700">
              {success}
            </p>
          </div>
        )}

        {/* REVIEW SUCCESS */}

        {reviewSuccess && (
          <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4 flex items-start gap-3">
            <Star
              className="text-cyan-600 shrink-0 mt-0.5"
              size={20}
              fill="currentColor"
            />

            <p className="text-sm text-cyan-700">
              {reviewSuccess}
            </p>
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Home
                  size={20}
                  className="text-blue-600"
                />
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
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Clock3
                  size={20}
                  className="text-yellow-600"
                />
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
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <CheckCircle2
                  size={20}
                  className="text-blue-600"
                />
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
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                <Home
                  size={20}
                  className="text-cyan-600"
                />
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
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Star
                  size={20}
                  className="text-green-600"
                />
              </div>

              <span className="text-2xl font-bold text-gray-900">
                {completedRequests}
              </span>
            </div>

            <p className="text-sm text-gray-500">
              Completed
            </p>
          </div>
        </div>

        {/* NAVIGATION */}

        <div className="flex flex-wrap gap-3 mb-8">
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

        {/* ACTIVE RENTALS */}

        {activeRequests > 0 && (
          <div className="mb-8 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="text-cyan-600 mt-0.5 shrink-0"
                size={21}
              />

              <div>
                <h3 className="font-semibold text-cyan-800">
                  Active Rentals
                </h3>

                <p className="text-sm text-cyan-700/80 mt-1">
                  You currently have{" "}
                  {activeRequests} active rental
                  {activeRequests !== 1
                    ? "s"
                    : ""}.
                  You can leave a review from
                  the rental request below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETED */}

        {completedRequests > 0 && (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="text-green-600 mt-0.5 shrink-0"
                size={21}
              />

              <div>
                <h3 className="font-semibold text-green-800">
                  Completed Rentals
                </h3>

                <p className="text-sm text-green-700/80 mt-1">
                  You have completed{" "}
                  {completedRequests} rental
                  {completedRequests !== 1
                    ? "s"
                    : ""}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS */}

        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                My Rental Requests
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Track your property rental
                requests and payments.
              </p>
            </div>
          </div>

          {rentalRequests.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Home
                  size={26}
                  className="text-blue-600"
                />
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No rental requests yet
              </h3>

              <p className="text-sm text-gray-500 mb-5">
                Start browsing properties and
                send your first rental request.
              </p>

              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {rentalRequests.map(
                (request) => {
                  const statusStyle =
                    getStatusStyle(
                      request.status
                    );

                  const StatusIcon =
                    statusStyle.icon;

                  const isPaid =
                    request.payment
                      ?.status ===
                    "COMPLETED";

                  const canPay =
                    request.status ===
                      "APPROVED" &&
                    !isPaid;

                  const canReview =
                    request.status ===
                    "ACTIVE";

                  return (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                    >
                      <div className="p-5 sm:p-6">
                        {/* Property */}

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                          <div className="flex gap-4 min-w-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                              {request.property
                                .imageUrl ? (
                                <img
                                  src={
                                    request
                                      .property
                                      .imageUrl
                                  }
                                  alt={
                                    request
                                      .property
                                      .title
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Home
                                    size={26}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <Link
                                href={`/properties/${request.propertyId}`}
                                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
                              >
                                {
                                  request
                                    .property
                                    .title
                                }
                              </Link>

                              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                                <MapPin
                                  size={15}
                                />

                                <span>
                                  {
                                    request
                                      .property
                                      .location
                                  }
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-3">
                                <span>
                                  {
                                    request
                                      .property
                                      .propertyType
                                  }
                                </span>

                                <span>
                                  {
                                    request
                                      .property
                                      .bedrooms
                                  }{" "}
                                  Beds
                                </span>

                                <span>
                                  {
                                    request
                                      .property
                                      .bathrooms
                                  }{" "}
                                  Baths
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyle.className}`}
                          >
                            <StatusIcon
                              size={14}
                            />

                            {request.status}
                          </div>
                        </div>

                        {/* Details */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Monthly Rent
                            </p>

                            <p className="font-semibold text-gray-900">
                              ৳
                              {Number(
                                request
                                  .property
                                  .price
                              ).toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Move-in Date
                            </p>

                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                className="text-gray-400"
                              />

                              <p className="font-medium text-sm text-gray-700">
                                {new Date(
                                  request.moveInDate
                                ).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month:
                                      "short",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Request Date
                            </p>

                            <p className="font-medium text-sm text-gray-700">
                              {new Date(
                                request.createdAt
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month:
                                    "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              Payment
                            </p>

                            {isPaid ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2
                                  size={15}
                                />

                                <span className="text-sm font-medium">
                                  Completed
                                </span>
                              </div>
                            ) : request.status ===
                              "APPROVED" ? (
                              <div className="flex items-center gap-2 text-yellow-600">
                                <CreditCard
                                  size={15}
                                />

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

                        {/* Message */}

                        {request.message && (
                          <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4">
                            <div className="flex items-start gap-2">
                              <MessageSquare
                                size={16}
                                className="text-gray-400 mt-0.5 shrink-0"
                              />

                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Your message
                                </p>

                                <p className="text-sm text-gray-600">
                                  {
                                    request.message
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ACTIONS */}

                        <div className="flex flex-wrap items-center gap-3 mt-6">
                          <Link
                            href={`/properties/${request.propertyId}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                          >
                            View Property
                          </Link>

                          {canPay && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePayment(
                                  request.id
                                )
                              }
                              disabled={
                                payingId ===
                                request.id
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {payingId ===
                              request.id ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard
                                    size={16}
                                  />

                                  Pay Now
                                </>
                              )}
                            </button>
                          )}

                          {request.status ===
                            "APPROVED" &&
                            isPaid && (
                              <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                                <CheckCircle2
                                  size={16}
                                />

                                Payment Completed
                              </div>
                            )}

                          {canReview && (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenReview(
                                  request
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-700 transition"
                            >
                              <Star size={16} />

                              Leave Review
                            </button>
                          )}

                          {request.status ===
                            "COMPLETED" && (
                            <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
                              <CheckCircle2
                                size={16}
                              />

                              Review Completed
                            </div>
                          )}

                          {request.status ===
                            "PENDING" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCancelRequest(
                                  request.id
                                )
                              }
                              disabled={
                                cancellingId ===
                                request.id
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingId ===
                              request.id ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />

                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <XCircle
                                    size={16}
                                  />

                                  Cancel Request
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </main>

      {/* REVIEW MODAL */}

      {reviewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close review modal"
            onClick={handleCloseReview}
            disabled={reviewSubmitting}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}

            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <p className="text-xs text-cyan-600 font-medium mb-1">
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
                className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}

            <div className="p-5">
              {/* Property */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
                <p className="text-xs text-gray-500 mb-1">
                  Property
                </p>

                <p className="font-semibold text-gray-900">
                  {
                    reviewingRequest
                      .property.title
                  }
                </p>

                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <MapPin size={14} />

                  {
                    reviewingRequest
                      .property.location
                  }
                </div>
              </div>

              {/* Rating */}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Rating
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(
                    (rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() =>
                          setReviewRating(
                            rating
                          )
                        }
                        disabled={
                          reviewSubmitting
                        }
                        className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                        aria-label={`Rate ${rating} out of 5`}
                      >
                        <Star
                          size={32}
                          className={
                            rating <=
                            reviewRating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                          fill={
                            rating <=
                            reviewRating
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    )
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {reviewRating} out of 5 stars
                </p>
              </div>

              {/* Comment */}

              <div className="mb-5">
                <label
                  htmlFor="review-comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Review
                </label>

                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value
                    )
                  }
                  disabled={
                    reviewSubmitting
                  }
                  rows={5}
                  placeholder="Share your experience with this rental property..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:opacity-50"
                />
              </div>

              {/* Review Error */}

              {reviewError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className="text-red-500 mt-0.5 shrink-0"
                  />

                  <p className="text-sm text-red-600">
                    {reviewError}
                  </p>
                </div>
              )}

              {/* Information */}

              <div className="mb-5 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                <p className="text-xs text-cyan-700 leading-relaxed">
                  After submitting your
                  review, this rental will
                  be marked as completed.
                </p>
              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseReview}
                  disabled={
                    reviewSubmitting
                  }
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleSubmitReview
                  }
                  disabled={
                    reviewSubmitting
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-medium text-white hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star
                        size={16}
                        fill="currentColor"
                      />

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