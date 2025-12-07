import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://varahasdc.co.in/api/doctor/add-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to add report');
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Report added successfully'
    });
    
  } catch (error) {
    console.error('Add report API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to add report' 
    }, { status: 500 });
  }
}