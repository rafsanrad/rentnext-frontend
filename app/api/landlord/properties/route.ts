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
      `${API_URL}/landlord/properties`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const contentType =
      backendResponse.headers.get("content-type") || "";

    const responseText = await backendResponse.text();

    console.log(
      "Landlord properties backend status:",
      backendResponse.status
    );

    console.log(
      "Landlord properties backend content-type:",
      contentType
    );

    console.log(
      "Landlord properties backend response:",
      responseText.slice(0, 1000)
    );

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The backend returned a non-JSON response.",
          backendStatus: backendResponse.status,
          backendContentType: contentType,
          backendResponse: responseText.slice(0, 1000),
        },
        {
          status: 502,
        }
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "Landlord properties JSON parse error:",
        parseError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "The backend returned invalid JSON.",
          backendStatus: backendResponse.status,
          backendResponse: responseText.slice(0, 1000),
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error(
      "Landlord properties GET API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the property server.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const backendResponse = await fetch(
      `${API_URL}/landlord/properties`,
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

    const contentType =
      backendResponse.headers.get("content-type") || "";

    const responseText = await backendResponse.text();

    console.log(
      "Landlord property POST backend status:",
      backendResponse.status
    );

    console.log(
      "Landlord property POST backend response:",
      responseText.slice(0, 1000)
    );

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The backend returned a non-JSON response.",
          backendStatus: backendResponse.status,
          backendContentType: contentType,
          backendResponse: responseText.slice(0, 1000),
        },
        {
          status: 502,
        }
      );
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "Landlord property POST JSON parse error:",
        parseError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "The backend returned invalid JSON.",
          backendStatus: backendResponse.status,
          backendResponse: responseText.slice(0, 1000),
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error(
      "Landlord property POST API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to the property server.",
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}