import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message || "Login failed.",
        },
        {
          status: backendResponse.status,
        }
      );
    }

    const response = NextResponse.json(data);

    response.cookies.set({
      name: "rentnest_token",
      value: data.data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to the authentication server.",
      },
      {
        status: 500,
      }
    );
  }
}