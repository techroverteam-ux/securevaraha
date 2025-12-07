import { NextRequest, NextResponse } from 'next/server';
import { csvService } from '@/lib/csvService';

export async function GET(request: NextRequest) {
  try {
    const queue = await csvService.getNursingQueue();
    return NextResponse.json(queue);
  } catch (error) {
    console.error('Error fetching nursing queue:', error);
    return NextResponse.json({ error: 'Failed to fetch nursing queue' }, { status: 500 });
  }
}