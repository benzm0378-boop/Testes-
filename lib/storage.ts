import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Local Persistence (Fallback)
let DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists and is writable
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // Test writability
  const testFile = path.join(DATA_DIR, '.write-test');
  fs.writeFileSync(testFile, '');
  fs.unlinkSync(testFile);
  console.log('Storage: Primary DATA_DIR is writable:', DATA_DIR);
} catch (err) {
  console.warn('Storage: Primary DATA_DIR not writable, falling back to /tmp/data:', err);
  DATA_DIR = path.join('/tmp', 'data');
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    console.log('Storage: Using fallback DATA_DIR:', DATA_DIR);
  } catch (fallbackErr) {
    console.error('Storage: Fallback DATA_DIR creation failed:', fallbackErr);
  }
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TESTS_FILE = path.join(DATA_DIR, 'tests.json');

let memoryUsers: any[] | null = null;
let memoryTests: any[] | null = null;

const DEFAULT_ADMIN = {
  id: '00000000-0000-0000-0000-000000000000',
  firstName: 'Admin',
  lastName: 'Sistema',
  username: 'admin',
  role: 'administrador',
  registration: 'admin123',
  password: 'admin123'
};

export async function getUsers() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Supabase getUsers error:', error);
      } else if (data && data.length > 0) {
        console.log('Users loaded from Supabase:', data.length);
        return data;
      } else {
        console.log('Supabase returned no users, falling back to local storage');
      }
    } catch (err) {
      console.error('Supabase getUsers exception:', err);
    }
  }

  if (memoryUsers) {
    console.log('Returning users from memory:', memoryUsers.length);
    return memoryUsers;
  }

  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      memoryUsers = JSON.parse(data);
      console.log('Users loaded from file:', USERS_FILE, memoryUsers?.length);
      return memoryUsers || [DEFAULT_ADMIN];
    } else {
      console.log('Users file not found:', USERS_FILE);
    }
  } catch (error) {
    console.error('File read failed:', error);
  }

  console.log('Returning default admin');
  memoryUsers = [DEFAULT_ADMIN];
  return memoryUsers;
}

export async function saveUsers(users: any[]) {
  // Ensure all users have an ID
  const usersWithIds = users.map(user => ({
    ...user,
    id: user.id || randomUUID()
  }));

  let supabaseSuccess = false;

  if (supabase) {
    try {
      console.log('Tentando salvar usuários no Supabase:', usersWithIds.length);
      const { error } = await supabase.from('users').upsert(usersWithIds, { onConflict: 'username' });
      if (error) {
        console.error('Erro no Supabase saveUsers:', error.message, error.details);
        // Se o erro for de coluna ausente, tentamos salvar sem a coluna lastPresenceUpdate
        if (error.message.includes('lastPresenceUpdate') || error.message.includes('column')) {
          console.log('Tentando salvar sem a coluna lastPresenceUpdate...');
          const usersWithoutPresence = usersWithIds.map(({ lastPresenceUpdate, presenceStatus, ...u }) => u);
          const { error: retryError } = await supabase.from('users').upsert(usersWithoutPresence, { onConflict: 'username' });
          if (!retryError) {
            supabaseSuccess = true;
            console.log('Usuários salvos com sucesso no Supabase (sem colunas de presença)');
          } else {
            console.error('Erro na segunda tentativa Supabase saveUsers:', retryError.message);
          }
        }
      } else {
        console.log('Usuários salvos com sucesso no Supabase');
        supabaseSuccess = true;
      }
    } catch (err: any) {
      console.error('Exceção no Supabase saveUsers:', err.message);
    }
  }

  memoryUsers = usersWithIds;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersWithIds, null, 2));
  } catch (error) {
    console.error('File write failed:', error);
    if (!supabaseSuccess) throw error;
  }
}

