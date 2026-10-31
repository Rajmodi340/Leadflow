const path = require('path');
const fs = require('fs');

// Load environment variables from the usual locations. Supports both
// container-injected env vars and a mounted .env file in any of these paths.
const envCandidates = [
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '..', '.env'),
  '/app/.env',
  '/app/backend/.env',
  '/.env',
];

for (const candidate of envCandidates) {
  try {
    if (fs.existsSync(candidate)) {
      require('dotenv').config({ path: candidate });
    }
  } catch (err) {
    // ignore unreadable candidates
  }
}

// Also parse a .env-style file if the platform mounts env as `env.txt`/`app.env`
for (const extra of ['/app/env.txt', '/app/app.env']) {
  try {
    if (fs.existsSync(extra)) {
      const content = fs.readFileSync(extra, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!match) continue;
        const key = match[1];
        const value = match[2].replace(/^['"]|['"]$/g, '');
        if (process.env[key] === undefined) process.env[key] = value;
      }
    }
  } catch (err) {
    // ignore
  }
}

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 9999,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'production',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLIENT_URL: process.env.CLIENT_URL,
};
