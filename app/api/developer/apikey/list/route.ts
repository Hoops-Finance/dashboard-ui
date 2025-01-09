import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  console.log(`[APIKEY-LIST] GET /api/developer/apikey/list`);
  const session = await auth();

  if (!session?.user?.accessToken) {
    console.log('attempt to access keys unauthenticated.')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const res = await fetch(`${process.env.AUTH_API_URL}/auth/apikey/list`, {
    headers: {
      'x-api-key': `${process.env.AUTH_API_KEY}`,
      'Authorization': `Bearer ${session.user.accessToken}`
    }
  });

  const data = await res.json();
  console.log('data from apikey list:', data);
  return new NextResponse(JSON.stringify(data), { status: res.status });
}
