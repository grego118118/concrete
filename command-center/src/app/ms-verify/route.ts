import { NextResponse } from 'next/server';

export async function GET() {
  const content = `ms84659924`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
