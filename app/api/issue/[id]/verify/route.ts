import { NextResponse } from "next/server";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://152.42.157.189:3000";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: issueId } = await context.params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      `${API_BASE_URL}/issue/${issueId}/verify`,
      { user_id },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error verifying issue:", error);
    return NextResponse.json(
      {
        error: error.response?.data?.error || "Failed to verify issue",
      },
      { status: error.response?.status || 500 }
    );
  }
}
