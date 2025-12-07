import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const from_date = searchParams.get('from_date') || '';
    const to_date = searchParams.get('to_date') || '';

    // Build query parameters
    const params = new URLSearchParams({
      page,
      limit,
      search,
      from_date,
      to_date
    });

    // Call the backend API
    const response = await fetch(`https://varahasdc.co.in/api/doctor/ct-scan-doctor-list?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch CT scan doctor list' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('CT scan doctor list API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}