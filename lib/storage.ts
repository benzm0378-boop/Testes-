import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TESTS_FILE = path.join(DATA_DIR, 'tests.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  // Default admin user: admin / admin123
  const defaultAdmin = {
    firstName: 'Admin',
    lastName: 'Sistema',
    username: 'admin',
    role: 'administrador',
    registration: 'admin123',
    password: 'admin123'
  };
  fs.writeFileSync(USERS_FILE, JSON.stringify([defaultAdmin]));
}
if (!fs.existsSync(TESTS_FILE)) {
  fs.writeFileSync(TESTS_FILE, JSON.stringify([]));
}

export function getUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

export function getTests() {
  try {
    const data = fs.readFileSync(TESTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function saveTests(tests: any[]) {
  fs.writeFileSync(TESTS_FILE, JSON.stringify(tests, null, 2));
}
