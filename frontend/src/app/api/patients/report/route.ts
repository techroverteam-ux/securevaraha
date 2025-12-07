import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from_date') || new Date().toISOString().split('T')[0];
    const toDate = searchParams.get('to_date') || new Date().toISOString().split('T')[0];
    const format = searchParams.get('format');

    const patients = await dbQuery(`
      SELECT 
        p.patient_id,
        p.cro,
        p.patient_name,
        p.amount,
        p.date,
        h.hospital_name,
        d.dname as doctor_name,
        p.category,
        p.remark
      FROM patient_new p
      LEFT JOIN hospital h ON p.hospital_name = h.h_id
      LEFT JOIN doctor d ON p.doctor_name = d.d_id
      WHERE DATE(STR_TO_DATE(p.date, '%d-%m-%Y')) BETWEEN ? AND ?
      ORDER BY p.patient_id DESC
    `, [fromDate, toDate]);

    if (format === 'excel') {
      const excelData = generatePatientExcel(patients, fromDate, toDate);
      const filename = `PATIENT_REPORT-${fromDate}_to_${toDate}.xls`;
      
      return new NextResponse(excelData, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patient report:', error);
    return NextResponse.json({ error: 'Failed to fetch patient report' }, { status: 500 });
  }
}

function generatePatientExcel(patients: any[], fromDate: string, toDate: string): string {
  let html = `
    <html>
    <meta http-equiv="Content-Type" content="text/html; charset=Windows-1252">
    <body>
    <table border="1">
      <tr>
        <th colspan="7" style="background-color:#2F75B5; color:white">VARAHA SDC - PATIENT REPORT</th>
      </tr>
      <tr>
        <th style="background-color:#FFEA00; color:black" colspan="7">PATIENT REPORT FROM ${fromDate} TO ${toDate}</th>
      </tr>
      <tr>
        <th style="background-color:#2F75B5; color:white">S.No</th>
        <th style="background-color:#2F75B5; color:white">CRO</th>
        <th style="background-color:#2F75B5; color:white">Patient Name</th>
        <th style="background-color:#2F75B5; color:white">Doctor Name</th>
        <th style="background-color:#2F75B5; color:white">Hospital Name</th>
        <th style="background-color:#2F75B5; color:white">Amount</th>
        <th style="background-color:#2F75B5; color:white">Remark</th>
      </tr>
  `;

  patients.forEach((patient, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${patient.cro}</td>
        <td>${patient.patient_name}</td>
        <td>${patient.doctor_name || 'N/A'}</td>
        <td>${patient.hospital_name || 'N/A'}</td>
        <td style="text-align:right">₹${patient.amount}</td>
        <td>${patient.remark}</td>
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