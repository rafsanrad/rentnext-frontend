import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export async function GET(request: NextRequest) {
  try {
    const token =
      request.cookies.get("rentnest_token")?.value;

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
      `${API_URL}/landlord/rental-requests`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error(
      "Landlord rental requests API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the rental request server.",
      },
      {
        status: 500,
      }
    );
  }
}