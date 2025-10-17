import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://152.42.157.189:3000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const userId = request.headers.get("x-user-id");

    // Build URL with user_id query param if available
    const url = new URL(`${BACKEND_URL}/admin/dashboard`);
    if (userId) {
      url.searchParams.append("user_id", userId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    let message = "Failed to fetch admin dashboard";
    if (typeof error === "object" && error !== null && "message" in error) {
      message = (error as { message?: string }).message || message;
    }
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
