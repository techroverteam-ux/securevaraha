import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    
    let apiUrl = `https://varahasdc.co.in/api/doctor/completed-reports?page=${page}&limit=${limit}`;
    if (fromDate) apiUrl += `&from_date=${fromDate}`;
    if (toDate) apiUrl += `&to_date=${toDate}`;
    
    console.log('Fetching completed reports from:', apiUrl);
    
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
      data: data.data || data || [],
      total: data.total || 0,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
  } catch (error) {
    console.error('Completed reports API error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url
    });
    
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch completed reports',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}