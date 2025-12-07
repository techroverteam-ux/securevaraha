import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        c.*,
        p.patient_name
      FROM console c
      LEFT JOIN patient_new p ON p.cro = c.c_p_cro
      ORDER BY c.id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch console entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const date = new Date().toISOString().split('T')[0];
    
    // Check if entry already exists
    const connection = await getConnection();
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM console WHERE c_p_cro = ?',
      [body.c_cro]
    );
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Console entry already exists for this CRO' }, { status: 400 });
    }

    // Calculate time gap
    let gap = '';
    if (body.start_time && body.stop_time) {
      const start = new Date(`2000-01-01 ${body.start_time}`);
      const stop = new Date(`2000-01-01 ${body.stop_time}`);
      const diffMs = stop.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      gap = diffMins >= 60 ? `${Math.floor(diffMins/60)}:${diffMins%60}` : `${diffSecs}sec`;
    }

    // Determine scan status
    let scanStatus = 0;
    if (body.status === 'Complete') scanStatus = 1;
    else if (body.status === 'Pending') scanStatus = 4;
    else if (body.status === 'Recall') scanStatus = 3;

    const [result] = await connection.execute(
      `INSERT INTO console (
        c_p_cro, examination_id, number_films, number_contrast, number_scan,
        issue_cd, start_time, stop_time, status, gap, technician_name,
        nursing_name, remark, added_on
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.c_cro, body.examination_id, body.number_film, body.number_contrast,
        body.number_scan, body.issue_cd, body.start_time, body.stop_time,
        body.status, gap, body.technician_name, body.nursing_name,
        body.remark, date
      ]
    );

    // Update patient scan status
    await connection.execute(
      'UPDATE patient_new SET scan_status = ?, examination_id = ?, scan_date = ? WHERE cro = ?',
      [scanStatus, body.examination_id, date, body.c_cro]
    );

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create console entry' }, { status: 500 });
  }
}