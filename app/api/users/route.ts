import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/storage';

export async function GET() {
  try {
    console.log('API: GET /api/users called');
    const users = await getUsers();
    console.log(`API: Returning ${users.length} users`);
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
    console.log('API: Recebido userData para salvar:', userData.username);
    
    if (!userData || !userData.username) {
      console.error('API: Dados de usuário inválidos:', userData);
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }
    
    const users = await getUsers();
    console.log('API: Usuários existentes carregados:', users.length);
    
    const existingIndex = users.findIndex((u: any) => u.username.toLowerCase().trim() === userData.username.toLowerCase().trim());
    
    if (existingIndex !== -1) {
      console.log('API: Atualizando usuário existente:', userData.username);
      users[existingIndex] = { ...users[existingIndex], ...userData };
    } else {
      console.log('API: Criando novo usuário:', userData.username);
      users.push(userData);
    }
    
    await saveUsers(users);
    console.log('API: Usuários salvos com sucesso');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Users POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
