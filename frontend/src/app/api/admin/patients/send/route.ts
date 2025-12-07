import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hospital_management'
};

export async function POST(request: NextRequest) {
  try {
    const { destination, cro } = await request.json();
    
    const connection = await mysql.createConnection(dbConfig);
    
    if (destination === 'Nursing') {
      // Insert into nursing_patient table
      const query = `
        INSERT INTO nursing_patient (n_patient_cro, n_patient_ct_report_date, n_patient_x_ray_report_date)
        SELECT cro, NOW(), NOW()
        FROM patient_new 
        WHERE cro = ?
      `;
      await connection.execute(query, [cro]);
      
      // Update patient scan_status
      await connection.execute(
        'UPDATE patient_new SET scan_status = 1 WHERE cro = ?',
        [cro]
      );
    } else if (destination === 'Console') {
      // Insert into console table
      const query = `
        INSERT INTO console (c_p_cro, status, date_time)
        VALUES (?, 'Pending', NOW())
      `;
      await connection.execute(query, [cro]);
      
      // Update patient scan_status
      await connection.execute(
        'UPDATE patient_new SET scan_status = 2 WHERE cro = ?',
        [cro]
      );
    }
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      message: `Patient sent to ${destination} successfully`
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send patient' },
      { status: 500 }
    );
  }
}