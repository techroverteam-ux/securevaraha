import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
    // Default to today if no dates provided
    const today = new Date().toISOString().split('T')[0];
    const from = fromDate || today;
    const to = toDate || today;

    const response = await fetch(`https://varahasdc.co.in/api/reception/patients/list?from=${from}&to=${to}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Today patients error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch patients', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}