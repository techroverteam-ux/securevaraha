import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital_management'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inputDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    // Convert YYYY-MM-DD to DD-MM-YYYY format for PHP compatibility
    const dateParts = inputDate.split('-');
    const phpDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Get patients with scan_status != 1 for today's date
    const query = `
      SELECT 
        p.*,
        d.dname,
        h.h_name
      FROM patient_new p
      LEFT JOIN doctor d ON d.d_id = p.doctor_name
      LEFT JOIN hospital h ON h.h_id = p.hospital_id
      WHERE p.scan_status != 1 AND p.date = ?
      ORDER BY p.patient_id DESC
    `;
    
    const [rows] = await connection.execute(query, [phpDate]);
    await connection.end();
    
    return NextResponse.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}