// Vercel Serverless Config
// Place in: frontend/api/config.js

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Environment variables from Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const emailApiKey = process.env.EMAIL_API_KEY;
const emailService = process.env.EMAIL_SERVICE || 'resend'; // resend, sendgrid, mailgun
const adminEmail = process.env.ADMIN_EMAIL;

// Initialize Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI
export const openai = new OpenAI({
  apiKey: openaiKey,
});

// Email configuration
export const emailConfig = {
  service: emailService,
  apiKey: emailApiKey,
  adminEmail: adminEmail,
};

// Validation
if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('Missing required environment variables');
}

export default {
  supabase,
  openai,
  emailConfig,
};
