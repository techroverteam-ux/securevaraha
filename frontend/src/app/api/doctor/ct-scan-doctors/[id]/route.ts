import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const response = await fetch(`https://varahasdc.co.in/api/doctor/ct-scan-doctors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }
      throw new Error('Failed to update CT scan doctor');
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Doctor updated successfully'
    });
    
  } catch (error) {
    console.error('Update CT scan doctor API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update CT scan doctor' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const response = await fetch(`https://varahasdc.co.in/api/doctor/ct-scan-doctors/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
      }
      throw new Error('Failed to delete CT scan doctor');
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Doctor deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete CT scan doctor API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete CT scan doctor' 
    }, { status: 500 });
  }
}