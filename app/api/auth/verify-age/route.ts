import { NextRequest, NextResponse } from 'next/server';
import * as auth from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authCtx = await auth.authenticateRequestAsync(request);
    if (!authCtx) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    await query(
      'UPDATE accounts SET verified_age = TRUE WHERE id = $1',
      [authCtx.accountId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[VERIFY AGE]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
