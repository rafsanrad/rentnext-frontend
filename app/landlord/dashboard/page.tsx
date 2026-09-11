"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  address?: string | null;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}

interface Property {
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
  status:
    | "AVAILABLE"
    | "RENTED"
    | "UNAVAILABLE";
  landlordId?: string;
  categoryId: string;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
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
  moveInDate: string;
  message?: string | null;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";
  createdAt: string;
  property: {
    id: string;
    title: string;
    location: string;
    price: number | string;
    status: string;
  };
  tenant: Tenant;
  payment?: Payment | null;
}

interface MeResponse {
  success: boolean;
  message: string;
  data: User;
}

interface RentalRequestsResponse {
  success: boolean;
  message: string;
  data: RentalRequest[];
}

interface PropertiesResponse {
  success: boolean;
  message: string;
  data: Property[];
}

interface CategoriesResponse {
  success: boolean;
  message: string;
  data: Category[];
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
  status:
    | "AVAILABLE"
    | "RENTED"
    | "UNAVAILABLE";
}

const initialFormData: PropertyFormData = {
  title: "",
  description: "",
  location: "",
  price: "",
  propertyType: "",
  bedrooms: "1",
  bathrooms: "1",
  amenities: "",
  imageUrl: "",
  categoryId: "",
  status: "AVAILABLE",
};

async function fetchUser(): Promise<User> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
  });

  const data: MeResponse =
    await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Unable to load user information."
    );
  }

  return data.data;
}

async function fetchRentalRequests(): Promise<
  RentalRequest[]
> {
  const response = await fetch(
    "/api/landlord/rental-requests",
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

  return data.data || [];
}

async function fetchMyProperties(): Promise<
  Property[]
> {
  const response = await fetch(
    "/api/landlord/properties",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data: PropertiesResponse =
    await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Unable to load your properties."
    );
  }

  return data.data || [];
}

async function fetchCategories(): Promise<
  Category[]
> {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000/api";

  const response = await fetch(
    `${apiUrl}/categories`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data: CategoriesResponse =
    await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ||
        "Unable to load categories."
    );
  }

  return data.data || [];
}

