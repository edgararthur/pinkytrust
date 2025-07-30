import { NextRequest, NextResponse } from 'next/server';
import { assessmentApi } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const latest = searchParams.get('latest') === 'true';
    
    let assessments;
    if (latest) {
      assessments = await assessmentApi.getLatestAssessment(params.userId);
    } else {
      assessments = await assessmentApi.getUserAssessments(params.userId);
    }
    
    return NextResponse.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error('User assessments error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user assessments',
    }, { status: 500 });
  }
}
