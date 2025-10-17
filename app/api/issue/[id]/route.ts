import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://152.42.157.189:3000";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const token = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/issue/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    let message = "Failed to fetch issue";
    if (typeof error === "object" && error !== null && "message" in error) {
      message = (error as { message?: string }).message || message;
    }
    console.error("Error fetching issue:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
