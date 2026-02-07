import { config } from 'dotenv';

// Load the appropriate .env file based on the NODE_ENV
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

// Destructure environment variables
const { 
  PORT, 
  NODE_ENV, 
  DB_URI, 
  JWT_SECRET, 
  JWT_EXPRESS_IN, 
  ARCJECT_KEY, 
  ARCJECT_ENV, 
  QSTASH_URL, 
  QSTASH_TOKEN, 
  SERVER_URL ,
  EMAIL_PASSWORD
} = process.env;

// Check if any required environment variable is missing
if (
  !PORT || 
  !NODE_ENV || 
  !DB_URI || 
  !JWT_SECRET || 
  !JWT_EXPRESS_IN || 
  !ARCJECT_KEY || 
  !ARCJECT_ENV || 
  !QSTASH_URL || 
  !QSTASH_TOKEN || 
  !SERVER_URL||
  !EMAIL_PASSWORD
) {
  throw new Error("Missing required environment variables");
}

// Export the environment variables
export { 
  PORT, 
  NODE_ENV, 
  DB_URI, 
  JWT_SECRET, 
  JWT_EXPRESS_IN, 
  ARCJECT_KEY, 
  ARCJECT_ENV, 
  QSTASH_URL, 
  QSTASH_TOKEN, 
  SERVER_URL,
  EMAIL_PASSWORD
};