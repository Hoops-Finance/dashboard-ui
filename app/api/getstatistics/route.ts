import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  const apiUrl = `${process.env.API_URL}/getstatistics?period=${period}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: { 'Authorization': process.env.API_KEY || '' },
      cache: 'no-store'  // Ensure no caching
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return NextResponse.json({ error: 'Failed to fetch data from API' }, { status: 500 });
  }
}
