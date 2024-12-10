import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    const apiUrl = process.env.HOOPS_API_URL;
    const apiKey = process.env.HOOPS_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API configuration is missing' },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}?period=${period}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching pool data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pool data' },
      { status: 500 }
    );
  }
} 