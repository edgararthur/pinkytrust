import { NextRequest, NextResponse } from 'next/server';
import { eventsApi } from '@/lib/api';
import type { EventFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: EventFilters = {
      category: searchParams.get('category') || undefined,
      location: searchParams.get('location') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      search_query: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const events = await eventsApi.getEvents(filters);
    
    return NextResponse.json({
      success: true,
      data: events,
      meta: {
        total: events.length,
        limit: filters.limit,
        offset: filters.offset,
      }
    });
  } catch (error) {
    console.error('Events API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'location'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`,
        }, { status: 400 });
      }
    }

    const event = await eventsApi.createEvent(body);
    
    return NextResponse.json({
      success: true,
      data: event,
    }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event',
    }, { status: 500 });
  }
}
