import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiUrl = `https://varahasdc.co.in/api/superadmin/patient-report?${searchParams.toString()}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch patient report'
    }, { status: 500 });
  }
}