import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://varahasdc.co.in/api/admin/patients/last-enrolled');
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch last enrolled patient', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}