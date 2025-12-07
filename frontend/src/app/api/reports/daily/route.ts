import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Call external API with the date parameter
    const response = await fetch(`https://varahasdc.co.in/api/admin/daily-revenue-report?from_date=${date}&to_date=${date}`);
    
    if (!response.ok) {
      throw new Error('External API call failed');
    }
    
    const data = await response.json();
    
    // Calculate summary statistics
    const patients = data.data || [];
    const totalPatients = patients.length;
    const totalAmount = patients.reduce((sum: number, patient: any) => sum + (parseFloat(patient.amount) || 0), 0);
    
    // Group by hospital
    const hospitalStats = patients.reduce((acc: any, patient: any) => {
      const hospital = patient.hospital_name || 'Unknown';
      if (!acc[hospital]) {
        acc[hospital] = { count: 0, amount: 0 };
      }
      acc[hospital].count += 1;
      acc[hospital].amount += parseFloat(patient.amount) || 0;
      return acc;
    }, {});

    // Group by doctor
    const doctorStats = patients.reduce((acc: any, patient: any) => {
      const doctor = patient.doctor_name || 'Unknown';
      if (!acc[doctor]) {
        acc[doctor] = { count: 0, amount: 0 };
      }
      acc[doctor].count += 1;
      acc[doctor].amount += parseFloat(patient.amount) || 0;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      date,
      summary: {
        totalPatients,
        totalAmount,
        averageAmount: totalPatients > 0 ? totalAmount / totalPatients : 0
      },
      patients,
      hospitalStats,
      doctorStats
    });
    
  } catch (error) {
    console.error('Daily report error:', error);
    return NextResponse.json({ error: 'Failed to fetch daily report' }, { status: 500 });
  }
}