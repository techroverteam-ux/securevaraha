import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching reception stats from external API...');
    const response = await fetch('https://varahasdc.co.in/api/reception/stats');
    console.log('External API response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', response.status, errorText);
      throw new Error(`External API call failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('External API data received:', data);
    
    // Return the data directly from the external API
    const stats = data;

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Reception stats error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch reception statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: 'https://varahasdc.co.in/api/reception/stats',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}