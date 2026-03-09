import { NextResponse } from 'next/server';
import { getTests, saveTests } from '@/lib/storage';

export async function GET() {
  const start = Date.now();
  try {
    console.log('API: Fetching tests...');
    const tests = await getTests();
    const duration = Date.now() - start;
    console.log(`API: Successfully fetched ${tests.length} tests in ${duration}ms`);
    return NextResponse.json(tests);
  } catch (error: any) {
    const duration = Date.now() - start;
    console.error(`API Tests GET Error after ${duration}ms:`, error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
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
