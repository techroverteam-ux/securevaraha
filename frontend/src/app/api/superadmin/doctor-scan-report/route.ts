import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    
    // Forward all query parameters
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    
    const response = await fetch(`https://varahasdc.co.in/api/admin/doctor-scan-report?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Doctor scan report API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch doctor scan report',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}