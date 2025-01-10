import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/utils/auth";
import { AuthResult } from "@/utils/types";

interface LoginRequestBody {
  username?: string;
  password?: string;
  type?: "credentials" | "social";
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const data = (await req.json()) as LoginRequestBody;
  const { username, password, type } = data;

  if (type === "social") {
    return NextResponse.json({ error: "Social login not supported here" }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
  }

  try {
    const result = (await signIn("credentials", {
      redirect: false,
      username,
      password
    })) as AuthResult | null;

    if (!result?.success) {
      let errMessage = "Invalid credentials";
      if (result?.error) errMessage += `: ${result.error}`;
      return NextResponse.json({ error: errMessage }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during login", error.message);
    } else {
      console.error("Unknown error during login");
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
