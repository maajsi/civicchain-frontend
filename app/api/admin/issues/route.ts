import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://152.42.157.189:3000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    const userId = request.headers.get("x-user-id");
    const { searchParams } = new URL(request.url);
    
    // Build query params
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    
    // Add user_id if available
    if (userId) {
      params.append("user_id", userId);
    }

    const queryString = params.toString();
    const url = `${BACKEND_URL}/admin/issues${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    let message = "Failed to fetch admin issues";
    if (typeof error === "object" && error !== null && "message" in error) {
      message = (error as { message?: string }).message || message;
    }
    console.error("Error fetching admin issues:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
