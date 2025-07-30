import { NextRequest, NextResponse } from 'next/server';
import { eventsApi } from '@/lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
    }

    const registration = await eventsApi.registerForEvent(params.id, userId);
    
    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Successfully registered for event',
    });
  } catch (error) {
    console.error('Event registration error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register for event',
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
    }

    await eventsApi.unregisterFromEvent(params.id, userId);
    
    return NextResponse.json({
      success: true,
      message: 'Successfully unregistered from event',
    });
  } catch (error) {
    console.error('Event unregistration error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to unregister from event',
    }, { status: 500 });
  }
}
