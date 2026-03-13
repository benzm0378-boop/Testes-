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
  let supabaseUsers: any[] = [];
  let localUsers: any[] = [];

  // 1. Try to get from Supabase
  if (supabase) {
    try {
      console.log('Storage: Fetching users from Supabase...');
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Storage: Supabase getUsers error:', error);
      } else if (Array.isArray(data)) {
        console.log('Storage: Users loaded from Supabase:', data.length);
        supabaseUsers = data;
      }
    } catch (err) {
      console.error('Storage: Supabase getUsers exception:', err);
    }
  }

  // 2. Try to get from memory
  if (Array.isArray(memoryUsers) && memoryUsers.length > 0) {
    console.log('Storage: Found users in memory:', memoryUsers.length);
    localUsers = memoryUsers;
  } else {
    // 3. Try to get from file
    try {
      if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            localUsers = parsed;
            console.log('Storage: Users loaded from file:', localUsers.length);
          }
        } catch (parseError) {
          console.error('Storage: Failed to parse users.json:', parseError);
        }
      }
    } catch (error) {
      console.error('Storage: File read failed:', error);
    }
  }

  // 4. Merge users (prioritize Supabase but keep local-only users)
  // Use a Map to ensure unique usernames
  const userMap = new Map();

  // Add local users first
  localUsers.forEach(u => {
    if (u && u.username) {
      userMap.set(u.username.toLowerCase().trim(), u);
    }
  });

  // Overwrite/Add with Supabase users (they are the source of truth if available)
  supabaseUsers.forEach(u => {
    if (u && u.username) {
      userMap.set(u.username.toLowerCase().trim(), u);
    }
  });

  let mergedUsers = Array.from(userMap.values());

  // 5. Ensure DEFAULT_ADMIN is always present
  const hasAdmin = mergedUsers.some(u => 
    u.username?.toLowerCase().trim() === DEFAULT_ADMIN.username.toLowerCase().trim() || 
    u.registration === DEFAULT_ADMIN.registration
  );

  if (!hasAdmin) {
    console.log('Storage: Admin not found in merged list, adding default admin');
    mergedUsers.push(DEFAULT_ADMIN);
  }

  memoryUsers = mergedUsers;
  return mergedUsers;
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
  let supabaseTests: any[] = [];
  let localTests: any[] = [];
  
  // 1. Try Supabase
  if (supabase) {
    try {
      console.log('Storage: Fetching tests from Supabase...');
      const { data, error } = await supabase.from('tests').select('*');
      if (error) {
        console.error('Storage: Supabase getTests error:', error);
      } else if (Array.isArray(data)) {
        console.log('Storage: Tests loaded from Supabase:', data.length);
        supabaseTests = data;
      }
    } catch (err) {
      console.error('Storage: Supabase getTests exception:', err);
    }
  }

  // 2. Try Memory
  if (Array.isArray(memoryTests) && memoryTests.length > 0) {
    console.log('Storage: Found tests in memory:', memoryTests.length);
    localTests = memoryTests;
  } else {
    // 3. Try File
    try {
      if (fs.existsSync(TESTS_FILE)) {
        const data = fs.readFileSync(TESTS_FILE, 'utf8');
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            localTests = parsed;
            console.log('Storage: Tests loaded from file:', localTests.length);
          }
        } catch (parseError) {
          console.error('Storage: Failed to parse tests.json:', parseError);
        }
      }
    } catch (error) {
      console.error('Storage: File read failed:', error);
    }
  }

  // 4. Merge tests (prioritize most recently updated)
  const testMap = new Map();

  // Add local tests first
  localTests.forEach(t => {
    if (t && t.id) {
      testMap.set(t.id, t);
    }
  });

  // Merge with Supabase tests
  supabaseTests.forEach(s => {
    if (s && s.id) {
      const existing = testMap.get(s.id);
      if (!existing) {
        testMap.set(s.id, s);
      } else {
        // Compare updatedAt
        const sTime = s.updatedAt ? new Date(s.updatedAt).getTime() : 0;
        const eTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        if (sTime > eTime) {
          testMap.set(s.id, s);
        }
      }
    }
  });

  let tests = Array.from(testMap.values());
  memoryTests = tests;

  // 5. Rollover logic: move unfinished tests to today if they are from the past
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
