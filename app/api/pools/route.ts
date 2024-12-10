import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const market = searchParams.get('market');
    const protocol = searchParams.get('protocol');

    const apiUrl = process.env.HOOPS_API_URL;
    const apiKey = process.env.HOOPS_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API configuration is missing' },
        { status: 500 }
      );
    }

    // Construct the API URL with filters
    const url = new URL(apiUrl);
    url.searchParams.append('period', period);
    
    if (market) {
      url.searchParams.append('market', market);
    }
    if (protocol) {
      url.searchParams.append('protocol', protocol.toLowerCase());
    }

    const response = await fetch(url.toString(), {
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
    
    // If protocol and market are specified, filter for exact match
    if (protocol && market) {
      const filteredData = Array.isArray(data) ? data.filter(pool => 
        pool.market.toLowerCase() === market.toLowerCase() &&
        pool.protocol.toLowerCase() === protocol.toLowerCase()
      ) : [];
      
      if (filteredData.length === 0) {
        return NextResponse.json(
          { error: 'Pool not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(filteredData);
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching pool data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch pool data' },
      { status: 500 }
    );
  }
} 