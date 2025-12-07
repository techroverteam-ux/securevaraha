import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all scan heads
export async function GET() {
  try {
    const response = await fetch('https://varahasdc.co.in/api/admin/scan-heads');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scan heads' },
      { status: 500 }
    );
  }
}

// POST - Create new scan head
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://varahasdc.co.in/api/admin/scan-heads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create scan head' },
      { status: 500 }
    );
  }
}