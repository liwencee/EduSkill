const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getSupabaseClient } = require('../config/database');

const SALT_ROUNDS = 12;

async function registerUser({ email, password, name, role }) {
  const db = getSupabaseClient();

  if (db) {
    const { data: existing } = await db.from('users').select('id').eq('email', email).single();
    if (existing) throw new Error('Email already registered');
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = { id: uuidv4(), email, password_hash, name, role, created_at: new Date().toISOString() };

  if (db) {
    const { data, error } = await db.from('users').insert(user).select().single();
    if (error) throw new Error(`Registration failed: ${error.message}`);
    return data;
  }

  return user;
}

async function loginUser(email, password) {
  const db = getSupabaseClient();

  if (db) {
    const { data: user, error } = await db.from('users').select('*').eq('email', email).single();
    if (error || !user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid credentials');
    return user;
  }

  throw new Error('Database not configured');
}

async function getUserById(id) {
  const db = getSupabaseClient();
  if (!db) return null;
  const { data } = await db.from('users').select('id, email, name, role, created_at').eq('id', id).single();
  return data;
}

async function changePassword(userId, currentPassword, newPassword) {
  const db = getSupabaseClient();
  if (!db) throw new Error('Database not configured');

  const { data: user } = await db.from('users').select('password_hash').eq('id', userId).single();
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw new Error('Current password is incorrect');

  const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const { error } = await db.from('users').update({ password_hash, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw new Error('Password update failed');
}

module.exports = { registerUser, loginUser, getUserById, changePassword };
