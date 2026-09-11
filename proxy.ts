import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

const PUBLIC_ROUTES = [
  "/",
  "/properties",
  "/auth/login",
  "/auth/register",
];

const PROTECTED_ROUTES = [
  "/tenant",
  "/landlord",
  "/admin",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return (
      pathname === route ||
      pathname.startsWith(`${route}/`)
    );
  });
}

function getProtectedRole(pathname: string) {
  if (pathname.startsWith("/tenant")) {
    return "TENANT";
  }

  if (pathname.startsWith("/landlord")) {
    return "LANDLORD";
  }

  if (pathname.startsWith("/admin")) {
    return "ADMIN";
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Ignore Next.js internal files and API routes.
   */
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(
    "rentnest_token"
  )?.value;

  /*
   * If there is no token and the route is protected,
   * redirect the user to login.
   */
  if (!token) {
    const protectedRole =
      getProtectedRole(pathname);

    if (protectedRole) {
      const loginUrl = new URL(
        "/auth/login",
        request.url
      );

      loginUrl.searchParams.set(
        "callbackUrl",
        pathname
      );

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  /*
   * Validate the JWT through the backend.
   *
   * The backend is responsible for verifying
   * the JWT signature.
   */
  try {
    const response = await fetch(
      `${API_URL}/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    /*
     * Token is invalid or expired.
     */
    if (!response.ok) {
      const loginUrl = new URL(
        "/auth/login",
        request.url
      );

      const redirectResponse =
        NextResponse.redirect(loginUrl);

      redirectResponse.cookies.delete(
        "rentnest_token"
      );

      return redirectResponse;
    }

    const data = await response.json();

    const user = data.data;

    /*
     * If a logged-in user tries to visit
     * login/register, send them to their dashboard.
     */
    if (
      pathname === "/auth/login" ||
      pathname === "/auth/register"
    ) {
      if (user.role === "ADMIN") {
        return NextResponse.redirect(
          new URL(
            "/admin/dashboard",
            request.url
          )
        );
      }

      if (user.role === "LANDLORD") {
        return NextResponse.redirect(
          new URL(
            "/landlord/dashboard",
            request.url
          )
        );
      }

      return NextResponse.redirect(
        new URL(
          "/tenant/dashboard",
          request.url
        )
      );
    }

    /*
     * Check role-based access.
     */
    const requiredRole =
      getProtectedRole(pathname);

    if (
      requiredRole &&
      user.role !== requiredRole
    ) {
      let redirectPath = "/";

      if (user.role === "ADMIN") {
        redirectPath = "/admin/dashboard";
      } else if (
        user.role === "LANDLORD"
      ) {
        redirectPath = "/landlord/dashboard";
      } else {
        redirectPath = "/tenant/dashboard";
      }

      return NextResponse.redirect(
        new URL(
          redirectPath,
          request.url
        )
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error(
      "Authentication proxy error:",
      error
    );

    return NextResponse.redirect(
      new URL("/auth/login", request.url)
    );
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};