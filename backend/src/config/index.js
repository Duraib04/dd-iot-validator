import dotenv from 'dotenv';

dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validation
const requiredEnvVars = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];
const missing = requiredEnvVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

export default config;
