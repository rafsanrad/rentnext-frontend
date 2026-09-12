"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  RefreshCw,
  LogOut,
  Home,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  BedDouble,
  Bath,
  DollarSign,
  Search,
  Loader2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  imageUrl?: string | null;
  status: "AVAILABLE" | "RENTED" | "UNAVAILABLE";
  categoryId: string;
  category?: Category;
  createdAt?: string;
}

interface Tenant {
  id: string;
  name: string;
  email: string;
}

interface Payment {
  id: string;
  status: string;
  amount?: number;
}

interface RentalRequest {
  id: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "ACTIVE"
    | "COMPLETED";
  moveInDate: string;
  message?: string | null;
  createdAt: string;
  tenant: Tenant;
  property: {
    id: string;
    title: string;
    location: string;
    price: number;
    status?: string;
  };
  payment?: Payment | null;
}

interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  price: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string;
  imageUrl: string;
  categoryId: string;
  status: "AVAILABLE" | "RENTED" | "UNAVAILABLE";
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const emptyForm: PropertyFormData = {
  title: "",
  description: "",
  location: "",
  price: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  amenities: "",
  imageUrl: "",
  categoryId: "",
  status: "AVAILABLE",
};

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

const fetchUser = async (): Promise<User> => {
  const response = await fetch("/api/auth/me", {
    headers: {
      ...getAuthHeaders(),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load user information"
      )
    );
  }

  const data: ApiResponse<User> = await response.json();

  return data.data;
};

