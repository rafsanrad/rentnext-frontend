import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Property ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const backendResponse = await fetch(
      `${API_URL}/properties/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
      "Property details API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the property server.",
      },
      {
        status: 500,
      }
    );
  }
}