// Makes the "Secret Key (for OAuth)" that Supabase needs for Sign in with Apple,
// from the .p8 key file downloaded from Apple Developer (Keys).
//
// Apple only accepts these for up to 6 months, so run this again before it expires
// and paste the new one into Supabase > Authentication > Sign In / Providers > Apple.
//
// Usage:  node scripts/apple-client-secret.mjs ~/path/to/AuthKey_3K62P84TCX.p8
// The secret is copied to the clipboard (macOS) and never printed.
import { readFileSync } from 'node:fs';
import { createPrivateKey, sign } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const TEAM_ID = 'SCJ68FMLW7';           // Apple Developer team
const KEY_ID = '3K62P84TCX';            // "The ZINN App Sign In" key
const SERVICES_ID = 'com.thezinnapp.web'; // Services ID used for web sign-in
const LIFETIME_DAYS = 180;              // Apple's maximum is 6 months

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/apple-client-secret.mjs /path/to/AuthKey_XXXX.p8');
  process.exit(1);
}

const b64url = (input) => Buffer.from(input).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const exp = now + LIFETIME_DAYS * 24 * 60 * 60;

const header = b64url(JSON.stringify({ alg: 'ES256', kid: KEY_ID }));
const payload = b64url(JSON.stringify({
  iss: TEAM_ID,
  iat: now,
  exp,
  aud: 'https://appleid.apple.com',
  sub: SERVICES_ID,
}));
const key = createPrivateKey(readFileSync(file));
const signature = sign('sha256', Buffer.from(`${header}.${payload}`), { key, dsaEncoding: 'ieee-p1363' });
const secret = `${header}.${payload}.${b64url(signature)}`;

execFileSync('pbcopy', { input: secret });
console.log('Apple client secret copied to the clipboard.');
console.log(`It expires on ${new Date(exp * 1000).toDateString()}. Make a new one before then.`);
