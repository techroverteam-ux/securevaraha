import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://varahasdc.co.in/api/admin/hospitals');
    if (!response.ok) {
      throw new Error('External API call failed');
    }
    
    const data = await response.json();
    return NextResponse.json(data.data || data);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    return NextResponse.json({ error: 'Failed to fetch hospitals' }, { status: 500 });
  }
}