import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file in production (on EC2)
// In development/Replit, environment variables come from Secrets
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const envPath = join(__dirname, '..', '.env');
  
  config({ path: envPath });
  console.log('✓ Loaded environment variables from .env file');
}

// Helper to get environment variable with fallback
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

// Validate required environment variables
export function validateEnv() {
  // Critical variables required for app to start
  const critical = [
    'DATABASE_URL',
    'SESSION_SECRET',
  ];

  const missingCritical = critical.filter(key => !process.env[key]);
  
  if (missingCritical.length > 0) {
    console.error('❌ Missing critical environment variables:', missingCritical.join(', '));
    console.error('Please check your .env file or Replit Secrets');
    process.exit(1);
  }
  
  console.log('✓ Critical environment variables are set');
  
  // Optional but recommended variables
  const optional = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'CASHFREE_APP_ID',
    'CASHFREE_SECRET_KEY',
    'FORMSPREE_ENDPOINT',
    'ADMIN_PASSWORD_HASH',
  ];
  
  const missingOptional = optional.filter(key => !process.env[key]);
  
  if (missingOptional.length > 0) {
    console.warn('⚠️  Missing optional environment variables:', missingOptional.join(', '));
    console.warn('Some features may not work without these credentials');
  } else {
    console.log('✓ All optional environment variables are set');
  }
}
