// Generates the `anon` and `service_role` JWTs for a self-hosted Supabase
// stack from its JWT_SECRET. Run locally — never paste JWT_SECRET into chat.
//
// Usage (PowerShell):
//   $env:JWT_SECRET = 'paste-the-real-secret-here'
//   node scripts/generate-supabase-jwt.js
//
// Usage (bash):
//   JWT_SECRET='paste-the-real-secret-here' node scripts/generate-supabase-jwt.js

const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

if (!secret) {
  console.error('Missing JWT_SECRET. Set it as an env var for this command only, e.g.:');
  console.error('  PowerShell: $env:JWT_SECRET = \'<value from Railway>\'; node scripts/generate-supabase-jwt.js');
  console.error('  bash:       JWT_SECRET=\'<value from Railway>\' node scripts/generate-supabase-jwt.js');
  process.exit(1);
}

const iat = Math.floor(Date.now() / 1000);
const exp = iat + 60 * 60 * 24 * 365 * 10; // 10 years — matches Supabase's own long-lived infra keys

const anonKey = jwt.sign({ role: 'anon', iss: 'supabase', iat, exp }, secret, { algorithm: 'HS256' });
const serviceRoleKey = jwt.sign({ role: 'service_role', iss: 'supabase', iat, exp }, secret, { algorithm: 'HS256' });

console.log('\nANON_KEY (safe to use as NEXT_PUBLIC_SUPABASE_ANON_KEY):\n');
console.log(anonKey);
console.log('\nSERVICE_ROLE_KEY (server-only — do NOT prefix with NEXT_PUBLIC_, do NOT paste into chat):\n');
console.log(serviceRoleKey);
console.log('');
