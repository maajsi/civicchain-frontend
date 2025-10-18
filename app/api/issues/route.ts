import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://152.42.157.189:3000";

export async function GET(request: NextRequest) {
  try {
    // Get JWT token from Authorization header (sent by client-api interceptor)
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    
    // Build query params - don't send status filter if backend doesn't support it
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    if (radius) params.append('radius', radius);
    if (category) params.append('category', category);
    if (status) params.append('status', status);

    const response = await fetch(`${API_BASE_URL}/issues?${params.toString()}`, {
      headers: {
        "Authorization": authHeader, // Forward the JWT token
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}
