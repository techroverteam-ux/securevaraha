import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const type = searchParams.get('type') || 'detail';
    
    // Convert date format from YYYY-MM-DD to DD-MM-YYYY for database
    const [year, month, day] = date.split('-');
    const dbDate = `${year}-${month}-${day}`;
    const displayDate = `${day}-${month}-${year}`;

    let excelData = '';
    
    if (type === 'detail') {
      excelData = await generateDetailReport(dbDate, displayDate);
    } else {
      excelData = await generateSummaryReport(dbDate, displayDate);
    }

    const filename = `DAILY_${type.toUpperCase()}_REPORT-${displayDate}.xls`;
    
    return new NextResponse(excelData, {
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

async function generateDetailReport(dbDate: string, displayDate: string): Promise<string> {
  const patients = await dbQuery(`
    SELECT 
      p.patient_id, p.patient_name, p.cro, p.age, p.gender, p.category,
      p.scan_type, p.total_scan, p.amount, p.examination_id,
      h.h_name as hospital_name, h.h_short,
      d.dname as doctor_name
    FROM patient_new p
    LEFT JOIN hospital h ON p.hospital_id = h.h_id
    LEFT JOIN doctor d ON p.doctor_name = d.d_id
    WHERE DATE(STR_TO_DATE(p.date, '%d-%m-%Y')) = ?
    AND p.scan_status = 1
    ORDER BY p.patient_id DESC
  `, [dbDate]);

  let html = `
    <html>
    <meta http-equiv="Content-Type" content="text/html; charset=Windows-1252">
    <body>
    <table border="1">
      <tr>
        <th colspan="11" style="background-color:#2F75B5; color:white">VARAHA SDC : IMAGING UNDER P.P.P. MODE</th>
      </tr>
      <tr>
        <th colspan="11" style="background-color:#2F75B5; color:white">RAJASTHAN MEDICARE RELIEF SOCIETY, MDM HOSPITAL</th>
      </tr>
      <tr>
        <th style="background-color:#FFEA00; color:black" colspan="11">DAILY DETAIL REPORT - ${displayDate}</th>
      </tr>
      <tr>
        <th style="background-color:#2F75B5; color:white">S.No</th>
        <th style="background-color:#2F75B5; color:white">DATE</th>
        <th style="background-color:#2F75B5; color:white">CRO NO.</th>
        <th style="background-color:#2F75B5; color:white">PATIENT ID</th>
        <th style="background-color:#2F75B5; color:white">NAME OF PATIENT</th>
        <th style="background-color:#2F75B5; color:white">AGE</th>
        <th style="background-color:#2F75B5; color:white">GENDER</th>
        <th style="background-color:#2F75B5; color:white">SCAN TYPE</th>
        <th style="background-color:#2F75B5; color:white">TOTAL SCAN</th>
        <th style="background-color:#2F75B5; color:white">AMOUNT</th>
        <th style="background-color:#2F75B5; color:white">CATEGORY</th>
      </tr>
  `;

  let totalAmount = 0;
  let totalScans = 0;

  patients.forEach((patient: any, index: number) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${displayDate}</td>
        <td>${patient.cro}</td>
        <td>${patient.examination_id || ''}</td>
        <td>${patient.patient_name}</td>
        <td>${patient.age?.replace('ear', '') || ''}</td>
        <td>${patient.gender?.charAt(0) || ''}</td>
        <td>${patient.scan_type}</td>
        <td style="text-align:right">${patient.total_scan}</td>
        <td style="text-align:right">${patient.amount}</td>
        <td>${patient.category}</td>
      </tr>
    `;
    totalAmount += parseFloat(patient.amount) || 0;
    totalScans += parseInt(patient.total_scan) || 0;
  });

  html += `
      <tr>
        <th style="background-color:#FFEA00; color:black" colspan="8">Total</th>
        <th style="background-color:#FFEA00; color:black; text-align:right">${totalScans}</th>
        <th style="background-color:#FFEA00; color:black; text-align:right">${totalAmount}</th>
        <th style="background-color:#FFEA00; color:black"></th>
      </tr>
    </table>
    </body>
    </html>
  `;

  return html;
}

async function generateSummaryReport(dbDate: string, displayDate: string): Promise<string> {
  const summary = await dbQuery(`
    SELECT 
      p.category,
      COUNT(*) as patient_count,
      SUM(p.total_scan) as total_scans,
      SUM(p.amount) as total_amount,
      h.h_short as hospital_short
    FROM patient_new p
    LEFT JOIN hospital h ON p.hospital_id = h.h_id
    WHERE DATE(STR_TO_DATE(p.date, '%d-%m-%Y')) = ?
    AND p.scan_status = 1
    GROUP BY p.category, h.h_short
    ORDER BY h.h_short, p.category
  `, [dbDate]);

  let html = `
    <html>
    <meta http-equiv="Content-Type" content="text/html; charset=Windows-1252">
    <body>
    <table border="1">
      <tr>
        <th colspan="13" style="background-color:#2F75B5; color:white">VARAHA SDC  </th>
      </tr>
      <tr>
        <th colspan="13" style="background-color:#2F75B5; color:white">(IMAGING UNDER P.P.P MODE)</th>
      </tr>
      <tr>
        <th colspan="13" style="background-color:#2F75B5; color:white">RAJASTHAN MEDICARE RELIEF SOCIETY, MDM HOSPITAL, Jodhpur</th>
      </tr>
      <tr>
        <th style="background-color:#FFEA00; color:black" colspan="13">SUMMARY FOR THE PERIOD OF ${displayDate}</th>
      </tr>
      <tr>
        <th style="background-color:#2F75B5; color:white">HOSPITAL</th>
        <th style="background-color:#2F75B5; color:white">CATEGORY</th>
        <th style="background-color:#2F75B5; color:white">NO. OF SCAN</th>
        <th style="background-color:#2F75B5; color:white">PATIENT/FORMS</th>
        <th style="background-color:#2F75B5; color:white">AMOUNT</th>
      </tr>
  `;

  let grandTotalScans = 0;
  let grandTotalPatients = 0;
  let grandTotalAmount = 0;

  summary.forEach((row: any) => {
    html += `
      <tr>
        <td>${row.hospital_short || 'N/A'}</td>
        <td>${row.category}</td>
        <td style="text-align:center">${row.total_scans}</td>
        <td style="text-align:center">${row.patient_count}</td>
        <td style="text-align:right">${parseFloat(row.total_amount).toFixed(2)}</td>
      </tr>
    `;
    grandTotalScans += parseInt(row.total_scans) || 0;
    grandTotalPatients += parseInt(row.patient_count) || 0;
    grandTotalAmount += parseFloat(row.total_amount) || 0;
  });

  const netReceivable = grandTotalAmount - (grandTotalAmount * 0.25);

  html += `
      <tr>
        <th style="background-color:#FFEA00; color:black" colspan="2">NET AMOUNT</th>
        <th style="background-color:#FFEA00; color:black; text-align:center">${grandTotalScans}</th>
        <th style="background-color:#FFEA00; color:black; text-align:center">${grandTotalPatients}</th>
        <th style="background-color:#FFEA00; color:black; text-align:right">${grandTotalAmount.toFixed(2)}</th>
      </tr>
      <tr>
        <td colspan="5">&nbsp;</td>
      </tr>
      <tr>
        <th style="background-color:#2F75B5; color:white" colspan="5">SUMMARY FOR THE PERIOD</th>
      </tr>
      <tr>
        <td><b>PARTICULAR</b></td>
        <td></td>
        <td style="text-align:center"><b>SCAN</b></td>
        <td></td>
        <td style="text-align:center"><b>AMOUNT</b></td>
      </tr>
      <tr>
        <td>GROSS TOTAL</td>
        <td></td>
        <td style="text-align:center">${grandTotalScans}</td>
        <td></td>
        <td style="text-align:right">${grandTotalAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td>(-) 25% FREE SHARE OF MDM</td>
        <td></td>
        <td style="text-align:center">${(grandTotalScans * 0.25).toFixed(0)}</td>
        <td></td>
        <td style="text-align:right">${(grandTotalAmount * 0.25).toFixed(2)}</td>
      </tr>
      <tr>
        <th style="background-color:#FFEA00; color:black">NET RECEIVABLE</th>
        <th style="background-color:#FFEA00; color:black"></th>
        <th style="background-color:#FFEA00; color:black; text-align:center">${(grandTotalScans - (grandTotalScans * 0.25)).toFixed(0)}</th>
        <th style="background-color:#FFEA00; color:black"></th>
        <th style="background-color:#FFEA00; color:black; text-align:right">${netReceivable.toFixed(2)}</th>
      </tr>
    </table>
    </body>
    </html>
  `;

  return html;
}