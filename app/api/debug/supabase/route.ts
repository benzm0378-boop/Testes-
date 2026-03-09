import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  const config = {
    urlSet: !!supabaseUrl,
    keySet: !!supabaseKey,
    hasNextPublicPrefix: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    urlValue: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'não definido',
    keyValue: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'não definido',
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
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Erro ao conectar com o Supabase: ' + error.message,
        details: error,
        config
      });
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Conexão com Supabase estabelecida com sucesso!',
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
