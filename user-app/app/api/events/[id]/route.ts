import { NextRequest, NextResponse } from 'next/server';
import { eventsApi } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await eventsApi.getEvent(params.id);
    
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found',
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch event',
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const event = await eventsApi.updateEvent(params.id, body);
    
    return NextResponse.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update event',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await eventsApi.deleteEvent(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete event',
    }, { status: 500 });
  }
}
