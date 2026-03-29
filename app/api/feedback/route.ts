import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/external/email';
import { getIP, isIpRateLimited } from '@/lib/ratelimit';

const SUPPORT_EMAIL = 'support.aethermoor@gmail.com';

export async function POST(req: NextRequest) {
  // 5 submissions per hour per IP
  const ip = getIP(req);
  if (await isIpRateLimited(ip + ':feedback', 5)) {
    return NextResponse.json({ error: 'rate_limited', message: 'Too many feedback submissions. Try again later.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { type, message, playerId, currentLocation, lastInput, screenshot } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'bad_request', message: 'Message is required.' }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'bad_request', message: 'Message too long.' }, { status: 400 });
    }

    const typeLabel = type === 'bug' ? 'Bug Report' : type === 'suggestion' ? 'Suggestion' : 'Feedback';

    const text = [
      `Type: ${typeLabel}`,
      `Player ID: ${playerId || 'unknown'}`,
      `Location: ${currentLocation || 'unknown'}`,
      `Last action: ${lastInput || 'none'}`,
      '',
      message.trim(),
    ].join('\n');

    const html = `
      <p><strong>Type:</strong> ${typeLabel}</p>
      <p><strong>Player ID:</strong> ${playerId || 'unknown'}</p>
      <p><strong>Location:</strong> ${currentLocation || 'unknown'}</p>
      <p><strong>Last action:</strong> ${lastInput || 'none'}</p>
      <hr/>
      <p style="white-space:pre-wrap">${message.trim().replace(/</g, '&lt;')}</p>
    `;

    const attachments: { filename: string; content: string }[] = [];
    if (screenshot?.base64 && screenshot?.filename && typeof screenshot.base64 === 'string' && screenshot.base64.length < 6_000_000) {
      attachments.push({ filename: screenshot.filename, content: screenshot.base64 });
    }

    await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `[Aethermoor ${typeLabel}] ${message.trim().slice(0, 60)}`,
      text,
      html,
      ...(attachments.length ? { attachments } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'internal', message: 'Could not send feedback.' }, { status: 500 });
  }
}
