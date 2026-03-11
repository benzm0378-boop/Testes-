-- SQL para criar as tabelas necessárias no Supabase
-- Copie e cole este código no SQL Editor do seu projeto Supabase

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  registration TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "presenceStatus" TEXT DEFAULT 'offline',
  "lastPresenceUpdate" TIMESTAMPTZ DEFAULT now(),
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Testes
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante TEXT,
  percurso INTEGER,
  placa TEXT,
  modelo TEXT,
  cliente TEXT,
  falha TEXT,
  localizacao TEXT,
  "dataInicio" TEXT,
  "dataFim" TEXT,
  "horaInicio" TEXT,
  "horaFim" TEXT,
  "kmInicio" NUMERIC,
  "kmFim" NUMERIC,
  feedback TEXT,
  motorista TEXT,
  os TEXT,
  "dataSolicitacao" TEXT,
  "horaSolicitacao" TEXT,
  "tipoVeiculo" TEXT,
  "testeEngatado" TEXT,
  "isDeleted" BOOLEAN DEFAULT false,
  "updatedAt" TIMESTAMPTZ DEFAULT now(),
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- 3. Habilitar RLS (Opcional, mas recomendado)
-- Para simplificar o início, você pode desabilitar o RLS ou criar políticas de acesso total
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE tests DISABLE ROW LEVEL SECURITY;
