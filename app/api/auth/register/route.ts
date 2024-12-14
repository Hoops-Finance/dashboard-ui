import { NextRequest, NextResponse } from "next/server";

interface RegisterRequestBody {
  email: string;
  password: string;
}

interface RegisterResponse {
  ok: boolean;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    const { email, password } = await request.json() as RegisterRequestBody;

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
      return NextResponse.json({ ok: false, error: errorText }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "success" }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error registering account:', error.message);
    } else {
      console.error('Unknown error registering account');
    }
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
