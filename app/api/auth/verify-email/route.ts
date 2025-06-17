import { NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { getBackendApiUrl } from "@/utils/apiHelpers";

/**
 * API route to verify user email with verification code
 */
export async function POST(request: Request) {
  try {
    // Get session to ensure user is authenticated
    const session = await auth();
    if (!session?.user.accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Forward the verification request to the backend API
    const backendUrl = getBackendApiUrl("/auth/verify-email");
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.user.accessToken}`,
        "x-api-key": process.env.AUTH_API_KEY || "",
      },
      body: JSON.stringify({ email, code }),
    });

    // Get the response from the backend
    const data = await response.json();

    // If the backend response is not OK, return the error
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to verify email" },
        { status: response.status }
      );
    }

    // Return the successful response
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /auth/verify-email error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}
