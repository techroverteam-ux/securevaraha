import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://varahasdc.co.in/api/doctor/ct-scan-doctors', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CT scan doctors');
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data || []
    });
    
  } catch (error) {
    console.error('CT scan doctors API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch CT scan doctors' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://varahasdc.co.in/api/doctor/ct-scan-doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to add CT scan doctor');
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Doctor added successfully',
      doctor_id: data.doctor_id
    }, { status: 201 });
    
  } catch (error) {
    console.error('Add CT scan doctor API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to add CT scan doctor' 
    }, { status: 500 });
  }
}