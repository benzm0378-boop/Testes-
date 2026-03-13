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

console.log('Storage: Initial DATA_DIR:', DATA_DIR);
console.log('Storage: process.cwd():', process.cwd());

// Ensure data directory exists and is writable
try {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('Storage: Creating DATA_DIR:', DATA_DIR);
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
      console.log('Storage: Creating fallback DATA_DIR:', DATA_DIR);
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
  password: 'admin123',
  isActive: true
};

export async function getUsers() {
  console.log('Storage: getUsers() called');
  let users: any[] = [];

  if (supabase) {
    try {
      console.log('Storage: Fetching users from Supabase...');
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Storage: Supabase getUsers error:', error);
      } else if (data && data.length > 0) {
        console.log('Storage: Users loaded from Supabase:', data.length);
        users = data;
      } else {
        console.log('Storage: Supabase returned no users');
      }
    } catch (err) {
      console.error('Storage: Supabase getUsers exception:', err);
    }
  }

  if (users.length === 0) {
    if (memoryUsers && memoryUsers.length > 0) {
      console.log('Storage: Returning users from memory:', memoryUsers.length);
      users = memoryUsers;
    } else {
      try {
        console.log('Storage: Checking USERS_FILE:', USERS_FILE);
        if (fs.existsSync(USERS_FILE)) {
          const data = fs.readFileSync(USERS_FILE, 'utf8');
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            memoryUsers = parsed;
            users = parsed;
            console.log('Storage: Users loaded from file:', users.length);
          }
        }
      } catch (error) {
        console.error('Storage: File read failed:', error);
      }
    }
  }

  // Ensure DEFAULT_ADMIN is always present
  if (users.length === 0) {
    console.log('Storage: No users found, using default admin');
    users = [DEFAULT_ADMIN];
  } else {
    const hasAdmin = users.some(u => u.username === DEFAULT_ADMIN.username || u.registration === DEFAULT_ADMIN.registration);
    if (!hasAdmin) {
      console.log('Storage: Admin not found in list, adding default admin');
      users.push(DEFAULT_ADMIN);
    }
  }

  memoryUsers = users;
  return users;
}

export async function saveUsers(users: any[]) {
  console.log('Storage: saveUsers() called with', users.length, 'users');
  // Ensure all users have an ID
  const usersWithIds = users.map(user => ({
    ...user,
    id: user.id || randomUUID()
  }));

  let supabaseSuccess = false;

  if (supabase) {
    try {
      console.log('Storage: Tentando salvar usuários no Supabase:', usersWithIds.length);
      const { error } = await supabase.from('users').upsert(usersWithIds, { onConflict: 'username' });
      if (error) {
        console.error('Storage: Erro no Supabase saveUsers:', error.message, error.details);
        // Se o erro for de coluna ausente, tentamos salvar sem a coluna lastPresenceUpdate
        if (error.message.includes('lastPresenceUpdate') || error.message.includes('column')) {
          console.log('Storage: Tentando salvar sem a coluna lastPresenceUpdate...');
          const usersWithoutPresence = usersWithIds.map(({ lastPresenceUpdate, presenceStatus, ...u }) => u);
          const { error: retryError } = await supabase.from('users').upsert(usersWithoutPresence, { onConflict: 'username' });
          if (!retryError) {
            supabaseSuccess = true;
            console.log('Storage: Usuários salvos com sucesso no Supabase (sem colunas de presença)');
          } else {
            console.error('Storage: Erro na segunda tentativa Supabase saveUsers:', retryError.message);
          }
        }
      } else {
        console.log('Storage: Usuários salvos com sucesso no Supabase');
        supabaseSuccess = true;
      }
    } catch (err: any) {
      console.error('Storage: Exceção no Supabase saveUsers:', err.message);
    }
  }

  memoryUsers = usersWithIds;
  try {
    console.log('Storage: Writing to USERS_FILE:', USERS_FILE);
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersWithIds, null, 2));
    console.log('Storage: Successfully wrote to USERS_FILE');
  } catch (error) {
    console.error('Storage: File write failed:', error);
    if (!supabaseSuccess) throw error;
  }
}

