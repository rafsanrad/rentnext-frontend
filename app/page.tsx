
import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
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

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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

          {/* Hero Visual */}
          <div className="relative">
            <div className="flex min-h-[380px] items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-8 shadow-xl">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="h-48 rounded-xl bg-slate-200" />

                <div className="mt-5">
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <div className="h-5 w-24 rounded bg-blue-100" />
                    </div>

                    <div className="h-9 w-24 rounded-lg bg-blue-600" />
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
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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
    </div>
  );
}

