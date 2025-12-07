import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://varahasdc.co.in/api/doctor/save-nursing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Save nursing API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to save nursing data',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}