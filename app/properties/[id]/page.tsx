"use client";

import { FormEvent, useEffect, useState } from "react";
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
} from "lucide-react";

import type { PropertyResponse } from "@/types/property";

interface RentalRequestResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const propertyId = params.id as string;

  const [property, setProperty] =
    useState<PropertyResponse["data"] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
            data.message || "Failed to load property."
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

      /*
       * Date input gives us:
       *
       * 2026-09-20
       *
       * Backend requires:
       *
       * 2026-09-20T00:00:00.000Z
       *
       * Convert the selected date to ISO datetime.
       */
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
          },
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span>Loading property...</span>
          </div>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              Property Not Found
            </h1>

            <p className="mb-6 text-red-600">
              {error ||
                "The property you are looking for does not exist."}
            </p>

            <button
              onClick={() => router.push("/properties")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
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
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/properties")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </button>

        {/* Property Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
              {property.propertyType}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                property.status === "AVAILABLE"
                  ? "bg-green-50 text-green-600"
                  : property.status === "RENTED"
                  ? "bg-red-50 text-red-600"
                  : "bg-yellow-50 text-yellow-600"
              }`}
            >
              {property.status}
            </span>

            {property.category && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {property.category.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {property.title}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-gray-500">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>{property.location}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Side */}
          <div className="space-y-8 lg:col-span-2">
            {/* Image */}
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="h-[320px] w-full object-cover sm:h-[450px]"
                />
              ) : (
                <div className="flex h-[320px] items-center justify-center bg-gray-100 sm:h-[450px]">
                  <div className="text-center text-gray-400">
                    <Home className="mx-auto mb-3 h-12 w-12" />
                    <p>No property image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Property Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <BedDouble className="mb-2 h-6 w-6 text-blue-600" />

                  <p className="text-sm text-gray-500">
                    Bedrooms
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {property.bedrooms}
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-4">
                  <Bath className="mb-2 h-6 w-6 text-cyan-600" />

                  <p className="text-sm text-gray-500">
                    Bathrooms
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {property.bathrooms}
                  </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4">
                  <Home className="mb-2 h-6 w-6 text-green-600" />

                  <p className="text-sm text-gray-500">
                    Property Type
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {property.propertyType}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Description
              </h2>

              <p className="leading-7 text-gray-600">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities &&
              property.amenities.length > 0 && (
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-2xl font-bold text-gray-900">
                    Amenities
                  </h2>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {property.amenities.map(
                      (amenity) => (
                        <div
                          key={amenity}
                          className="rounded-xl bg-gray-50 px-4 py-3 text-gray-700"
                        >
                          <span className="mr-2 text-green-600">
                            ✓
                          </span>
                          {amenity}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Landlord */}
            {property.landlord && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-2xl font-bold text-gray-900">
                  Landlord
                </h2>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {property.landlord.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {property.landlord.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Price Card */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-gray-500">
                  Monthly Rent
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ৳{property.price.toLocaleString()}
                  </span>

                  <span className="pb-1 text-gray-500">
                    / month
                  </span>
                </div>

                {/* Watchlist */}
                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
                >
                  <Heart className="h-5 w-5" />
                  Add to Watchlist
                </button>

                {/* Request Button */}
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
                  <div className="mt-3 rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-500">
                    This property is currently not available
                  </div>
                )}
              </div>

              {/* Request Form */}
              {showRequestForm && isAvailable && (
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-gray-900">
                      Request to Rent
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Send a rental request to the landlord.
                    </p>
                  </div>

                  <form
                    onSubmit={handleRequestSubmit}
                    className="space-y-5"
                  >
                    {/* Move-in Date */}
                    <div>
                      <label
                        htmlFor="moveInDate"
                        className="mb-2 block text-sm font-medium text-gray-700"
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
                          onChange={(event) => {
                            setMoveInDate(
                              event.target.value
                            );
                            setRequestError("");
                          }}
                          min={getTodayDate()}
                          required
                          className="block w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-10 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        Please select your preferred move-in date.
                      </p>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Message{" "}
                        <span className="text-gray-400">
                          (Optional)
                        </span>
                      </label>

                      <div className="relative">
                        <MessageSquare className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-blue-600" />

                        <textarea
                          id="message"
                          name="message"
                          value={message}
                          onChange={(event) =>
                            setMessage(
                              event.target.value
                            )
                          }
                          maxLength={500}
                          rows={5}
                          placeholder="Write a message to the landlord..."
                          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-10 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <p className="mt-1 text-right text-xs text-gray-400">
                        {message.length}/500
                      </p>
                    </div>

                    {/* Error */}
                    {requestError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {requestError}
                      </div>
                    )}

                    {/* Success */}
                    {requestSuccess && (
                      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                        {requestSuccess}
                      </div>
                    )}

                    {/* Submit */}
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

              {/* Important Note */}
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <h3 className="mb-2 font-semibold text-blue-700">
                  Before you request
                </h3>

                <ul className="space-y-2 text-sm leading-6 text-gray-600">
                  <li>
                    • Make sure the move-in date is suitable for you.
                  </li>

                  <li>
                    • The landlord will review your request.
                  </li>

                  <li>
                    • You can track your request from your dashboard.
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