import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://varahasdc.co.in/api/dashboard/stats');
    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      throw new Error('API request failed');
    }
    
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({
      currentMonthTotal: 0,
      lastMonthTotal: 0,
      todayScans: 0,
      todayReceived: 0,
      todayDue: 0,
      todayWithdraw: 0,
      cashInHand: 0
    });
  }
}