const fetchMyProperties = async (): Promise<Property[]> => {
  const response = await fetch(
    `${API_URL}/landlord/properties`,
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

  const data: ApiResponse<Property[]> =
    await response.json();

  return data.data || [];
};

const fetchRentalRequests =
  async (): Promise<RentalRequest[]> => {
    const response = await fetch(
      `${API_URL}/landlord/rental-requests`,
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

    const data: ApiResponse<RentalRequest[]> =
      await response.json();

    return data.data || [];
  };

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/categories`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load categories"
      )
    );
  }

  const data: ApiResponse<Category[]> =
    await response.json();

  return data.data || [];
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date: string) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function LandlordDashboard() {
  const queryClient = useQueryClient();

  const [showPropertyModal, setShowPropertyModal] =
    useState(false);

  const [editingProperty, setEditingProperty] =
    useState<Property | null>(null);

  const [formData, setFormData] =
    useState<PropertyFormData>(emptyForm);

  const [searchTerm, setSearchTerm] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery({
    queryKey: ["landlord-user"],
    queryFn: fetchUser,
    retry: false,
  });

  const {
    data: properties = [],
    isLoading: propertiesLoading,
    isError: propertiesError,
    refetch: refetchProperties,
  } = useQuery({
    queryKey: ["landlord-properties"],
    queryFn: fetchMyProperties,
    retry: false,
  });

  const {
    data: rentalRequests = [],
    isLoading: requestsLoading,
    isError: requestsError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["landlord-rental-requests"],
    queryFn: fetchRentalRequests,
    retry: false,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["property-categories"],
    queryFn: fetchCategories,
    retry: false,
  });

  const visibleRentalRequests = useMemo(() => {
    const completedPropertyIds = new Set(
      rentalRequests
        .filter(
          (request) => request.status === "COMPLETED"
        )
        .map((request) => request.property.id)
    );

    return rentalRequests.filter((request) => {
      if (request.status === "COMPLETED") {
        return true;
      }

      if (request.status === "CANCELLED") {
        return false;
      }

      if (
        completedPropertyIds.has(
          request.property.id
        )
      ) {
        return false;
      }

      return true;
    });
  }, [rentalRequests]);

  const filteredProperties = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) {
      return properties;
    }

    return properties.filter((property) => {
      return (
        property.title.toLowerCase().includes(value) ||
        property.location.toLowerCase().includes(value) ||
        property.propertyType
          .toLowerCase()
          .includes(value)
      );
    });
  }, [properties, searchTerm]);

  const pendingRequests = useMemo(
    () =>
      visibleRentalRequests.filter(
        (request) => request.status === "PENDING"
      ),
    [visibleRentalRequests]
  );

  const availableProperties = useMemo(
    () =>
      properties.filter(
        (property) => property.status === "AVAILABLE"
      ),
    [properties]
  );

  const rentedProperties = useMemo(
    () =>
      properties.filter(
        (property) => property.status === "RENTED"
      ),
    [properties]
  );

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const refreshDashboard = async () => {
    clearMessages();

    try {
      await Promise.all([
        refetchProperties(),
        refetchRequests(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh dashboard."
      );
    }
  };

  const openAddPropertyModal = () => {
    setEditingProperty(null);
    setFormData(emptyForm);
    clearMessages();
    setShowPropertyModal(true);
  };

  const openEditPropertyModal = (
    property: Property
  ) => {
    setEditingProperty(property);

    setFormData({
      title: property.title || "",
      description: property.description || "",
      location: property.location || "",
      price: String(property.price ?? ""),
      propertyType: property.propertyType || "",
      bedrooms: String(property.bedrooms ?? ""),
      bathrooms: String(property.bathrooms ?? ""),
      amenities: Array.isArray(property.amenities)
        ? property.amenities.join(", ")
        : "",
      imageUrl: property.imageUrl || "",
      categoryId: property.categoryId || "",
      status: property.status || "AVAILABLE",
    });

    clearMessages();
    setShowPropertyModal(true);
  };

  const closePropertyModal = () => {
    if (submitting) {
      return;
    }

    setShowPropertyModal(false);
    setEditingProperty(null);
    setFormData(emptyForm);
  };

  const handleInputChange = (
    field: keyof PropertyFormData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handlePropertySubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    clearMessages();

    if (!formData.title.trim()) {
      setError("Property title is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Property description is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Property location is required.");
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (!formData.propertyType.trim()) {
      setError("Property type is required.");
      return;
    }

    if (
      formData.bedrooms === "" ||
      Number(formData.bedrooms) < 0
    ) {
      setError("Please enter a valid number of bedrooms.");
      return;
    }

    if (
      formData.bathrooms === "" ||
      Number(formData.bathrooms) < 0
    ) {
      setError("Please enter a valid number of bathrooms.");
      return;
    }

    if (!formData.categoryId) {
      setError("Please select a category.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        price: Number(formData.price),
        propertyType: formData.propertyType.trim(),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        imageUrl: formData.imageUrl.trim() || undefined,
        categoryId: formData.categoryId,
        ...(editingProperty
          ? {
              status: formData.status,
            }
          : {}),
      };

      const url = editingProperty
        ? `${API_URL}/landlord/properties/${editingProperty.id}`
        : `${API_URL}/landlord/properties`;

      const method = editingProperty ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            editingProperty
              ? "Failed to update property"
              : "Failed to create property"
          )
        );
      }

      const data = await response.json();

      setMessage(
        data.message ||
          (editingProperty
            ? "Property updated successfully."
            : "Property created successfully.")
      );

      await queryClient.invalidateQueries({
        queryKey: ["landlord-properties"],
      });

      setShowPropertyModal(false);
      setEditingProperty(null);
      setFormData(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async (
    propertyId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this property?"
    );

    if (!confirmed) {
      return;
    }

    clearMessages();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    setActionLoading(`delete-${propertyId}`);

    try {
      const response = await fetch(
        `${API_URL}/landlord/properties/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            ...getAuthHeaders(),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            "Failed to delete property"
          )
        );
      }

      const data = await response.json();

      setMessage(
        data.message ||
          "Property deleted successfully."
      );

      await queryClient.invalidateQueries({
        queryKey: ["landlord-properties"],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete property."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRentalRequestStatus = async (
    requestId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    clearMessages();

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError(
        "Authentication token not found. Please login again."
      );
      return;
    }

    const confirmed = window.confirm(
      status === "APPROVED"
        ? "Are you sure you want to approve this rental request?"
        : "Are you sure you want to reject this rental request?"
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(`${status}-${requestId}`);

    try {
      const response = await fetch(
        `${API_URL}/landlord/rental-requests/${requestId}/status`,
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
            `Failed to ${status.toLowerCase()} rental request`
          )
        );
      }

      const data = await response.json();

      setMessage(
        data.message ||
          `Rental request ${status.toLowerCase()} successfully.`
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["landlord-rental-requests"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["landlord-properties"],
        }),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update rental request."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * Logout
   *
   * Important:
   * - Remove localStorage authentication first.
   * - Clear React Query cache.
   * - Try to remove the httpOnly cookie through
   *   the Next.js logout route.
   * - Even if the logout API fails, redirect anyway.
   */
  const handleLogout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      queryClient.clear();

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      }).catch(() => {
        /*
         * Ignore logout API failure.
         * Local authentication is already cleared.
         */
      });
    } finally {
      window.location.replace("/auth/login");
    }
  };

  const isLoading =
    userLoading ||
    propertiesLoading ||
    requestsLoading ||
    categoriesLoading;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />

          <p className="text-slate-600">
            Loading landlord dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (userError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />

          <h1 className="text-xl font-bold">
            Unable to load dashboard
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Your session may have expired. Please login
            again.
          </p>

          <button
            onClick={() =>
              window.location.assign("/auth/login")
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            Go to Login
          </button>
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
            <p className="text-sm font-medium text-blue-600">
              Landlord Dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Welcome, {user?.name || "Landlord"} 👋
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your properties and rental requests.
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

        {/* Stats */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Properties
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {properties.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Home className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Available
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {availableProperties.length}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Rented
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {rentedProperties.length}
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Pending Requests
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {pendingRequests.length}
                </p>
              </div>

              <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>
        </section>

        {/* My Properties */}
        <section className="mb-10">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                My Properties
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add, edit and manage your rental properties.
              </p>
            </div>

            <button
              onClick={openAddPropertyModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
            >
              <Plus className="h-5 w-5" />
              Add Property
            </button>
          </div>

          {/* Search */}
          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search your properties..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {propertiesError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
              Failed to load properties.
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <Home className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                No properties found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {searchTerm
                  ? "Try a different search term."
                  : "Start by adding your first property."}
              </p>

              {!searchTerm && (
                <button
                  onClick={openAddPropertyModal}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Add Property
                </button>
              )}
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
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                        property.status === "AVAILABLE"
                          ? "bg-emerald-500 text-white"
                          : property.status === "RENTED"
                          ? "bg-orange-500 text-white"
                          : "bg-slate-700 text-white"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-1 text-lg font-bold text-slate-900">
                        {property.title}
                      </h3>

                      <span className="shrink-0 text-sm font-semibold text-blue-600">
                        {formatPrice(property.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 shrink-0" />

                      <span className="line-clamp-1">
                        {property.location}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        {property.bedrooms} beds
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {property.bathrooms} baths
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        /month
                      </span>
                    </div>

                    {property.category && (
                      <div className="mt-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-600">
                          {property.category.name}
                        </span>
                      </div>
                    )}

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() =>
                          openEditPropertyModal(property)
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteProperty(property.id)
                        }
                        disabled={
                          actionLoading ===
                          `delete-${property.id}`
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading ===
                        `delete-${property.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}

                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rental Requests */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Rental Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review and manage tenant rental requests.
            </p>
          </div>

          {requestsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
              Failed to load rental requests.
            </div>
          ) : visibleRentalRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
              <Users className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold text-slate-800">
                No rental requests
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                You do not have any active rental requests.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleRentalRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">
                          {request.property.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            request.status === "PENDING"
                              ? "bg-yellow-50 text-yellow-700"
                              : request.status === "APPROVED"
                              ? "bg-blue-50 text-blue-700"
                              : request.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : request.status ===
                                "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : request.status ===
                                "COMPLETED"
                              ? "bg-cyan-50 text-cyan-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                          <span className="text-slate-400">
                            Tenant
                          </span>

                          <p className="mt-1 font-medium text-slate-800">
                            {request.tenant.name}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-400">
                            Email
                          </span>

                          <p className="mt-1 break-all font-medium text-slate-800">
                            {request.tenant.email}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-400">
                            Location
                          </span>

                          <p className="mt-1 flex items-center gap-1 font-medium text-slate-800">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {request.property.location}
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
                            Move-in Date
                          </span>

                          <p className="mt-1 font-medium text-slate-800">
                            {formatDate(
                              request.moveInDate
                            )}
                          </p>
                        </div>

                        <div>
                          <span className="text-slate-400">
                            Request Date
                          </span>

                          <p className="mt-1 font-medium text-slate-800">
                            {formatDate(
                              request.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Tenant Message
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {request.payment && (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">
                                Payment Status
                              </p>

                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {request.payment.status}
                              </p>
                            </div>

                            {request.payment.amount !==
                              undefined && (
                              <p className="text-sm font-semibold text-blue-600">
                                {formatPrice(
                                  request.payment.amount
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {request.status === "PENDING" && (
                      <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                        <button
                          onClick={() =>
                            handleRentalRequestStatus(
                              request.id,
                              "APPROVED"
                            )
                          }
                          disabled={
                            actionLoading ===
                              `APPROVED-${request.id}` ||
                            actionLoading ===
                              `REJECTED-${request.id}`
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          `APPROVED-${request.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}

                          Approve
                        </button>

                        <button
                          onClick={() =>
                            handleRentalRequestStatus(
                              request.id,
                              "REJECTED"
                            )
                          }
                          disabled={
                            actionLoading ===
                              `APPROVED-${request.id}` ||
                            actionLoading ===
                              `REJECTED-${request.id}`
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          `REJECTED-${request.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}

                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProperty
                    ? "Edit Property"
                    : "Add Property"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingProperty
                    ? "Update your property information."
                    : "Add a new rental property."}
                </p>
              </div>

              <button
                onClick={closePropertyModal}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handlePropertySubmit}
              className="p-5"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Property Title
                  </label>

                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                      handleInputChange(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Modern 2 Bedroom Apartment"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={formData.description}
                    onChange={(event) =>
                      handleInputChange(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Describe your property..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={formData.location}
                    onChange={(event) =>
                      handleInputChange(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Dhanmondi, Dhaka"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Monthly Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(event) =>
                      handleInputChange(
                        "price",
                        event.target.value
                      )
                    }
                    placeholder="1200"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Property Type
                  </label>

                  <input
                    type="text"
                    value={formData.propertyType}
                    onChange={(event) =>
                      handleInputChange(
                        "propertyType",
                        event.target.value
                      )
                    }
                    placeholder="Apartment / House / Villa"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </label>

                  <select
                    value={formData.categoryId}
                    onChange={(event) =>
                      handleInputChange(
                        "categoryId",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Bedrooms
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(event) =>
                      handleInputChange(
                        "bedrooms",
                        event.target.value
                      )
                    }
                    placeholder="2"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Bathrooms
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={(event) =>
                      handleInputChange(
                        "bathrooms",
                        event.target.value
                      )
                    }
                    placeholder="2"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Amenities
                  </label>

                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(event) =>
                      handleInputChange(
                        "amenities",
                        event.target.value
                      )
                    }
                    placeholder="WiFi, Parking, Gym, Security"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Separate amenities with commas.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Image URL
                  </label>

                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(event) =>
                      handleInputChange(
                        "imageUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://example.com/property.jpg"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {editingProperty && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Property Status
                    </label>

                    <select
                      value={formData.status}
                      onChange={(event) =>
                        handleInputChange(
                          "status",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closePropertyModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}

                  {editingProperty
                    ? "Update Property"
                    : "Create Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}