import { NextRequest, NextResponse } from "next/server";

interface RegisterRequestBody {
  email: string;
  password: string;
  recaptchaToken?: string;
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET;
  if (!secret) return true;
  const res = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`, {
    method: "POST"
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { email, password, recaptchaToken } = (await request.json()) as RegisterRequestBody;

    if (recaptchaToken && !(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json({ ok: false, error: "Recaptcha failed" }, { status: 400 });
    }

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
      console.error("Error registering account:", error.message);
    } else {
      console.error("Unknown error registering account");
    }
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
