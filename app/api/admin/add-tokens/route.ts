import { NextRequest, NextResponse } from 'next/server';
import { addTokens } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, playerId, amount, reason } = body;

    if (!secret || secret !== process.env.SESSION_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!playerId || !amount) {
      return NextResponse.json({ error: 'playerId and amount required' }, { status: 400 });
    }

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive integer' }, { status: 400 });
    }

    await addTokens(playerId, parsedAmount, reason || 'Admin grant');

    return NextResponse.json({ success: true, playerId, added: parsedAmount });
  } catch (error) {
    console.error('[ADMIN ADD TOKENS]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
