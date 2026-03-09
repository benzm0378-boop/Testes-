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

    // Otherwise, it's a single new user
    const newUser = data;
    if (!newUser || !newUser.username) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }
    
    const users = await getUsers();
    
    if (users.find((u: any) => u.username.toLowerCase().trim() === newUser.username.toLowerCase().trim())) {
      return NextResponse.json({ error: 'Este usuário já existe' }, { status: 400 });
    }
    
    users.push(newUser);
    await saveUsers(users);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Users POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
