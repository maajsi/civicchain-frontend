import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://152.42.157.189:3000";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    // Get the FormData from the request
    const formData = await request.formData();

    const response = await fetch(`${API_BASE_URL}/issue/classify`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        // Don't set Content-Type - let fetch set it with boundary for multipart
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error classifying image:", error);
    return NextResponse.json({ error: "Failed to classify image" }, { status: 500 });
  }
}
