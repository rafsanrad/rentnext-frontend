import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Rental request ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const backendResponse = await fetch(
      `${API_URL}/rental-requests/${id}/cancel`,
      {
        method: "PATCH",
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
      "Cancel rental request API error:",
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