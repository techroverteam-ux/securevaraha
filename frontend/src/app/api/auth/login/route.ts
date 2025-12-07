import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '198.54.121.225',
  user: process.env.DB_USER || 'varaosrc_prc',
  password: process.env.DB_PASSWORD || 'PRC!@#456&*(',
  database: process.env.DB_NAME || 'varaosrc_hospital_management',
  port: parseInt(process.env.DB_PORT || '3306'),
  connectTimeout: 60000
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Use dynamic API URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://varahasdc.co.in/api';
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json({
        error: data.error || 'Invalid credentials'
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      error: 'Login failed'
    }, { status: 500 });
  }
}