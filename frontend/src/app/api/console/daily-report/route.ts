import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || '';

    const apiUrl = new URL('https://varahasdc.co.in/api/console/daily-report');
    if (date) apiUrl.searchParams.set('date', date);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Console daily report API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily report data', details: error.message },
      { status: 500 }
    );
  }
}