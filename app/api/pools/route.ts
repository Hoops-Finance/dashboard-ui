import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const response = await fetch(process.env.HOOPS_API_URL!, {
      headers: {
        'Authorization': `Bearer ${process.env.HOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 