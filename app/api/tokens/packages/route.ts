import { NextResponse } from 'next/server';
import { getTokenPackages } from '@/lib/external/stripe';

export async function GET() {
  try {
    const packages = getTokenPackages();
    return NextResponse.json({ packages });
  } catch (error) {
    console.error('[TOKENS PACKAGES]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
