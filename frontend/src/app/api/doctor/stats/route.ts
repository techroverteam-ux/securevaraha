import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://varahasdc.co.in/api/doctor/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctor stats');
    }

    const data = await response.json();
    
    return NextResponse.json({
      todayPatients: data.todayPatients || 0,
      pendingReports: data.pendingReports || 0,
      completedReports: data.completedReports || 0,
      totalReports: (data.pendingReports || 0) + (data.completedReports || 0)
    });
    
  } catch (error) {
    console.error('Doctor stats API error:', error);
    return NextResponse.json({ 
      todayPatients: 0,
      pendingReports: 0,
      completedReports: 0,
      totalReports: 0
    });
  }
}