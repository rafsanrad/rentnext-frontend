"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Home,
  DollarSign,
  Building2,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Ban,
  UserRoundCheck,
  MapPin,
  Loader2,
  CreditCard,
  ClipboardList,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  phone?: string | null;
  address?: string | null;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdminStats {
  users: {
    total: number;
    tenants: number;
    landlords: number;
    admins: number;
  };

  properties: {
    total: number;
    available: number;
    rented: number;
    unavailable: number;
  };

  rentals: {
    total: number;
    pending: number;
    active: number;
    completed: number;
  };

  payments: {
    total: number;
    completed: number;
    revenue: number;
  };
}

interface AdminProperty {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number | string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  imageUrl?: string | null;
  status: "AVAILABLE" | "RENTED" | "UNAVAILABLE";
  createdAt: string;
  landlord: {
    id: string;
    name: string;
    email: string;
    isBanned?: boolean;
  };
  category: {
    id: string;
    name: string;
  };
}

interface AdminRentalRequest {
  id: string;
  moveInDate: string;
  message?: string | null;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";
  createdAt: string;

  tenant: {
    id: string;
    name: string;
    email: string;
    isBanned?: boolean;
  };

  property: {
    id: string;
    title: string;
    location: string;
    price: number | string;
    status: string;
    landlord: {
      id: string;
      name: string;
      email: string;
    };
  };

  payment?: {
    id: string;
    amount: number | string;
    status: "PENDING" | "COMPLETED" | "FAILED";
    transactionId?: string | null;
    paidAt?: string | null;
  } | null;

  review?: {
    id: string;
    rating: number;
    comment?: string | null;
  } | null;
}

interface AdminPayment {
  id: string;
  transactionId?: string | null;
  amount: number | string;
  provider: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  paidAt?: string | null;
  createdAt: string;

  rentalRequest: {
    id: string;

    tenant: {
      id: string;
      name: string;
      email: string;
    };

    property: {
      id: string;
      title: string;
      location: string;
      price: number | string;
    };
  };
}

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("accessToken");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const getErrorMessage = async (
  response: Response,
  fallback: string
): Promise<string> => {
  try {
    const data = await response.json();

    return data?.message || fallback;
  } catch {
    return fallback;
  }
};

const fetchAdminStats = async (): Promise<AdminStats> => {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: {
      ...getAuthHeaders(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load admin statistics"
      )
    );
  }

  const data: ApiResponse<AdminStats> =
    await response.json();

  return data.data;
};

const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: {
      ...getAuthHeaders(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load users"
      )
    );
  }

  const data: ApiResponse<AdminUser[]> =
    await response.json();

  return data.data || [];
};

const fetchAdminProperties =
  async (): Promise<AdminProperty[]> => {
    const response = await fetch(
      `${API_URL}/admin/properties`,
      {
        headers: {
          ...getAuthHeaders(),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Failed to load properties"
        )
      );
    }

    const data: ApiResponse<AdminProperty[]> =
      await response.json();

    return data.data || [];
  };

const fetchAdminRentalRequests =
  async (): Promise<AdminRentalRequest[]> => {
    const response = await fetch(
      `${API_URL}/admin/rental-requests`,
      {
        headers: {
          ...getAuthHeaders(),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Failed to load rental requests"
        )
      );
    }

    const data: ApiResponse<AdminRentalRequest[]> =
      await response.json();

    return data.data || [];
  };

const fetchAdminPayments =
  async (): Promise<AdminPayment[]> => {
    const response = await fetch(
      `${API_URL}/admin/payments`,
      {
        headers: {
          ...getAuthHeaders(),
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Failed to load payments"
        )
      );
    }

    const data: ApiResponse<AdminPayment[]> =
      await response.json();

    return data.data || [];
  };

const formatPrice = (
  price: number | string
) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericPrice);
};