export async function getTests() {
  let tests: any[] = [];
  if (supabase) {
    const { data, error } = await supabase.from('tests').select('*');
    if (error) {
      console.error('Supabase getTests error:', error);
      tests = memoryTests || [];
    } else {
      tests = data || [];
    }
  } else {
    if (memoryTests) {
      tests = memoryTests;
    } else {
      try {
        if (fs.existsSync(TESTS_FILE)) {
          const data = fs.readFileSync(TESTS_FILE, 'utf8');
          memoryTests = JSON.parse(data);
          tests = memoryTests || [];
        }
      } catch (error) {
        console.error('File read failed:', error);
      }
    }
  }

  // Rollover logic: move unfinished tests to today if they are from the past
  const now = new Date();
  // Adjust to local time (assuming UTC-3 for Brazil, but let's use a simple YYYY-MM-DD comparison)
  // The user's local time is provided: 2026-03-10
  const todayStr = now.toISOString().split('T')[0];
  
  let hasChanges = false;
  const updatedTests = tests.map(test => {
    // If test is not started (dataInicio is '-') and it's from a previous day
    if (test.dataInicio === '-' && test.dataSolicitacao && test.dataSolicitacao < todayStr && !test.isDeleted) {
      hasChanges = true;
      return {
        ...test,
        dataSolicitacao: todayStr,
        updatedAt: now.toISOString()
      };
    }
    return test;
  });

  if (hasChanges) {
    // Sort by original order if needed, but here we just update and save
    // The user said "seguindo a ordem (dos mais antigos para os mais novos)"
    // If we update all of them to today, they keep their relative order in the array.
    await saveTests(updatedTests);
    return updatedTests;
  }

  return tests;
}

export async function saveTests(data: any | any[]) {
  const isArray = Array.isArray(data);
  const testsToSave = isArray ? data : [data];
  
  // Ensure all tests have an ID
  const testsWithIds = testsToSave.map(test => ({
    ...test,
    id: test.id || randomUUID()
  }));

  let supabaseSuccess = false;

  if (supabase) {
    try {
      console.log(`Tentando salvar ${testsWithIds.length} teste(s) no Supabase`);
      const { error } = await supabase.from('tests').upsert(testsWithIds, { onConflict: 'id' });
      if (error) {
        console.error('Erro no Supabase saveTests:', error.message, error.details);
        // Se o erro for de coluna ausente, tentamos salvar sem a coluna updatedAt
        if (error.message.includes('updatedAt') || error.message.includes('column')) {
          console.log('Tentando salvar sem a coluna updatedAt...');
          const testsWithoutUpdate = testsWithIds.map(({ updatedAt, ...t }) => t);
          const { error: retryError } = await supabase.from('tests').upsert(testsWithoutUpdate, { onConflict: 'id' });
          if (!retryError) {
            supabaseSuccess = true;
            console.log('Dados salvos com sucesso no Supabase (sem coluna updatedAt)');
          } else {
            console.error('Erro na segunda tentativa Supabase saveTests:', retryError.message);
          }
        }
      } else {
        console.log('Dados salvos com sucesso no Supabase');
        supabaseSuccess = true;
      }
    } catch (err: any) {
      console.error('Exceção no Supabase saveTests:', err.message);
    }
  }

  // Local fallback logic - Always update local memory/file as well
  if (!memoryTests) {
    await getTests(); // Load existing tests into memory if not already there
  }

  if (isArray) {
    memoryTests = testsWithIds;
  } else {
    const singleTest = testsWithIds[0];
    const index = (memoryTests || []).findIndex(t => t.id === singleTest.id);
    if (index !== -1) {
      memoryTests![index] = singleTest;
    } else {
      memoryTests = [...(memoryTests || []), singleTest];
    }
  }

  try {
    fs.writeFileSync(TESTS_FILE, JSON.stringify(memoryTests, null, 2));
  } catch (error) {
    console.error('File write failed:', error);
    // Only throw if both failed
    if (!supabaseSuccess) throw error;
  }

  return isArray ? testsWithIds : testsWithIds[0];
}
