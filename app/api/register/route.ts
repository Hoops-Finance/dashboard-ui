import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const response = await fetch(`${process.env.AUTH_API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${process.env.AUTH_API_KEY}`
      },
      body: JSON.stringify({ email: email, password: password })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    console.error('Error register account:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error register account' },
      { status: 500 }
    );
  }

  return NextResponse.json({ok: true, message: "success" });
}
