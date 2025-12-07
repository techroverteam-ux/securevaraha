import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';

    const apiUrl = new URL('https://varahasdc.co.in/api/console/queue');
    apiUrl.searchParams.set('page', page);
    apiUrl.searchParams.set('limit', limit);
    if (search) apiUrl.searchParams.set('search', search);

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error('Console queue API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch console queue data', details: error.message },
      { status: 500 }
    );
  }
}