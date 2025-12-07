import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital_management'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await params;
    const connection = await mysql.createConnection(dbConfig);
    
    // Get patient payment details with joins
    const query = `
      SELECT 
        p.*,
        d.dname as doctor_name,
        h.h_name as hospital_name,
        GROUP_CONCAT(s.s_name SEPARATOR ', ') as scan_types
      FROM patient_new p
      LEFT JOIN doctor d ON d.d_id = p.doctor_name
      LEFT JOIN hospital h ON h.h_id = p.hospital_id
      LEFT JOIN scan s ON FIND_IN_SET(s.s_id, p.scan_type)
      WHERE p.patient_id = ?
      GROUP BY p.patient_id
    `;
    
    const [rows] = await connection.execute(query, [pid]);
    await connection.end();
    
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json({
        success: true,
        data: rows[0]
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}