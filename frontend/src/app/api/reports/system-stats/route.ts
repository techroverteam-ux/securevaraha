import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    const totalStats = await dbQuery(`
      SELECT 
        COUNT(*) as total_patients,
        SUM(amount) as total_revenue
      FROM patient_new
    `);

    const hospitalStats = await dbQuery(`
      SELECT 
        h.h_name as hospital_name,
        COUNT(p.patient_id) as patient_count,
        SUM(p.amount) as revenue
      FROM hospital h
      LEFT JOIN patient_new p ON h.h_id = p.hospital_id
      GROUP BY h.h_id, h.h_name
      ORDER BY revenue DESC
    `);

    const categoryStats = await dbQuery(`
      SELECT 
        category,
        COUNT(*) as patient_count,
        SUM(amount) as revenue
      FROM patient_new
      GROUP BY category
      ORDER BY revenue DESC
    `);

    const stats = {
      totalPatients: totalStats[0]?.total_patients || 0,
      totalRevenue: parseFloat(totalStats[0]?.total_revenue) || 0,
      hospitalStats: hospitalStats.map((h: any) => ({
        hospital_name: h.hospital_name,
        patient_count: parseInt(h.patient_count) || 0,
        revenue: parseFloat(h.revenue) || 0
      })),
      categoryStats: categoryStats.map((c: any) => ({
        category: c.category,
        patient_count: parseInt(c.patient_count) || 0,
        revenue: parseFloat(c.revenue) || 0
      }))
    };

    if (format === 'excel') {
      const excelData = generateStatsExcel(stats);
      const filename = `SYSTEM_STATISTICS-${new Date().toISOString().split('T')[0]}.xls`;
      
      return new NextResponse(excelData, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json({ error: 'Failed to fetch system stats' }, { status: 500 });
  }
}

function generateStatsExcel(stats: any): string {
  let html = `
    <html>
    <meta http-equiv="Content-Type" content="text/html; charset=Windows-1252">
    <body>
    <table border="1">
      <tr>
        <th colspan="4" style="background-color:#2F75B5; color:white">VARAHA SDC - SYSTEM STATISTICS</th>
      </tr>
      <tr>
        <th style="background-color:#FFEA00; color:black" colspan="4">SYSTEM OVERVIEW</th>
      </tr>
      <tr>
        <td><b>Total Patients</b></td>
        <td>${stats.totalPatients}</td>
        <td><b>Total Revenue</b></td>
        <td>₹${stats.totalRevenue.toFixed(2)}</td>
      </tr>
      <tr><td colspan="4">&nbsp;</td></tr>
      <tr>
        <th style="background-color:#2F75B5; color:white" colspan="4">HOSPITAL-WISE STATISTICS</th>
      </tr>
      <tr>
        <th style="background-color:#2F75B5; color:white">Hospital Name</th>
        <th style="background-color:#2F75B5; color:white">Patients</th>
        <th style="background-color:#2F75B5; color:white">Revenue</th>
        <th style="background-color:#2F75B5; color:white">Avg per Patient</th>
      </tr>
  `;

  stats.hospitalStats.forEach((hospital: any) => {
    const avgPerPatient = hospital.patient_count > 0 ? (hospital.revenue / hospital.patient_count).toFixed(2) : '0';
    html += `
      <tr>
        <td>${hospital.hospital_name}</td>
        <td style="text-align:center">${hospital.patient_count}</td>
        <td style="text-align:right">₹${hospital.revenue.toFixed(2)}</td>
        <td style="text-align:right">₹${avgPerPatient}</td>
      </tr>
    `;
  });

  html += `
    </table>
    </body>
    </html>
  `;

  return html;
}