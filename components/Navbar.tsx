
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          RentNest
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Home
          </Link>

          <Link
            href="/properties"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Properties
          </Link>

          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Login
          </Link>

          <Link
            href="/auth/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Register
          </Link>
        </nav>

        {/* Mobile menu placeholder */}
        <button
          type="button"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 md:hidden"
          aria-label="Open menu"
        >
          Menu
        </button>
      </div>
    </header>
  );
}

