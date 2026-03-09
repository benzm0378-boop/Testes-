import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  const config = {
    urlSet: !!supabaseUrl,
    keySet: !!supabaseKey,
    hasNextPublicPrefix: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    urlValue: supabaseUrl ? supabaseUrl.substring(0, 12) + '...' : 'não definido',
    keyValue: supabaseKey ? supabaseKey.substring(0, 12) + '...' : 'não definido',
    allEnvKeys: Object.keys(process.env),
  };

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Variáveis de ambiente do Supabase não encontradas. Verifique se você adicionou NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY nos Secrets do AI Studio.',
      config 
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check users table columns
    const { data: usersData, error: usersError } = await supabase.from('users').select('*').limit(1);
    
    // Check tests table columns
    const { data: testsData, error: testsError } = await supabase.from('tests').select('*').limit(1);
    
    const results = {
      usersTable: usersError ? `Erro: ${usersError.message}` : 'OK',
      testsTable: testsError ? `Erro: ${testsError.message}` : 'OK',
      usersColumns: usersData && usersData.length > 0 ? Object.keys(usersData[0]) : 'Nenhum dado para verificar colunas',
      testsColumns: testsData && testsData.length > 0 ? Object.keys(testsData[0]) : 'Nenhum dado para verificar colunas',
    };

    if (usersError || testsError) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Problemas detectados nas tabelas do Supabase.',
        results,
        config
      });
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Conexão com Supabase e tabelas verificada com sucesso!',
      results,
      config
    });
  } catch (err: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Erro inesperado: ' + err.message,
      config
    });
  }
}
