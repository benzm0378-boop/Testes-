import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/storage';

export async function GET() {
  const users = getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const newUser = await request.json();
  const users = getUsers();
  
  if (users.find((u: any) => u.username === newUser.username)) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
  
  users.push(newUser);
  saveUsers(users);
  return NextResponse.json({ success: true });
}