export default function LandlordDashboardPage() {
  const [actionLoadingId, setActionLoadingId] =
    useState<string | null>(null);

  const [propertyActionLoading, setPropertyActionLoading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [propertyError, setPropertyError] =
    useState("");

  const [showPropertyForm, setShowPropertyForm] =
    useState(false);

  const [editingProperty, setEditingProperty] =
    useState<Property | null>(null);

  const [formData, setFormData] =
    useState<PropertyFormData>(
      initialFormData
    );

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["landlord-user"],
    queryFn: fetchUser,
  });

  const {
    data: rentalRequests = [],
    isLoading: isRequestsLoading,
    error: requestsError,
    refetch: refetchRentalRequests,
  } = useQuery({
    queryKey: ["landlord-rental-requests"],
    queryFn: fetchRentalRequests,
  });

  const {
    data: properties = [],
    isLoading: isPropertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useQuery({
    queryKey: ["landlord-properties"],
    queryFn: fetchMyProperties,
  });

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["property-categories"],
    queryFn: fetchCategories,
  });

  const isInitialLoading =
    isUserLoading ||
    isRequestsLoading ||
    isPropertiesLoading ||
    isCategoriesLoading;

  const error =
    userError?.message ||
    requestsError?.message ||
    propertiesError?.message ||
    categoriesError?.message ||
    "";

  const pendingRequests = useMemo(
    () =>
      rentalRequests.filter(
        (request) =>
          request.status === "PENDING"
      ),
    [rentalRequests]
  );

  const approvedRequests = useMemo(
    () =>
      rentalRequests.filter(
        (request) =>
          request.status === "APPROVED"
      ),
    [rentalRequests]
  );

  const rejectedRequests = useMemo(
    () =>
      rentalRequests.filter(
        (request) =>
          request.status === "REJECTED"
      ),
    [rentalRequests]
  );

  const activeRequests = useMemo(
    () =>
      rentalRequests.filter(
        (request) =>
          request.status !== "CANCELLED"
      ),
    [rentalRequests]
  );

  const availableProperties = useMemo(
    () =>
      properties.filter(
        (property) =>
          property.status === "AVAILABLE"
      ),
    [properties]
  );

  const rentedProperties = useMemo(
    () =>
      properties.filter(
        (property) =>
          property.status === "RENTED"
      ),
    [properties]
  );

  const resetPropertyForm = () => {
    setFormData(initialFormData);
    setEditingProperty(null);
    setShowPropertyForm(false);
    setPropertyError("");
  };

  const openAddPropertyForm = () => {
    setEditingProperty(null);

    setFormData({
      ...initialFormData,
      categoryId:
        categories.length > 0
          ? categories[0].id
          : "",
    });

    setPropertyError("");
    setSuccessMessage("");
    setShowPropertyForm(true);
  };

  const openEditPropertyForm = (
    property: Property
  ) => {
    setEditingProperty(property);

    setFormData({
      title: property.title,
      description: property.description,
      location: property.location,
      price: String(property.price),
      propertyType: property.propertyType,
      bedrooms: String(property.bedrooms),
      bathrooms: String(property.bathrooms),
      amenities:
        property.amenities?.join(", ") || "",
      imageUrl: property.imageUrl || "",
      categoryId: property.categoryId,
      status: property.status,
    });

    setPropertyError("");
    setSuccessMessage("");
    setShowPropertyForm(true);
  };

  const handleFormChange = (
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

    try {
      setPropertyActionLoading(true);
      setPropertyError("");
      setSuccessMessage("");

      if (!formData.title.trim()) {
        throw new Error(
          "Property title is required."
        );
      }

      if (!formData.description.trim()) {
        throw new Error(
          "Property description is required."
        );
      }

      if (!formData.location.trim()) {
        throw new Error(
          "Property location is required."
        );
      }

      const price = Number(formData.price);
      const bedrooms = Number(
        formData.bedrooms
      );
      const bathrooms = Number(
        formData.bathrooms
      );

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        throw new Error(
          "Please enter a valid price."
        );
      }

      if (
        !Number.isInteger(bedrooms) ||
        bedrooms < 0
      ) {
        throw new Error(
          "Please enter a valid number of bedrooms."
        );
      }

      if (
        !Number.isInteger(bathrooms) ||
        bathrooms < 0
      ) {
        throw new Error(
          "Please enter a valid number of bathrooms."
        );
      }

      if (!formData.propertyType.trim()) {
        throw new Error(
          "Property type is required."
        );
      }

      if (!formData.categoryId) {
        throw new Error(
          "Please select a category."
        );
      }

      const amenities = formData.amenities
        .split(",")
        .map((amenity) => amenity.trim())
        .filter(Boolean);

      if (amenities.length === 0) {
        throw new Error(
          "Please add at least one amenity."
        );
      }

      const payload: {
        title: string;
        description: string;
        location: string;
        price: number;
        propertyType: string;
        bedrooms: number;
        bathrooms: number;
        amenities: string[];
        imageUrl?: string;
        categoryId: string;
        status?:
          | "AVAILABLE"
          | "RENTED"
          | "UNAVAILABLE";
      } = {
        title: formData.title.trim(),
        description:
          formData.description.trim(),
        location:
          formData.location.trim(),
        price,
        propertyType:
          formData.propertyType.trim(),
        bedrooms,
        bathrooms,
        amenities,
        categoryId: formData.categoryId,
      };

      if (formData.imageUrl.trim()) {
        payload.imageUrl =
          formData.imageUrl.trim();
      }

      if (editingProperty) {
        payload.status = formData.status;
      }

      const endpoint = editingProperty
        ? `/api/landlord/properties/${editingProperty.id}`
        : "/api/landlord/properties";

      const method = editingProperty
        ? "PATCH"
        : "POST";

      const response = await fetch(
        endpoint,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Unable to ${
              editingProperty
                ? "update"
                : "create"
            } property.`
        );
      }

      setSuccessMessage(
        editingProperty
          ? "Property updated successfully."
          : "Property created successfully."
      );

      resetPropertyForm();

      await refetchProperties();
    } catch (error) {
      console.error(
        "Property form error:",
        error
      );

      setPropertyError(
        error instanceof Error
          ? error.message
          : "Unable to save property."
      );
    } finally {
      setPropertyActionLoading(false);
    }
  };

  const handleDeleteProperty = async (
    property: Property
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPropertyActionLoading(true);
      setPropertyError("");
      setSuccessMessage("");

      const response = await fetch(
        `/api/landlord/properties/${property.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete property."
        );
      }

      setSuccessMessage(
        "Property deleted successfully."
      );

      await refetchProperties();
    } catch (error) {
      console.error(
        "Delete property error:",
        error
      );

      setPropertyError(
        error instanceof Error
          ? error.message
          : "Unable to delete property."
      );
    } finally {
      setPropertyActionLoading(false);
    }
  };

  const handleStatusUpdate = async (
    requestId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    const action =
      status === "APPROVED"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this rental request?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(requestId);
      setSuccessMessage("");

      const response = await fetch(
        `/api/landlord/rental-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Unable to ${action} rental request.`
        );
      }

      setSuccessMessage(
        status === "APPROVED"
          ? "Rental request approved successfully."
          : "Rental request rejected successfully."
      );

      await Promise.all([
        refetchRentalRequests(),
        refetchProperties(),
      ]);
    } catch (error) {
      console.error(
        "Rental request status update error:",
        error
      );

      window.alert(
        error instanceof Error
          ? error.message
          : `Unable to ${action} rental request.`
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href =
        "/auth/login";
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const formatPrice = (
    price: number | string
  ) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const getStatusStyle = (
    status: RentalRequest["status"]
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getPropertyStatusStyle = (
    status: Property["status"]
  ) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "RENTED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "UNAVAILABLE":
        return "bg-gray-100 text-gray-600 border-gray-200";

      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  if (isInitialLoading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 rounded-lg bg-gray-200" />

            <div className="h-5 w-96 rounded bg-gray-200" />

            <div className="grid gap-5 md:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 rounded-2xl bg-gray-200"
                />
              ))}
            </div>

            <div className="h-64 rounded-2xl bg-gray-200" />

            <div className="h-64 rounded-2xl bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Landlord Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Welcome,{" "}
              {user?.name || "Landlord"} 👋
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your rental requests and
              properties from one place.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

            <button
              onClick={() => {
                window.location.reload();
              }}
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Property Error */}
        {propertyError && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-700">
              {propertyError}
            </p>

            <button
              onClick={() =>
                setPropertyError("")
              }
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <p className="text-sm font-medium text-emerald-700">
              {successMessage}
            </p>

            <button
              onClick={() =>
                setSuccessMessage("")
              }
              className="text-emerald-600 hover:text-emerald-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Requests */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Total Requests
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                📋
              </div>
            </div>

            <p className="text-3xl font-bold text-gray-900">
              {activeRequests.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Active rental requests
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Pending
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                ⏳
              </div>
            </div>

            <p className="text-3xl font-bold text-gray-900">
              {pendingRequests.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Waiting for your decision
            </p>
          </div>

          {/* Approved */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                Approved
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>
            </div>

            <p className="text-3xl font-bold text-gray-900">
              {approvedRequests.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Successfully approved
            </p>
          </div>

          {/* Properties */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                My Properties
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                🏠
              </div>
            </div>

            <p className="text-3xl font-bold text-gray-900">
              {properties.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {availableProperties.length} available
            </p>
          </div>
        </section>

        {/* My Properties */}
        <section className="mb-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                My Properties
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add, edit and manage your rental
                properties.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setSuccessMessage("");
                  void refetchProperties();
                }}
                disabled={isPropertiesLoading}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPropertiesLoading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <button
                onClick={openAddPropertyForm}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                + Add Property
              </button>
            </div>
          </div>

          {/* Property Summary */}
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {properties.length}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Available
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-700">
                {availableProperties.length}
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                Rented
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-700">
                {rentedProperties.length}
              </p>
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                🏠
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                No properties yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                Add your first property to start
                receiving rental requests.
              </p>

              <button
                onClick={openAddPropertyForm}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add Your First Property
              </button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {property.imageUrl ? (
                      <img
                        src={property.imageUrl}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        🏠
                      </div>
                    )}

                    <span
                      className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold ${getPropertyStatusStyle(
                        property.status
                      )}`}
                    >
                      {property.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
                          {property.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          📍 {property.location}
                        </p>
                      </div>

                      <p className="shrink-0 text-lg font-bold text-blue-600">
                        {formatPrice(
                          property.price
                        )}
                      </p>
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm leading-6 text-gray-600">
                      {property.description}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium text-gray-600">
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5">
                        🛏️ {property.bedrooms}{" "}
                        Beds
                      </span>

                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5">
                        🛁 {property.bathrooms}{" "}
                        Baths
                      </span>

                      <span className="rounded-lg bg-gray-100 px-2.5 py-1.5">
                        🏢{" "}
                        {property.propertyType}
                      </span>
                    </div>

                    <div className="mb-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Category
                      </p>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {property.category
                          ?.name ||
                          "Uncategorized"}
                      </span>
                    </div>

                    {property.amenities?.length >
                      0 && (
                      <div className="mb-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Amenities
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {property.amenities
                            .slice(0, 5)
                            .map(
                              (
                                amenity
                              ) => (
                                <span
                                  key={
                                    amenity
                                  }
                                  className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600"
                                >
                                  {
                                    amenity
                                  }
                                </span>
                              )
                            )}

                          {property.amenities
                            .length >
                            5 && (
                            <span className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500">
                              +
                              {property
                                .amenities
                                .length -
                                5}{" "}
                              more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 border-t border-gray-100 pt-4">
                      <button
                        onClick={() =>
                          openEditPropertyForm(
                            property
                          )
                        }
                        disabled={
                          propertyActionLoading
                        }
                        className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          void handleDeleteProperty(
                            property
                          )
                        }
                        disabled={
                          propertyActionLoading
                        }
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Rental Requests */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Rental Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review and manage tenant applications.
              </p>
            </div>

            <button
              onClick={() => {
                setSuccessMessage("");
                void refetchRentalRequests();
              }}
              disabled={isRequestsLoading}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRequestsLoading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          {isRequestsLoading ? (
            <div className="space-y-5">
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          ) : rentalRequests.length ===
            0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-2xl">
                🏠
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                No rental requests yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-gray-500">
                When tenants request one of your
                properties, their applications will
                appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {rentalRequests.map(
                (request) => (
                  <article
                    key={request.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="p-6">
                      {/* Request Header */}
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>

                            <span className="text-xs text-gray-400">
                              Request ID:{" "}
                              {request.id.slice(
                                0,
                                8
                              )}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900">
                            {request.property.title}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            📍{" "}
                            {request.property.location}
                          </p>
                        </div>

                        <div className="text-left lg:text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(
                              request.property.price
                            )}
                          </p>

                          <p className="text-sm text-gray-500">
                            per month
                          </p>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="mt-6 grid gap-5 border-t border-gray-100 pt-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Tenant */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Tenant
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {request.tenant.name}
                          </p>

                          <p className="mt-1 break-all text-sm text-gray-500">
                            {request.tenant.email}
                          </p>
                        </div>

                        {/* Move-in Date */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Move-in Date
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {formatDate(
                              request.moveInDate
                            )}
                          </p>
                        </div>

                        {/* Property Status */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Property Status
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {
                              request
                                .property
                                .status
                            }
                          </p>
                        </div>

                        {/* Requested On */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Requested On
                          </p>

                          <p className="mt-1 font-semibold text-gray-900">
                            {formatDate(
                              request.createdAt
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Tenant Message */}
                      {request.message && (
                        <div className="mt-6 rounded-xl bg-gray-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Tenant Message
                          </p>

                          <p className="mt-2 text-sm leading-6 text-gray-700">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {/* Pending Actions */}
                      {request.status ===
                        "PENDING" && (
                        <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                          <button
                            onClick={() =>
                              void handleStatusUpdate(
                                request.id,
                                "REJECTED"
                              )
                            }
                            disabled={
                              actionLoadingId ===
                              request.id
                            }
                            className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoadingId ===
                            request.id
                              ? "Processing..."
                              : "Reject Request"}
                          </button>

                          <button
                            onClick={() =>
                              void handleStatusUpdate(
                                request.id,
                                "APPROVED"
                              )
                            }
                            disabled={
                              actionLoadingId ===
                              request.id
                            }
                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoadingId ===
                            request.id
                              ? "Processing..."
                              : "Approve Request"}
                          </button>
                        </div>
                      )}

                      {/* Approved */}
                      {request.status ===
                        "APPROVED" && (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                          ✓ This rental request has
                          been approved. The property
                          is now marked as rented.
                        </div>
                      )}

                      {/* Rejected */}
                      {request.status ===
                        "REJECTED" && (
                        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                          This rental request has been
                          rejected.
                        </div>
                      )}

                      {/* Cancelled */}
                      {request.status ===
                        "CANCELLED" && (
                        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
                          This rental request was
                          cancelled by the tenant.
                        </div>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* Add / Edit Property Modal */}
      {showPropertyForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProperty
                    ? "Edit Property"
                    : "Add New Property"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingProperty
                    ? "Update your property information."
                    : "Add a new rental property to RentNest."}
                </p>
              </div>

              <button
                type="button"
                onClick={resetPropertyForm}
                disabled={
                  propertyActionLoading
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handlePropertySubmit}
              className="max-h-[75vh] overflow-y-auto px-6 py-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Property Title
                  </label>

                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                      handleFormChange(
                        "title",
                        event.target.value
                      )
                    }
                    placeholder="Modern Apartment in Dhaka"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={formData.description}
                    onChange={(event) =>
                      handleFormChange(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Describe your property..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={formData.location}
                    onChange={(event) =>
                      handleFormChange(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="Mirpur, Dhaka"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Monthly Price
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={formData.price}
                    onChange={(event) =>
                      handleFormChange(
                        "price",
                        event.target.value
                      )
                    }
                    placeholder="25000"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Property Type */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Property Type
                  </label>

                  <select
                    value={
                      formData.propertyType
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "propertyType",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select property type
                    </option>
                    <option value="Apartment">
                      Apartment
                    </option>
                    <option value="House">
                      House
                    </option>
                    <option value="Studio">
                      Studio
                    </option>
                    <option value="Villa">
                      Villa
                    </option>
                    <option value="Condo">
                      Condo
                    </option>
                    <option value="Duplex">
                      Duplex
                    </option>
                    <option value="Room">
                      Room
                    </option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    value={
                      formData.categoryId
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "categoryId",
                        event.target.value
                      )
                    }
                    disabled={
                      isCategoriesLoading
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  >
                    <option value="">
                      {isCategoriesLoading
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Bedrooms
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      formData.bedrooms
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "bedrooms",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Bathrooms
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      formData.bathrooms
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "bathrooms",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Image URL
                  </label>

                  <input
                    type="url"
                    value={
                      formData.imageUrl
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "imageUrl",
                        event.target.value
                      )
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Optional. Use a publicly accessible
                    image URL.
                  </p>
                </div>

                {/* Amenities */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Amenities
                  </label>

                  <input
                    type="text"
                    value={
                      formData.amenities
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "amenities",
                        event.target.value
                      )
                    }
                    placeholder="WiFi, Parking, Lift, Gas, Security"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Separate amenities using commas.
                  </p>
                </div>

                {/* Status */}
                {editingProperty && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Status
                    </label>

                    <select
                      value={formData.status}
                      onChange={(event) =>
                        handleFormChange(
                          "status",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="AVAILABLE">
                        Available
                      </option>

                      <option value="RENTED">
                        Rented
                      </option>

                      <option value="UNAVAILABLE">
                        Unavailable
                      </option>
                    </select>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetPropertyForm}
                  disabled={
                    propertyActionLoading
                  }
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    propertyActionLoading
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {propertyActionLoading
                    ? editingProperty
                      ? "Updating..."
                      : "Creating..."
                    : editingProperty
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