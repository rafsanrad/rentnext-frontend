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
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.rentalRequestId) {
      return NextResponse.json(
        {
          success: false,
          message: "Rental request ID is required.",
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${API_URL}/payments/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rentalRequestId: body.rentalRequestId,
        }),
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the payment server.",
      },
      { status: 500 }
    );
  }
}