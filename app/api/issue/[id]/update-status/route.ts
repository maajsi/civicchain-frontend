import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://152.42.157.189:3000";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: issueId } = await context.params;
    const token = request.headers.get("authorization");
    const userId = request.headers.get("x-user-id");
    
    // Check if this is a multipart form (with image) or JSON
    const contentType = request.headers.get("content-type");
    
    let body;
    const headers: Record<string, string> = {
      ...(token && { Authorization: token }),
    };

    if (contentType?.includes("multipart/form-data")) {
      // Forward multipart data as-is
      const formData = await request.formData();
      
      // Add user_id to form data if available
      if (userId) {
        formData.append("user_id", userId);
      }
      
      body = formData;
      // Don't set Content-Type, let fetch set it with boundary
    } else {
      // JSON request
      const jsonData = await request.json();
      
      // Add user_id to JSON body if available
      if (userId) {
        jsonData.user_id = userId;
      }
      
      body = JSON.stringify(jsonData);
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${BACKEND_URL}/issue/${issueId}/update-status`, {
      method: "POST",
      headers,
      body: body instanceof FormData ? body : body,
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    let message = "Failed to update issue status";
    if (typeof error === "object" && error !== null && "message" in error) {
      message = (error as { message?: string }).message || message;
    }
    console.error("Error updating issue status:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
