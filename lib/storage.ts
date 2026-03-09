import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Local Persistence (Fallback)
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TESTS_FILE = path.join(DATA_DIR, 'tests.json');

let memoryUsers: any[] | null = null;
let memoryTests: any[] | null = null;

const DEFAULT_ADMIN = {
  firstName: 'Admin',
  lastName: 'Sistema',
  username: 'admin',
  role: 'administrador',
  registration: 'admin123',
  password: 'admin123'
};

// Ensure data directory exists
if (!supabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Data directory creation failed:', err);
  }
}

export async function getUsers() {
  if (supabase) {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Supabase getUsers error:', error);
      return memoryUsers || [DEFAULT_ADMIN];
    }
    if (!data || data.length === 0) {
      // If no users, return default admin but don't save yet
      return [DEFAULT_ADMIN];
    }
    return data;
  }

  if (memoryUsers) return memoryUsers;

  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      memoryUsers = JSON.parse(data);
      return memoryUsers || [DEFAULT_ADMIN];
    }
  } catch (error) {
    console.error('File read failed:', error);
  }

  memoryUsers = [DEFAULT_ADMIN];
  return memoryUsers;
}

export async function saveUsers(users: any[]) {
  if (supabase) {
    console.log('Tentando salvar usuários no Supabase:', users.length);
    const { error } = await supabase.from('users').upsert(users, { onConflict: 'username' });
    if (error) {
      console.error('Erro crítico no Supabase saveUsers:', error.message, error.details);
      throw new Error(`Erro ao salvar no Supabase: ${error.message}`);
    } else {
      console.log('Usuários salvos com sucesso no Supabase');
    }
    return;
  }

  memoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('File write failed:', error);
  }
}

export async function getTests() {
  if (supabase) {
    const { data, error } = await supabase.from('tests').select('*');
    if (error) {
      console.error('Supabase getTests error:', error);
      return memoryTests || [];
    }
    return data || [];
  }

  if (memoryTests) return memoryTests;

  try {
    if (fs.existsSync(TESTS_FILE)) {
      const data = fs.readFileSync(TESTS_FILE, 'utf8');
      memoryTests = JSON.parse(data);
      return memoryTests || [];
    }
  } catch (error) {
    console.error('File read failed:', error);
  }

  memoryTests = [];
  return memoryTests;
}

export async function saveTests(tests: any[]) {
  if (supabase) {
    console.log('Tentando salvar testes no Supabase:', tests.length);
    const { error } = await supabase.from('tests').upsert(tests, { onConflict: 'id' });
    if (error) {
      console.error('Erro crítico no Supabase saveTests:', error.message, error.details);
    } else {
      console.log('Testes salvos com sucesso no Supabase');
    }
    return;
  }

  memoryTests = tests;
  try {
    fs.writeFileSync(TESTS_FILE, JSON.stringify(tests, null, 2));
  } catch (error) {
    console.error('File write failed:', error);
  }
}
