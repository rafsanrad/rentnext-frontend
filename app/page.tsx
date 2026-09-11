import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Hero Content */}
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Find your next home
              </p>

              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Find a place you&apos;ll love to call home.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Discover rental properties that match your lifestyle, budget,
                and location. RentNest makes finding your next home simple.
              </p>

              {/* Search Box */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Location
                    </label>

                    <input
                      id="location"
                      type="text"
                      placeholder="Dhaka, Bangladesh"
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Property Type */}
                  <div>
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
                      <option value="">Any type</option>
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="room">Room</option>
                      <option value="studio">Studio</option>
                      <option value="office">Office</option>
                    </select>
                  </div>

                  {/* Maximum Rent */}
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Maximum Rent
                    </label>

                    <select
                      id="price"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Any price</option>
                      <option value="10000">৳10,000</option>
                      <option value="20000">৳20,000</option>
                      <option value="30000">৳30,000</option>
                      <option value="50000">৳50,000</option>
                      <option value="100000">৳100,000+</option>
                    </select>
                  </div>

                  {/* Search Button */}
                  <div className="flex items-end">
                    <Link
                      href="/properties"
                      className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Search
                    </Link>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/properties"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                >
                  Browse Properties
                </Link>

                <Link
                  href="/auth/register"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  List Your Property
                </Link>
              </div>
            </div>

            {/* Hero Property Preview */}
            <div className="relative">
              <div className="rounded-3xl bg-linear-to-br from-blue-600 to-cyan-500 p-6 shadow-xl sm:p-8">
                <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
                  {/* Property Image Placeholder */}
                  <div className="flex h-52 items-center justify-center rounded-xl bg-slate-200">
                    <span className="text-sm font-medium text-slate-500">
                      Property Image
                    </span>
                  </div>

                  {/* Property Information */}
                  <div className="mt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Modern Family Apartment
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Gulshan, Dhaka
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">
                        Featured
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-blue-600">
                          ৳35,000
                          <span className="text-sm font-normal text-slate-500">
                            {" "}
                            / month
                          </span>
                        </p>
                      </div>

                      <Link
                        href="/properties"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Why RentNest?
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to find your next rental
            </h2>

            <p className="mt-4 text-slate-600">
              Whether you are looking for a home or listing your property,
              RentNest keeps the entire rental process simple.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Easy Search */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🔍
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                Easy Search
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Search and filter properties by location, price, property
                type, and amenities.
              </p>
            </div>

            {/* Quality Listings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🏠
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                Quality Listings
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Explore detailed rental listings and find a property that
                fits your needs.
              </p>
            </div>

            {/* Secure Process */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                🔐
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                Secure Process
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Submit rental requests and complete secure payments after
                landlord approval.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}