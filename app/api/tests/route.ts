import { NextResponse } from 'next/server';
import { getTests, saveTests } from '@/lib/storage';

export async function GET() {
  const tests = getTests();
  return NextResponse.json(tests);
}

export async function POST(request: Request) {
  const tests = await request.json();
  saveTests(tests);
  return NextResponse.json({ success: true });
}
