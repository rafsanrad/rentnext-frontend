"use client";

import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  MapPin,
  Home,
  User,
  CalendarDays,
  MessageSquare,
  Heart,
  Send,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Star,
} from "lucide-react";

import type { PropertyResponse } from "@/types/property";

interface RentalRequestResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

interface WatchlistResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const propertyId = params.id as string;

  // ========================================
  // PROPERTY STATE
  // ========================================

  const [property, setProperty] =
    useState<PropertyResponse["data"] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // RENTAL REQUEST STATE
  // ========================================

  const [showRequestForm, setShowRequestForm] =
    useState(false);

  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [requestError, setRequestError] =
    useState("");

  const [requestSuccess, setRequestSuccess] =
    useState("");

  // ========================================
  // WATCHLIST STATE
  // ========================================

  const [isInWatchlist, setIsInWatchlist] =
    useState(false);

  const [watchlistLoading, setWatchlistLoading] =
    useState(false);

  const [watchlistMessage, setWatchlistMessage] =
    useState("");

  // ========================================
  // AUTH HEADERS
  // ========================================

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

  // ========================================
  // FETCH PROPERTY
  // ========================================

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `/api/properties/${propertyId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: PropertyResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to load property."
          );
        }

        setProperty(data.data);
      } catch (err) {
        console.error(
          "Property details error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load property."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId]);

  // ========================================
  // LOAD WATCHLIST STATUS
  // ========================================

  useEffect(() => {
    const loadWatchlistStatus = async () => {
      if (typeof window === "undefined") {
        return;
      }

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          "/api/watchlist",
          {
            method: "GET",
            headers: {
              ...getAuthHeaders(),
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data: {
          success: boolean;
          data?: Array<{
            propertyId: string;
          }>;
        } = await response.json();

        if (
          !data.success ||
          !Array.isArray(data.data)
        ) {
          return;
        }

        const exists = data.data.some(
          (item) =>
            item.propertyId === propertyId
        );

        setIsInWatchlist(exists);
      } catch (error) {
        console.error(
          "Failed to load watchlist status:",
          error
        );
      }
    };

    if (propertyId) {
      loadWatchlistStatus();
    }
  }, [propertyId]);

  // ========================================
  // TOGGLE WATCHLIST
  // ========================================

  const handleToggleWatchlist = async () => {
    const token =
      localStorage.getItem("accessToken");

    if (!token) {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent(
          `/properties/${propertyId}`
        )}`
      );

      return;
    }

    try {
      setWatchlistLoading(true);
      setWatchlistMessage("");

      if (isInWatchlist) {
        const response = await fetch(
          `/api/watchlist/${propertyId}`,
          {
            method: "DELETE",
            headers: {
              ...getAuthHeaders(),
            },
            credentials: "include",
            cache: "no-store",
          }
        );

        const data: WatchlistResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to remove property from watchlist."
          );
        }

        setIsInWatchlist(false);

        setWatchlistMessage(
          "Property removed from your watchlist."
        );
      } else {
        const response = await fetch(
          "/api/watchlist",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              ...getAuthHeaders(),
            },
            credentials: "include",
            body: JSON.stringify({
              propertyId,
            }),
            cache: "no-store",
          }
        );

        const data: WatchlistResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to add property to watchlist."
          );
        }

        setIsInWatchlist(true);

        setWatchlistMessage(
          "Property added to your watchlist."
        );
      }

      setTimeout(() => {
        setWatchlistMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Watchlist error:",
        error
      );

      setWatchlistMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong with watchlist."
      );

      setTimeout(() => {
        setWatchlistMessage("");
      }, 4000);
    } finally {
      setWatchlistLoading(false);
    }
  };

  // ========================================
  // GET TODAY DATE
  // ========================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ========================================
  // RENTAL REQUEST
  // ========================================

  const handleRequestSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setRequestError("");
    setRequestSuccess("");

    if (!moveInDate) {
      setRequestError(
        "Please select your preferred move-in date."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const isoMoveInDate =
        new Date(
          `${moveInDate}T00:00:00.000Z`
        ).toISOString();

      const response = await fetch(
        "/api/rental-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          credentials: "include",
          body: JSON.stringify({
            propertyId,
            moveInDate: isoMoveInDate,
            ...(message.trim()
              ? {
                  message: message.trim(),
                }
              : {}),
          }),
        }
      );

      const data: RentalRequestResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to create rental request."
        );
      }

      setRequestSuccess(
        "Rental request submitted successfully!"
      );

      setMoveInDate("");
      setMessage("");

      setTimeout(() => {
        setShowRequestForm(false);
        setRequestSuccess("");
      }, 2000);
    } catch (err) {
      console.error(
        "Rental request error:",
        err
      );

      setRequestError(
        err instanceof Error
          ? err.message
          : "Failed to submit rental request."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

              <span className="font-medium">
                Loading property...
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================

  if (error || !property) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Home className="h-8 w-8 text-red-500" />
            </div>

            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              Property Not Found
            </h1>

            <p className="mb-6 text-sm leading-6 text-red-600">
              {error ||
                "The property you are looking for does not exist."}
            </p>

            <button
              onClick={() =>
                router.push("/properties")
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isAvailable =
    property.status === "AVAILABLE";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ========================================
          WATCHLIST TOAST
      ======================================== */}

      {watchlistMessage && (
        <div className="fixed right-4 top-24 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:right-6 sm:w-auto">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <Heart
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
              />
            </div>

            <p className="pt-1 text-sm font-medium leading-5 text-slate-700">
              {watchlistMessage}
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* ========================================
            BACK BUTTON
        ======================================== */}

        <button
          onClick={() =>
            router.push("/properties")
          }
          className="mb-6 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </button>

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
              {property.propertyType}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                property.status === "AVAILABLE"
                  ? "bg-emerald-50 text-emerald-600"
                  : property.status === "RENTED"
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {property.status}
            </span>

            {property.category && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {property.category.name}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {property.title}
              </h1>

              <div className="mt-4 flex items-start gap-2 text-slate-500">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                <span className="leading-6">
                  {property.location}
                </span>
              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">
                  Monthly Rent
                </p>

                <p className="mt-1 text-3xl font-bold text-blue-600">
                  ৳
                  {Number(
                    property.price
                  ).toLocaleString()}
                  <span className="ml-1 text-sm font-medium text-slate-500">
                    / month
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            MAIN GRID
        ======================================== */}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ========================================
              LEFT CONTENT
          ======================================== */}

          <div className="space-y-8 lg:col-span-2">
            {/* IMAGE */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-[280px] w-full sm:h-[430px] lg:h-[500px]">
                {property.imageUrl ? (
                  <Image
                    src={property.imageUrl}
                    alt={property.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <Home className="h-8 w-8 text-slate-400" />
                      </div>

                      <p className="text-sm font-medium text-slate-500">
                        No property image available
                      </p>
                    </div>
                  </div>
                )}

                {/* Image Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 sm:p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                        Property
                      </p>

                      <p className="mt-1 text-lg font-semibold text-white sm:text-xl">
                        {property.propertyType}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
                      <p className="text-lg font-bold text-slate-900">
                        ৳
                        {Number(
                          property.price
                        ).toLocaleString()}
                        <span className="ml-1 text-xs font-medium text-slate-500">
                          / month
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PROPERTY HIGHLIGHTS */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900">
                  Property Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Key details about this property.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <BedDouble className="h-5 w-5 text-blue-600" />
                  </div>

                  <p className="text-sm text-slate-500">
                    Bedrooms
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {property.bedrooms}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <Bath className="h-5 w-5 text-cyan-600" />
                  </div>

                  <p className="text-sm text-slate-500">
                    Bathrooms
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {property.bathrooms}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <Home className="h-5 w-5 text-emerald-600" />
                  </div>

                  <p className="text-sm text-slate-500">
                    Property Type
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {property.propertyType}
                  </p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-2xl font-bold text-slate-900">
                Description
              </h2>

              <p className="whitespace-pre-line text-[15px] leading-7 text-slate-600">
                {property.description}
              </p>
            </div>

            {/* AMENITIES */}
            {property.amenities &&
              property.amenities.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold text-slate-900">
                      Amenities
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Features included with this property.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {property.amenities.map(
                      (amenity) => (
                        <div
                          key={amenity}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </div>

                          <span className="text-sm font-medium text-slate-700">
                            {amenity}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* LANDLORD */}
            {property.landlord && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Landlord
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Property owner information.
                  </p>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-slate-900">
                      {property.landlord.name}
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-500">
                      {property.landlord.email}
                    </p>
                  </div>

                  <div className="sm:ml-auto">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />

                      <span className="text-xs font-semibold text-slate-600">
                        Verified Landlord
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS PLACEHOLDER */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Reviews
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    See what previous tenants think about this property.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
                  <Star
                    className="h-4 w-4 text-amber-500"
                    fill="currentColor"
                  />

                  <span className="text-sm font-semibold text-amber-700">
                    Tenant Reviews
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <Star className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                <p className="text-sm font-medium text-slate-600">
                  Reviews will appear here.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Verified tenants can submit reviews after completing a rental.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================
              RIGHT SIDEBAR
          ======================================== */}

          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-5">
              {/* PRICE + ACTION CARD */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="lg:hidden">
                  <p className="text-sm font-medium text-slate-500">
                    Monthly Rent
                  </p>

                  <p className="mt-1 text-3xl font-bold text-blue-600">
                    ৳
                    {Number(
                      property.price
                    ).toLocaleString()}
                    <span className="ml-1 text-sm font-medium text-slate-500">
                      / month
                    </span>
                  </p>
                </div>

                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-slate-500">
                    Monthly Rent
                  </p>

                  <p className="mt-1 text-3xl font-bold text-blue-600">
                    ৳
                    {Number(
                      property.price
                    ).toLocaleString()}
                    <span className="ml-1 text-sm font-medium text-slate-500">
                      / month
                    </span>
                  </p>
                </div>

                {/* WATCHLIST */}
                <button
                  type="button"
                  onClick={
                    handleToggleWatchlist
                  }
                  disabled={watchlistLoading}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isInWatchlist
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  {watchlistLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart
                      className="h-5 w-5"
                      fill={
                        isInWatchlist
                          ? "currentColor"
                          : "none"
                      }
                    />
                  )}

                  {watchlistLoading
                    ? "Updating..."
                    : isInWatchlist
                    ? "Remove from Watchlist"
                    : "Add to Watchlist"}
                </button>

                {/* RENT REQUEST */}
                {isAvailable ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestForm(
                        !showRequestForm
                      );

                      setRequestError("");
                      setRequestSuccess("");
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    <CalendarDays className="h-5 w-5" />

                    {showRequestForm
                      ? "Close Request Form"
                      : "Request to Rent"}
                  </button>
                ) : (
                  <div className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500">
                    This property is currently not available
                  </div>
                )}

                {/* QUICK INFO */}
                <div className="mt-5 border-t border-slate-200 pt-5">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-500">
                      Bedrooms
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {property.bedrooms}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-500">
                      Bathrooms
                    </span>

                    <span className="text-sm font-semibold text-slate-900">
                      {property.bathrooms}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-500">
                      Status
                    </span>

                    <span
                      className={`text-sm font-semibold ${
                        property.status ===
                        "AVAILABLE"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* REQUEST FORM */}
              {showRequestForm &&
                isAvailable && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                      </div>

                      <h2 className="text-xl font-bold text-slate-900">
                        Request to Rent
                      </h2>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        Send a rental request to the landlord.
                      </p>
                    </div>

                    <form
                      onSubmit={
                        handleRequestSubmit
                      }
                      className="space-y-5"
                    >
                      {/* MOVE-IN DATE */}
                      <div>
                        <label
                          htmlFor="moveInDate"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Preferred Move-in Date
                        </label>

                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-blue-600" />

                          <input
                            id="moveInDate"
                            name="moveInDate"
                            type="date"
                            value={moveInDate}
                            onChange={(
                              event
                            ) => {
                              setMoveInDate(
                                event.target.value
                              );

                              setRequestError(
                                ""
                              );
                            }}
                            min={getTodayDate()}
                            required
                            className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <p className="mt-2 text-xs text-slate-400">
                          Select a future date for your preferred move-in.
                        </p>
                      </div>

                      {/* MESSAGE */}
                      <div>
                        <label
                          htmlFor="message"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Message{" "}
                          <span className="font-normal text-slate-400">
                            (Optional)
                          </span>
                        </label>

                        <div className="relative">
                          <MessageSquare className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-blue-600" />

                          <textarea
                            id="message"
                            name="message"
                            value={message}
                            onChange={(
                              event
                            ) =>
                              setMessage(
                                event.target.value
                              )
                            }
                            maxLength={500}
                            rows={5}
                            placeholder="Write a message to the landlord..."
                            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <p className="mt-1 text-right text-xs text-slate-400">
                          {message.length}/500
                        </p>
                      </div>

                      {/* ERROR */}
                      {requestError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                          {requestError}
                        </div>
                      )}

                      {/* SUCCESS */}
                      {requestSuccess && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-600">
                          {requestSuccess}
                        </div>
                      )}

                      {/* SUBMIT */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Submit Rental Request
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

              {/* BEFORE YOU REQUEST */}
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />

                  <h3 className="font-semibold text-blue-700">
                    Before you request
                  </h3>
                </div>

                <ul className="space-y-3 text-sm leading-5 text-slate-600">
                  <li className="flex gap-2">
                    <span className="mt-0.5 text-blue-600">
                      •
                    </span>

                    <span>
                      Make sure the move-in date is suitable for you.
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-0.5 text-blue-600">
                      •
                    </span>

                    <span>
                      The landlord will review your request.
                    </span>
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-0.5 text-blue-600">
                      •
                    </span>

                    <span>
                      You can track your request from your dashboard.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}