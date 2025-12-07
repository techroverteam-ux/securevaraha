import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    const query = `
      SELECT p.*, d.dname as doctor_name, h.hospital_name 
      FROM patient_new p 
      LEFT JOIN doctor d ON d.d_id = p.doctor_name 
      LEFT JOIN hospital h ON h.h_id = p.hospital_name 
      WHERE p.scan_status = 0 
      ORDER BY p.patient_id DESC
    `;

    const data = await dbQuery(query);

    if (format === 'excel') {
      const excelData = generatePendingExcelData(data);
      return new NextResponse(excelData, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="PENDING_REPORTS_${new Date().toISOString().split('T')[0]}.xls"`
        }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in pending reports:', error);
    return NextResponse.json({ error: 'Failed to fetch pending reports' }, { status: 500 });
  }
}

function generatePendingExcelData(data: any[]): string {
  let excel = `<html><body><table border="1">`;
  excel += `<tr><th colspan="8">VARAHA SDC</th></tr>`;
  excel += `<tr><th colspan="8">PENDING REPORTS - ${new Date().toLocaleDateString()}</th></tr>`;
  excel += `<tr><th>S.No</th><th>CRO</th><th>Patient Name</th><th>Doctor Name</th><th>Hospital Name</th><th>Date</th><th>Amount</th><th>Category</th></tr>`;

  let totalAmount = 0;
  data.forEach((row, index) => {
    totalAmount += parseFloat(row.amount || 0);
    excel += `<tr>`;
    excel += `<td>${index + 1}</td>`;
    excel += `<td>${row.cro || ''}</td>`;
    excel += `<td>${row.patient_name || ''}</td>`;
    excel += `<td>${row.doctor_name || ''}</td>`;
    excel += `<td>${row.hospital_name || ''}</td>`;
    excel += `<td>${row.date || ''}</td>`;
    excel += `<td>${row.amount || 0}</td>`;
    excel += `<td>${row.category || ''}</td>`;
    excel += `</tr>`;
  });

  excel += `<tr><th colspan="6">TOTAL</th><th>${totalAmount}</th><th></th></tr>`;
  excel += `</table></body></html>`;

  return excel;
}