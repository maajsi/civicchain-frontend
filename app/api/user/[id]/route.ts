import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://152.42.157.189:3000";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
