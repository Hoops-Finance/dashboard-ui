import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/apikey/list`, {
    headers: {
      'x-api-key': `${process.env.AUTH_API_KEY}`,
      'Authorization': `Bearer ${session.user.accessToken}`
    }
  });

  const data = await res.json();
  return new NextResponse(JSON.stringify(data), { status: res.status });
}
