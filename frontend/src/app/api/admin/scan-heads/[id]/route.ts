import { NextRequest, NextResponse } from 'next/server';

// PUT - Update scan head
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { head_name, amount, per_scan } = await request.json();
    
    const response = await fetch(`https://varahasdc.co.in/api/admin/scan-heads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ head_name, amount, per_scan })
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update scan head' },
      { status: 500 }
    );
  }
}

// DELETE - Delete scan head
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const response = await fetch(`https://varahasdc.co.in/api/admin/scan-heads/${id}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete scan head' },
      { status: 500 }
    );
  }
}