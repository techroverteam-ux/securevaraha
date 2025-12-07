import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ cro: string }> }) {
  try {
    const { cro } = await params;
    const decodedCro = decodeURIComponent(cro);
    
    const response = await fetch(`https://varahasdc.co.in/api/doctor/nursing/${encodeURIComponent(decodedCro)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        return NextResponse.json({ 
          error: 'Patient not found',
          details: errorText,
          status: response.status,
          url: response.url
        }, { status: 404 });
      }
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data.data
    });
    
  } catch (error) {
    const { cro } = await params;
    const decodedCro = decodeURIComponent(cro);
    console.error('Nursing patient detail API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch nursing patient details',
      details: error instanceof Error ? error.message : String(error),
      requestUrl: request.url,
      backendUrl: `https://varahasdc.co.in/api/doctor/nursing/${encodeURIComponent(decodedCro)}`,
      cro: decodedCro
    }, { status: 500 });
  }
}