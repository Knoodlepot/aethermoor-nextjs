import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function checkAdminAuth(request: NextRequest): boolean {
  const headerSecret = request.headers.get('x-admin-secret');
  const bearer = request.headers.get('authorization');
  const bearerSecret = bearer?.startsWith('Bearer ') ? bearer.substring(7) : null;
  const secret = headerSecret || bearerSecret;
  return !!(secret && secret === process.env.SESSION_SECRET);
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = await fs.readFile(changelogPath, 'utf-8');
    return NextResponse.json({ content });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ content: '# Changelog\n\nNo changelog found.' });
    }
    console.error('[ADMIN CHANGELOG]', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
