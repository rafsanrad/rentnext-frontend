"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { PropertyResponse, Property } from "@/types/property";

async function getProperty(id: string): Promise<PropertyResponse> {
  return apiFetch<PropertyResponse>(`/properties/${id}`);
}

function PropertyDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-80 bg-slate-200 sm:h-96" />

          <div className="space-y-5 p-6 sm:p-8">
            <div className="h-8 w-2/3 rounded bg-slate-200" />
            <div className="h-5 w-1/3 rounded bg-slate-200" />
            <div className="h-20 rounded bg-slate-200" />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();

  const propertyId = params.id;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => getProperty(propertyId),
    enabled: Boolean(propertyId),
  });

  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }

  if (isError || !data?.data) {
    return (
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <div className="text-4xl">⚠️</div>

            <h1 className="mt-4 text-2xl font-bold text-red-700">
              Property not found
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "We could not load this property."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>

              <Link
                href="/properties"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Properties
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const property: Property = data.data;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/properties"
          className="inline-flex items-center text-sm font-medium text-blue-600 transition hover:text-blue-700"
        >
          ← Back to Properties
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Property Image */}
          <div className="relative h-72 bg-slate-200 sm:h-96 lg:h-[500px]">
            {property.imageUrl ? (
              <Image
                src={property.imageUrl}
                alt={property.title}
                fill
                priority
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-lg font-medium text-slate-400">
                  No image available
                </span>
              </div>
            )}

            <div className="absolute left-5 top-5">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-md">
                {property.propertyType}
              </span>
            </div>

            <div className="absolute right-5 top-5">
              <span className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
                {property.status}
              </span>
            </div>
          </div>

          {/* Property Information */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {property.title}
                </h1>

                <p className="mt-3 text-base text-slate-500">
                  📍 {property.location}
                </p>
              </div>

              <div className="shrink-0">
                <p className="text-3xl font-bold text-blue-600">
                  ৳{property.price.toLocaleString()}
                </p>

                <p className="text-right text-sm text-slate-500">per month</p>
              </div>
            </div>

            {/* Property Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-slate-200 py-6 sm:grid-cols-4">
              <div>
                <p className="text-sm text-slate-500">Property Type</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {property.propertyType}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Bedrooms</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {property.bedrooms}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Bathrooms</p>

                <p className="mt-1 font-semibold text-slate-900">
                  {property.bathrooms}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Status</p>

                <p className="mt-1 font-semibold text-green-600">
                  {property.status}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                About this property
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-slate-900">
                  Amenities
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Landlord */}
            {property.landlord && (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-xl font-semibold text-slate-900">
                  Property Owner
                </h2>

                <div className="mt-4">
                  <p className="font-semibold text-slate-900">
                    {property.landlord.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {property.landlord.email}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700"
              >
                Request to Rent
              </button>

              <button
                type="button"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ♡ Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
