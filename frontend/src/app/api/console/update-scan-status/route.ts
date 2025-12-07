import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://varahasdc.co.in/api/console/update-scan-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Update scan status API error:', error);
    return NextResponse.json(
      { error: 'Failed to update scan status' },
      { status: 500 }
    );
  }
}