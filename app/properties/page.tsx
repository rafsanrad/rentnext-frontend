"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type {
  PropertiesResponse,
  Property,
} from "@/types/property";

interface PropertyFilters {
  search: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  bedrooms: string;
  categoryId: string;
}

const initialFilters: PropertyFilters = {
  search: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  propertyType: "",
  bedrooms: "",
  categoryId: "",
};

async function getProperties(
  filters: PropertyFilters
): Promise<PropertiesResponse> {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.location.trim()) {
    params.set("location", filters.location.trim());
  }

  if (filters.minPrice) {
    params.set("minPrice", filters.minPrice);
  }

  if (filters.maxPrice) {
    params.set("maxPrice", filters.maxPrice);
  }

  if (filters.propertyType) {
    params.set("propertyType", filters.propertyType);
  }

  if (filters.bedrooms) {
    params.set("bedrooms", filters.bedrooms);
  }

  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  const queryString = params.toString();

  const endpoint = queryString
    ? `/properties?${queryString}`
    : "/properties";

  return apiFetch<PropertiesResponse>(endpoint);
}

function PropertyCard({
  property,
}: {
  property: Property;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* Property Image */}
      <div className="relative h-56 bg-slate-200">
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm font-medium text-slate-400">
              No image available
            </span>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm">
          {property.propertyType}
        </span>
      </div>

      {/* Property Details */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          {property.title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          📍 {property.location}
        </p>

        {/* Property Features */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
          <span>{property.bedrooms} Beds</span>
          <span>{property.bathrooms} Baths</span>

          {property.amenities?.length > 0 && (
            <span>
              {property.amenities.length} Amenities
            </span>
          )}
        </div>

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        {/* Price + Details */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
          <div>
            <p className="text-xl font-bold text-blue-600">
              ৳{property.price.toLocaleString()}
            </p>

            <p className="text-xs text-slate-500">
              per month
            </p>
          </div>

          <Link
            href={`/properties/${property.id}`}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function PropertySkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="h-56 animate-pulse bg-slate-200" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />

        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

        <div className="flex gap-3">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="h-10 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const [filters, setFilters] =
    useState<PropertyFilters>(initialFilters);

  const [appliedFilters, setAppliedFilters] =
    useState<PropertyFilters>(initialFilters);

  const { data, isLoading, isError, error, refetch } =
    useQuery({
      queryKey: ["properties", appliedFilters],
      queryFn: () => getProperties(appliedFilters),
    });

  const properties = data?.data ?? [];

  const handleFilterChange = (
    field: keyof PropertyFilters,
    value: string
  ) => {
    setFilters((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Explore RentNest
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Find your perfect rental property
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Browse available properties and find a home that
            matches your lifestyle, location, and budget.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Filters
              </h2>

              <button
                type="button"
                onClick={handleClearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            </div>

            {/* Search */}
            <div className="mt-6">
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search
              </label>

              <input
                id="search"
                type="text"
                value={filters.search}
                onChange={(event) =>
                  handleFilterChange(
                    "search",
                    event.target.value
                  )
                }
                placeholder="Search properties"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Location */}
            <div className="mt-5">
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                value={filters.location}
                onChange={(event) =>
                  handleFilterChange(
                    "location",
                    event.target.value
                  )
                }
                placeholder="e.g. Gulshan"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Property Type */}
            <div className="mt-5">
              <label
                htmlFor="propertyType"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Property Type
              </label>

              <select
                id="propertyType"
                value={filters.propertyType}
                onChange={(event) =>
                  handleFilterChange(
                    "propertyType",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Types</option>
                <option value="Apartment">
                  Apartment
                </option>
                <option value="House">House</option>
                <option value="Room">Room</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            {/* Minimum Price */}
            <div className="mt-5">
              <label
                htmlFor="minPrice"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Minimum Rent
              </label>

              <input
                id="minPrice"
                type="number"
                min="0"
                value={filters.minPrice}
                onChange={(event) =>
                  handleFilterChange(
                    "minPrice",
                    event.target.value
                  )
                }
                placeholder="৳ Minimum"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Maximum Price */}
            <div className="mt-5">
              <label
                htmlFor="maxPrice"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Maximum Rent
              </label>

              <input
                id="maxPrice"
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(event) =>
                  handleFilterChange(
                    "maxPrice",
                    event.target.value
                  )
                }
                placeholder="৳ Maximum"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Bedrooms */}
            <div className="mt-5">
              <label
                htmlFor="bedrooms"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Minimum Bedrooms
              </label>

              <select
                id="bedrooms"
                value={filters.bedrooms}
                onChange={(event) =>
                  handleFilterChange(
                    "bedrooms",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Any</option>
                <option value="1">1+ Bedroom</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>

            {/* Apply */}
            <button
              type="button"
              onClick={handleApplyFilters}
              className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </aside>

          {/* Property Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Available Properties
                </h2>

                {!isLoading && (
                  <p className="mt-1 text-sm text-slate-500">
                    Showing {properties.length}{" "}
                    {properties.length === 1
                      ? "property"
                      : "properties"}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <PropertySkeleton key={index} />
                  )
                )}
              </div>
            )}

            {/* Error */}
            {isError && !isLoading && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <h3 className="text-lg font-semibold text-red-700">
                  Failed to load properties
                </h3>

                <p className="mt-2 text-sm text-red-600">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong while loading properties."}
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty */}
            {!isLoading &&
              !isError &&
              properties.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <div className="text-4xl">🏠</div>

                  <h3 className="mt-4 text-xl font-semibold text-slate-900">
                    No properties found
                  </h3>

                  <p className="mt-2 text-slate-500">
                    Try changing your search or filter
                    options.
                  </p>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

            {/* Properties */}
            {!isLoading &&
              !isError &&
              properties.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                    />
                  ))}
                </div>
              )}
          </div>
        </div>
      </section>
    </main>
  );
}