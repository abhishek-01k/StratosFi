import { existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadDotenv } from 'dotenv';

export function loadEnv() {
  const nodeEnv = process.env.NODE_ENV || 'local';
  const envPath = resolve(process.cwd(), `env/.env.${nodeEnv}`);
  
  if (!existsSync(envPath)) {
    console.error(`Environment file not found: ${envPath}`);
    console.error('Please create the file based on env/.env.example');
    process.exit(1);
  }

  const result = loadDotenv({ path: envPath });
  
  if (result.error) {
    console.error('Error loading environment file:', result.error);
    process.exit(1);
  }

  console.log(`Loaded environment from: ${envPath}`);
}