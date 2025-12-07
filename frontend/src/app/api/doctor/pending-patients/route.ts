import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const apiUrl = `https://varahasdc.co.in/api/doctor/pending-patients${queryString ? `?${queryString}` : ''}`;
    
    console.log('Fetching pending patients from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response error:', errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    return NextResponse.json({
      success: true,
      data: data.data || data || []
    });
    
  } catch (error) {
    console.error('Pending patients API error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: 'https://varahasdc.co.in/api/doctor/pending-patients'
    });
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pending patients',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}