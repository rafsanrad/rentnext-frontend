import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("rentnest_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    const backendResponse = await fetch(
      `${API_URL}/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message || "Unable to get user information.",
        },
        {
          status: backendResponse.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Auth me API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the authentication server.",
      },
      {
        status: 500,
      }
    );
  }
}