const formatDate = (date?: string | null) => {
  if (!date) {
    return "N/A";
  }

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusClasses = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-50 text-emerald-700";

    case "RENTED":
      return "bg-orange-50 text-orange-700";

    case "UNAVAILABLE":
      return "bg-slate-100 text-slate-600";

    case "PENDING":
      return "bg-yellow-50 text-yellow-700";

    case "APPROVED":
      return "bg-blue-50 text-blue-700";

    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700";

    case "COMPLETED":
      return "bg-cyan-50 text-cyan-700";

    case "REJECTED":
      return "bg-red-50 text-red-700";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] =
    useState<
      "overview" | "users" | "properties" | "rentals" | "payments"
    >("overview");

  const [searchTerm, setSearchTerm] = useState("");

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const {
    data: properties = [],
    isLoading: propertiesLoading,
    isError: propertiesError,
    refetch: refetchProperties,
  } = useQuery({
    queryKey: ["admin-properties"],
    queryFn: fetchAdminProperties,
  });

  const {
    data: rentalRequests = [],
    isLoading: rentalsLoading,
    isError: rentalsError,
    refetch: refetchRentals,
  } = useQuery({
    queryKey: ["admin-rental-requests"],
    queryFn: fetchAdminRentalRequests,
  });

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    isError: paymentsError,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: fetchAdminPayments,
  });

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const refreshDashboard = async () => {
    clearMessages();

    await Promise.all([
      refetchStats(),
      refetchUsers(),
      refetchProperties(),
      refetchRentals(),
      refetchPayments(),
    ]);
  };

  const handleUserStatus = async (
    user: AdminUser
  ) => {
    clearMessages();

    if (user.role === "ADMIN") {
      setError(
        "Admin users cannot be banned from this dashboard."
      );
      return;
    }

    const action = user.isBanned
      ? "unban"
      : "ban";

    const confirmed = window.confirm(
      user.isBanned
        ? `Are you sure you want to unban ${user.name}?`
        : `Are you sure you want to ban ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    setActionLoading(`${action}-${user.id}`);

    try {
      const response = await fetch(
        `${API_URL}/admin/users/${user.id}/${action}`,
        {
          method: "PATCH",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            `Failed to ${action} user`
          )
        );
      }

      const data = await response.json();

      setMessage(
        data.message ||
          `User ${action}ed successfully.`
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-users"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-stats"],
        }),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} user.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handlePropertyStatus = async (
    property: AdminProperty,
    status:
      | "AVAILABLE"
      | "RENTED"
      | "UNAVAILABLE"
  ) => {
    clearMessages();

    if (property.status === status) {
      return;
    }

    const confirmed = window.confirm(
      `Change "${property.title}" status to ${status}?`
    );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    setActionLoading(
      `property-${property.id}`
    );

    try {
      const response = await fetch(
        `${API_URL}/admin/properties/${property.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Failed to update property status"
          )
        );
      }

      const data = await response.json();

      setMessage(
        data.message ||
          "Property status updated successfully."
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-properties"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-stats"],
        }),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update property status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * UPDATED LOGOUT FUNCTION
   *
   * 1. Cancel all running React Query requests
   * 2. Remove local authentication data
   * 3. Clear React Query cache
   * 4. Clear backend authentication cookie
   * 5. Replace current page with login page
   */
  const handleLogout = async () => {
    try {
      await queryClient.cancelQueries();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      queryClient.clear();

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      }).catch(() => {});
    } finally {
      window.location.replace("/auth/login");
    }
  };

  const filteredUsers = useMemo(() => {
    const value = searchTerm
      .trim()
      .toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value)
      );
    });
  }, [users, searchTerm]);

  const filteredProperties = useMemo(() => {
    const value = searchTerm
      .trim()
      .toLowerCase();

    if (!value) {
      return properties;
    }

    return properties.filter((property) => {
      return (
        property.title
          .toLowerCase()
          .includes(value) ||
        property.location
          .toLowerCase()
          .includes(value) ||
        property.propertyType
          .toLowerCase()
          .includes(value) ||
        property.landlord.name
          .toLowerCase()
          .includes(value)
      );
    });
  }, [properties, searchTerm]);

  const filteredRentals = useMemo(() => {
    const value = searchTerm
      .trim()
      .toLowerCase();

    if (!value) {
      return rentalRequests;
    }

    return rentalRequests.filter((request) => {
      return (
        request.tenant.name
          .toLowerCase()
          .includes(value) ||
        request.tenant.email
          .toLowerCase()
          .includes(value) ||
        request.property.title
          .toLowerCase()
          .includes(value) ||
        request.status.toLowerCase().includes(value)
      );
    });
  }, [rentalRequests, searchTerm]);

  const filteredPayments = useMemo(() => {
    const value = searchTerm
      .trim()
      .toLowerCase();

    if (!value) {
      return payments;
    }

    return payments.filter((payment) => {
      return (
        payment.rentalRequest.tenant.name
          .toLowerCase()
          .includes(value) ||
        payment.rentalRequest.tenant.email
          .toLowerCase()
          .includes(value) ||
        payment.rentalRequest.property.title
          .toLowerCase()
          .includes(value) ||
        payment.status.toLowerCase().includes(value)
      );
    });
  }, [payments, searchTerm]);

  const isInitialLoading =
    statsLoading ||
    usersLoading ||
    propertiesLoading ||
    rentalsLoading ||
    paymentsLoading;

  if (isInitialLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />

          <p className="text-slate-600">
            Loading admin dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (statsError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />

          <h1 className="text-xl font-bold">
            Unable to load admin dashboard
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Your session may have expired or you may not
            have admin access.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => refetchStats()}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Try Again
            </button>

            <button
              onClick={() =>
                window.location.replace("/auth/login")
              }
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Go to Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-medium text-blue-600">
                  Admin Dashboard
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  RentNest Administration
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Manage users, properties, rentals and payments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={refreshDashboard}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Messages */}
        {(message || error) && (
          <div className="mb-6">
            {message && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <section className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-2">
            {[
              {
                id: "overview",
                label: "Overview",
                icon: ShieldCheck,
              },
              {
                id: "users",
                label: "Users",
                icon: Users,
              },
              {
                id: "properties",
                label: "Properties",
                icon: Home,
              },
              {
                id: "rentals",
                label: "Rentals",
                icon: ClipboardList,
              },
              {
                id: "payments",
                label: "Payments",
                icon: CreditCard,
              },
            ].map((item) => {
              const Icon = item.icon;

              const active =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(
                      item.id as
                        | "overview"
                        | "users"
                        | "properties"
                        | "rentals"
                        | "payments"
                    );

                    setSearchTerm("");
                    clearMessages();
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Overview */}
        {activeSection === "overview" && (
          <>
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Total Users
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {stats?.users.total ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {stats?.users.tenants ?? 0} tenants
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Landlords
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {stats?.users.landlords ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Property owners
                    </p>
                  </div>

                  <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                    <Building2 className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Properties
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {stats?.properties.total ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {stats?.properties.available ?? 0} available
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Home className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      Revenue
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {formatPrice(
                        stats?.payments.revenue ?? 0
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Completed payments
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                    <Clock className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Pending Rentals
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {stats?.rentals.pending ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <UserCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Active Rentals
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {stats?.rentals.active ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Completed Rentals
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {stats?.rentals.completed ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <CreditCard className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Payments
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {stats?.payments.completed ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Search */}
        {activeSection !== "overview" && (
          <section className="mb-5">
            <div className="relative">
              <Users className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder={`Search ${
                  activeSection === "users"
                    ? "users..."
                    : activeSection === "properties"
                    ? "properties..."
                    : activeSection === "rentals"
                    ? "rental requests..."
                    : "payments..."
                }`}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </section>
        )}

        {/* Users */}
        {activeSection === "users" && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold">
                User Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage tenant, landlord and admin accounts.
              </p>
            </div>

            {usersError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Failed to load users.
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300" />

                <p className="mt-4 font-medium text-slate-700">
                  No users found
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-200 text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-4 font-semibold">
                          User
                        </th>

                        <th className="px-5 py-4 font-semibold">
                          Role
                        </th>

                        <th className="px-5 py-4 font-semibold">
                          Status
                        </th>

                        <th className="px-5 py-4 font-semibold">
                          Registered
                        </th>

                        <th className="px-5 py-4 text-right font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {user.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {user.email}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {user.role}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                user.isBanned
                                  ? "bg-red-50 text-red-700"
                                  : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {user.isBanned
                                ? "BANNED"
                                : "ACTIVE"}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {formatDate(user.createdAt)}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {user.role === "ADMIN" ? (
                              <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-400">
                                <ShieldCheck className="h-4 w-4" />
                                Protected
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleUserStatus(user)
                                }
                                disabled={
                                  actionLoading ===
                                  `ban-${user.id}` ||
                                  actionLoading ===
                                  `unban-${user.id}`
                                }
                                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  user.isBanned
                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                }`}
                              >
                                {actionLoading ===
                                  `ban-${user.id}` ||
                                actionLoading ===
                                  `unban-${user.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : user.isBanned ? (
                                  <UserRoundCheck className="h-4 w-4" />
                                ) : (
                                  <Ban className="h-4 w-4" />
                                )}

                                {user.isBanned
                                  ? "Unban"
                                  : "Ban"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Properties */}
        {activeSection === "properties" && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold">
                Property Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Monitor properties and manage their availability.
              </p>
            </div>

            {propertiesError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Failed to load properties.
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Home className="mx-auto h-12 w-12 text-slate-300" />

                <p className="mt-4 font-medium text-slate-700">
                  No properties found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="relative h-48 bg-slate-100">
                      {property.imageUrl ? (
                        <img
                          src={property.imageUrl}
                          alt={property.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Home className="h-16 w-16 text-slate-300" />
                        </div>
                      )}

                      <span
                        className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          property.status
                        )}`}
                      >
                        {property.status}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-1 text-lg font-bold">
                          {property.title}
                        </h3>

                        <span className="shrink-0 text-sm font-semibold text-blue-600">
                          {formatPrice(property.price)}
                        </span>
                      </div>

                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                      </p>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Landlord
                        </p>

                        <p className="mt-1 font-medium text-slate-800">
                          {property.landlord.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {property.landlord.email}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {property.category.name}
                        </p>
                      </div>

                      <div className="mt-5">
                        <label className="mb-2 block text-xs font-medium text-slate-500">
                          Change Status
                        </label>

                        <select
                          value={property.status}
                          disabled={
                            actionLoading ===
                            `property-${property.id}`
                          }
                          onChange={(event) =>
                            handlePropertyStatus(
                              property,
                              event.target
                                .value as
                                | "AVAILABLE"
                                | "RENTED"
                                | "UNAVAILABLE"
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                        >
                          <option value="AVAILABLE">
                            AVAILABLE
                          </option>

                          <option value="RENTED">
                            RENTED
                          </option>

                          <option value="UNAVAILABLE">
                            UNAVAILABLE
                          </option>
                        </select>

                        {actionLoading ===
                          `property-${property.id}` && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Updating status...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Rentals */}
        {activeSection === "rentals" && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold">
                Rental Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Monitor all rental activity across RentNest.
              </p>
            </div>

            {rentalsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Failed to load rental requests.
              </div>
            ) : filteredRentals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-slate-300" />

                <p className="mt-4 font-medium text-slate-700">
                  No rental requests found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRentals.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold">
                            {request.property.title}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <span className="text-slate-400">
                              Tenant
                            </span>

                            <p className="mt-1 font-medium">
                              {request.tenant.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {request.tenant.email}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400">
                              Landlord
                            </span>

                            <p className="mt-1 font-medium">
                              {request.property.landlord.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {request.property.landlord.email}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400">
                              Monthly Rent
                            </span>

                            <p className="mt-1 font-semibold text-blue-600">
                              {formatPrice(
                                request.property.price
                              )}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400">
                              Location
                            </span>

                            <p className="mt-1 flex items-center gap-1 font-medium">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              {request.property.location}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400">
                              Move-in Date
                            </span>

                            <p className="mt-1 font-medium">
                              {formatDate(
                                request.moveInDate
                              )}
                            </p>
                          </div>

                          <div>
                            <span className="text-slate-400">
                              Request Date
                            </span>

                            <p className="mt-1 font-medium">
                              {formatDate(
                                request.createdAt
                              )}
                            </p>
                          </div>
                        </div>

                        {request.payment && (
                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-slate-400">
                                  Payment
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                  {request.payment.status}
                                </p>
                              </div>

                              <p className="font-semibold text-blue-600">
                                {formatPrice(
                                  request.payment.amount
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Payments */}
        {activeSection === "payments" && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold">
                Payment History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Monitor Stripe payment transactions.
              </p>
            </div>

            {paymentsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
                Failed to load payments.
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-slate-300" />

                <p className="mt-4 font-medium text-slate-700">
                  No payments found
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-225 text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-5 py-4 font-semibold">
                          Tenant
                        </th>

                        <th className="px-5 py-4 font-semibold">
                          Property
                        </th>

                        <th className="px-5 py-4 font-semibold">
                          Amount
                        </th>

                        <th className="px-5 py-4 font-semibold">
                          Provider
                        </th>

                        <th className="px-5 py-4 font-semibold">
                          Status
                        </th>

                        <th className="px-5 py-4 font-semibold">
                          Paid Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold">
                              {
                                payment.rentalRequest
                                  .tenant.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                payment.rentalRequest
                                  .tenant.email
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium">
                              {
                                payment.rentalRequest
                                  .property.title
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {
                                payment.rentalRequest
                                  .property.location
                              }
                            </p>
                          </td>

                          <td className="px-5 py-4 font-semibold text-blue-600">
                            {formatPrice(
                              payment.amount
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {payment.provider}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {formatDate(
                              payment.paidAt
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}