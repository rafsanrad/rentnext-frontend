import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("rentnest_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to request a property.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const backendResponse = await fetch(
      `${API_URL}/rental-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Rental request API error:", error);

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