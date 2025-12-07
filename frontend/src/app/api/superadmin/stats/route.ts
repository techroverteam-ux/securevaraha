// This route is deprecated - Frontend now calls external API directly
// Redirect to external API for backward compatibility

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'https://varahasdc.co.in/api';
  
  // Redirect to external API
  return NextResponse.redirect(`${API_BASE_URL}/superadmin/stats`);
}