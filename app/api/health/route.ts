import { NextRequest, NextResponse } from 'next/server';

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'aethermoor-backend',
      version: '5.0',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
