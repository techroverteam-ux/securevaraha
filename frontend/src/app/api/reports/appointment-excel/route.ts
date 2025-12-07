import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from_date') || new Date().toISOString().split('T')[0];
    const toDate = searchParams.get('to_date') || new Date().toISOString().split('T')[0];

    const appointments = await dbQuery(`
      SELECT 
        p.patient_id,
        p.cro,
        p.patient_name,
        p.age,
        p.gender,
        p.contact_number,
        p.allot_date,
        p.allot_time,
        p.scan_type,
        p.amount,
        h.h_name as hospital_name,
        d.dname as doctor_name,
        t.time_slot
      FROM patient_new p
      LEFT JOIN hospital h ON p.hospital_id = h.h_id
      LEFT JOIN doctor d ON p.doctor_name = d.d_id
      LEFT JOIN time_slot2 t ON p.allot_time = t.time_id
      WHERE DATE(STR_TO_DATE(p.allot_date, '%d-%m-%Y')) BETWEEN ? AND ?
      ORDER BY p.allot_date DESC, t.time_slot ASC
    `, [fromDate, toDate]);

    const excelData = generateAppointmentExcel(appointments, fromDate, toDate);
    const filename = `APPOINTMENT_REPORT-${fromDate}_to_${toDate}.xls`;
    
    return new NextResponse(excelData, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating appointment report:', error);
    return NextResponse.json({ error: 'Failed to generate appointment report' }, { status: 500 });
  }
}

function generateAppointmentExcel(appointments: any[], fromDate: string, toDate: string): string {
  let html = `
    <html>
    <meta http-equiv="Content-Type" content="text/html; charset=Windows-1252">
    <body>
    <table border="1">
      <tr>
        <th colspan="10" style="background-color:#2F75B5; color:white">VARAHA SDC - APPOINTMENT REPORT</th>
      </tr>
      <tr>
        <th colspan="10" style="background-color:#2F75B5; color:white">RAJASTHAN MEDICARE RELIEF SOCIETY, MDM HOSPITAL</th>
      </tr>
      <tr>
        <th style="background-color:#FFEA00; color:black" colspan="10">APPOINTMENT REPORT FROM ${fromDate} TO ${toDate}</th>
      </tr>
      <tr>
        <th style="background-color:#2F75B5; color:white">S.No</th>
        <th style="background-color:#2F75B5; color:white">CRO</th>
        <th style="background-color:#2F75B5; color:white">Patient Name</th>
        <th style="background-color:#2F75B5; color:white">Contact</th>
        <th style="background-color:#2F75B5; color:white">Doctor</th>
        <th style="background-color:#2F75B5; color:white">Hospital</th>
        <th style="background-color:#2F75B5; color:white">Appointment Date</th>
        <th style="background-color:#2F75B5; color:white">Time Slot</th>
        <th style="background-color:#2F75B5; color:white">Scan Type</th>
        <th style="background-color:#2F75B5; color:white">Amount</th>
      </tr>
  `;

  let totalAmount = 0;

  appointments.forEach((appointment, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${appointment.cro}</td>
        <td>${appointment.patient_name}</td>
        <td>${appointment.contact_number || 'N/A'}</td>
        <td>${appointment.doctor_name || 'N/A'}</td>
        <td>${appointment.hospital_name || 'N/A'}</td>
        <td>${appointment.allot_date}</td>
        <td>${appointment.time_slot || 'N/A'}</td>
        <td>${appointment.scan_type}</td>
        <td style="text-align:right">₹${appointment.amount}</td>
      </tr>
    `;
    totalAmount += parseFloat(appointment.amount) || 0;
  });

  html += `
      <tr>
        <th style="background-color:#FFEA00; color:black" colspan="9">Total Appointments: ${appointments.length}</th>
        <th style="background-color:#FFEA00; color:black; text-align:right">₹${totalAmount.toFixed(2)}</th>
      </tr>
    </table>
    </body>
    </html>
  `;

  return html;
}