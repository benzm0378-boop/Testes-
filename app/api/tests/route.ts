import { NextResponse } from 'next/server';
import { getTests, saveTests } from '@/lib/storage';

export async function GET() {
  try {
    const tests = await getTests();
    return NextResponse.json(tests);
  } catch (error) {
    console.error('API Tests GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tests = await request.json();
    if (!Array.isArray(tests)) {
      return NextResponse.json({ error: 'Invalid tests data. Expected an array.' }, { status: 400 });
    }
    await saveTests(tests);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Tests POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
