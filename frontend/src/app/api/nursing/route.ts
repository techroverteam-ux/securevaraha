import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute<RowDataPacket[]>(`
      SELECT 
        p.*,
        t.time_slot as allot_time,
        CASE 
          WHEN p.scan_status = 0 THEN 'pending'
          WHEN p.scan_status = 1 THEN 'completed'
          WHEN p.scan_status = 2 THEN 'prepared'
          ELSE 'pending'
        END as status
      FROM patient_new p
      LEFT JOIN time_slot2 t ON t.time_id = p.allot_time
      WHERE p.scan_status IN (0, 2)
      ORDER BY p.patient_id DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch nursing patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cro, action } = body;
    
    let scanStatus = 0;
    if (action === 'prepare') scanStatus = 2;
    else if (action === 'complete') scanStatus = 1;

    const connection = await getConnection();
    await connection.execute(
      'UPDATE patient_new SET scan_status = ? WHERE cro = ?',
      [scanStatus, cro]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update patient status' }, { status: 500 });
  }
}