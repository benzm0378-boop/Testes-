import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/storage';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('API Users GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // If it's an array, we're updating the whole list
    if (Array.isArray(data)) {
      await saveUsers(data);
      return NextResponse.json({ success: true });
    }

    // Otherwise, it's a single user update or creation
    const userData = data;
    if (!userData || !userData.username) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }
    
    const users = await getUsers();
    const existingIndex = users.findIndex((u: any) => u.username.toLowerCase().trim() === userData.username.toLowerCase().trim());
    
    if (existingIndex !== -1) {
      // Update existing user
      users[existingIndex] = { ...users[existingIndex], ...userData };
    } else {
      // Create new user
      users.push(userData);
    }
    
    await saveUsers(users);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Users POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
