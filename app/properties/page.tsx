import Link from "next/link";
import Image from "next/image";

const properties = [
  {
    id: 1,
    title: "Modern Family Apartment",
    location: "Gulshan, Dhaka",
    price: 35000,
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,500 sq ft",
    image: "/properties/property-1.jpg",
  },
  {
    id: 2,
    title: "Cozy Apartment in Banani",
    location: "Banani, Dhaka",
    price: 28000,
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sq ft",
    image: "/properties/property-2.jpg",
  },
  {
    id: 3,
    title: "Spacious Family House",
    location: "Uttara, Dhaka",
    price: 45000,
    type: "House",
    bedrooms: 4,
    bathrooms: 3,
    area: "2,200 sq ft",
    image: "/properties/property-3.jpg",
  },
  {
    id: 4,
    title: "Modern Studio Apartment",
    location: "Dhanmondi, Dhaka",
    price: 18000,
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    area: "750 sq ft",
    image: "/properties/property-4.jpg",
  },
  {
    id: 5,
    title: "Luxury Apartment",
    location: "Baridhara, Dhaka",
    price: 60000,
    type: "Apartment",
    bedrooms: 4,
    bathrooms: 4,
    area: "2,500 sq ft",
    image: "/properties/property-5.jpg",
  },
  {
    id: 6,
    title: "Comfortable Family Home",
    location: "Mirpur, Dhaka",
    price: 25000,
    type: "House",
    bedrooms: 3,
    bathrooms: 2,
    area: "1,600 sq ft",
    image: "/properties/property-6.jpg",
  },
];

export default function PropertiesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Explore RentNest
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Find your perfect rental property
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Browse available properties and find a home that matches your
            lifestyle, location, and budget.
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
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Clear
              </button>
            </div>

            {/* Location */}
            <div className="mt-6">
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Location
              </label>

              <input
                id="location"
                type="text"
                placeholder="Search location"
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
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="studio">Studio</option>
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
                placeholder="৳ Maximum"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Amenities */}
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Amenities
              </p>

              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Parking
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Wi-Fi
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Air Conditioning
                </label>

                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Security
                </label>
              </div>
            </div>

            <button
              type="button"
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

                <p className="mt-1 text-sm text-slate-500">
                  Showing {properties.length} properties
                </p>
              </div>

              <select
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                defaultValue="newest"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Property Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Property Image */}
                  <div className="relative h-56 bg-slate-200">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />

                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm">
                      {property.type}
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {property.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          📍 {property.location}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                      <span>{property.bedrooms} Beds</span>

                      <span>{property.bathrooms} Baths</span>

                      <span>{property.area}</span>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-xl font-bold text-blue-600">
                          ৳{property.price.toLocaleString()}
                        </p>

                        <p className="text-xs text-slate-500">per month</p>
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
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}