import { NextRequest, NextResponse } from 'next/server';
import { assessmentApi } from '@/lib/api';

export async function GET() {
  try {
    const questions = await assessmentApi.getQuestions();
    
    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error('Assessment questions error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch assessment questions',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, answers, result } = body;
    
    if (!userId || !answers || !result) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, answers, result',
      }, { status: 400 });
    }

    const assessment = await assessmentApi.saveAssessment(userId, answers, result);
    
    return NextResponse.json({
      success: true,
      data: assessment,
      message: 'Assessment saved successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Save assessment error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save assessment',
    }, { status: 500 });
  }
}
