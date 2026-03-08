import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Persistence: Data is stored in the 'data' directory which is preserved across app updates.
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TESTS_FILE = path.join(DATA_DIR, 'tests.json');

// In-memory fallback for Vercel/read-only environments
let memoryUsers: any[] | null = null;
let memoryTests: any[] | null = null;

const MONGODB_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  role: String,
  registration: String,
  password: { type: String, select: true }
}, { strict: false });

const TestSchema = new mongoose.Schema({
  id: String,
  placa: String,
  modelo: String,
  cliente: String,
  motorista: String,
  os: String,
  percurso: String,
  dataInicio: String,
  horaInicio: String,
  kmInicio: Number,
  dataFim: String,
  horaFim: String,
  kmFim: Number,
  feedback: String
}, { strict: false });

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const TestModel = mongoose.models.Test || mongoose.model('Test', TestSchema);

async function connectDB() {
  if (MONGODB_URI && mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }
}

const DEFAULT_ADMIN = {
  firstName: 'Admin',
  lastName: 'Sistema',
  username: 'admin',
  role: 'administrador',
  registration: 'admin123',
  password: 'admin123'
};

// Ensure data directory exists (only for local dev)
if (!MONGODB_URI) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Data directory creation failed (expected on Vercel):', err);
  }
}

export async function getUsers() {
  if (MONGODB_URI) {
    await connectDB();
    const users = await UserModel.find({});
    if (users.length === 0) return [DEFAULT_ADMIN];
    return users;
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
  if (MONGODB_URI) {
    await connectDB();
    // Simple sync: clear and insert all (for small datasets)
    await UserModel.deleteMany({});
    await UserModel.insertMany(users);
    return;
  }

  memoryUsers = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('File write failed (expected on Vercel):', error);
  }
}

export async function getTests() {
  if (MONGODB_URI) {
    await connectDB();
    const tests = await TestModel.find({});
    return tests || [];
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
  if (MONGODB_URI) {
    await connectDB();
    await TestModel.deleteMany({});
    if (tests.length > 0) {
      await TestModel.insertMany(tests);
    }
    return;
  }

  memoryTests = tests;
  try {
    fs.writeFileSync(TESTS_FILE, JSON.stringify(tests, null, 2));
  } catch (error) {
    console.error('File write failed (expected on Vercel):', error);
  }
}
