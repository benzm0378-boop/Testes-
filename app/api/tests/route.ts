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
    const data = await request.json();
    
    if (Array.isArray(data)) {
      // Full array update
      await saveTests(data);
      return NextResponse.json({ success: true });
    } else if (data && typeof data === 'object' && data.id) {
      // Single test update
      const tests = await getTests();
      const index = tests.findIndex((t: any) => t.id === data.id);
      
      if (index !== -1) {
        tests[index] = { ...tests[index], ...data };
      } else {
        tests.push(data);
      }
      
      await saveTests(tests);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid tests data. Expected an array or a single test object with an id.' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Tests POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