export async function getTests() {
  console.log('Storage: getTests() called');
  let tests: any[] = [];
  
  // Try Supabase first
  if (supabase) {
    try {
      console.log('Storage: Fetching tests from Supabase...');
      const { data, error } = await supabase.from('tests').select('*');
      if (error) {
        console.error('Storage: Supabase getTests error:', error);
      } else if (data) {
        console.log('Storage: Tests loaded from Supabase:', data.length);
        tests = data;
        memoryTests = data;
      }
    } catch (err) {
      console.error('Storage: Supabase getTests exception:', err);
    }
  }

  // Fallback to memory or file if Supabase failed or returned nothing
  if (tests.length === 0) {
    if (memoryTests) {
      console.log('Storage: Returning tests from memory:', memoryTests.length);
      tests = memoryTests;
    } else {
      try {
        console.log('Storage: Checking TESTS_FILE:', TESTS_FILE);
        if (fs.existsSync(TESTS_FILE)) {
          const data = fs.readFileSync(TESTS_FILE, 'utf8');
          memoryTests = JSON.parse(data);
          tests = memoryTests || [];
          console.log('Storage: Tests loaded from file:', tests.length);
        } else {
          console.log('Storage: Tests file not found');
        }
      } catch (error) {
        console.error('Storage: File read failed:', error);
      }
    }
  }

  // Rollover logic: move unfinished tests to today if they are from the past
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  let hasChanges = false;
  const updatedTests = tests.map(test => {
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
    console.log('Storage: Rollover detected, saving updated tests...');
    // Update memory immediately to avoid recursion if saveTests calls getTests
    memoryTests = updatedTests;
    
    // Save to backend (Supabase and/or File)
    // We call a internal version of save to avoid any potential loops
    await internalSaveTests(updatedTests);
    return updatedTests;
  }

  return tests;
}

async function internalSaveTests(testsWithIds: any[]) {
  let supabaseSuccess = false;

  if (supabase) {
    try {
      const { error } = await supabase.from('tests').upsert(testsWithIds, { onConflict: 'id' });
      if (!error) {
        supabaseSuccess = true;
      } else {
        console.error('Storage: internalSaveTests Supabase error:', error.message);
      }
    } catch (err) {
      console.error('Storage: internalSaveTests Supabase exception:', err);
    }
  }

  try {
    fs.writeFileSync(TESTS_FILE, JSON.stringify(testsWithIds, null, 2));
  } catch (error) {
    console.error('Storage: internalSaveTests File write failed:', error);
    if (!supabaseSuccess) throw error;
  }
}

export async function saveTests(data: any | any[]) {
  console.log('Storage: saveTests() called');
  const isArray = Array.isArray(data);
  const testsToSave = isArray ? data : [data];
  
  const testsWithIds = testsToSave.map(test => ({
    ...test,
    id: test.id || randomUUID()
  }));

  // Update memory state
  if (isArray) {
    memoryTests = testsWithIds;
  } else {
    const singleTest = testsWithIds[0];
    if (!memoryTests) {
      // If memory is empty, try to load it first (but avoid calling getTests which has rollover logic)
      try {
        if (fs.existsSync(TESTS_FILE)) {
          memoryTests = JSON.parse(fs.readFileSync(TESTS_FILE, 'utf8')) || [];
        } else {
          memoryTests = [];
        }
      } catch (e) {
        memoryTests = [];
      }
    }
    
    const index = memoryTests!.findIndex(t => t.id === singleTest.id);
    if (index !== -1) {
      memoryTests![index] = singleTest;
    } else {
      memoryTests!.push(singleTest);
    }
  }

  await internalSaveTests(memoryTests!);
  return isArray ? testsWithIds : testsWithIds[0];
}
