import 'dotenv/config';

export const REQUEST_TIMEOUT = Number(process.env.YUKTIPREP_TIMEOUT ?? 25);
export const DAILY_SCORE = Number(process.env.YUKTIPREP_DAILY_SCORE ?? 70);
export const WEEKLY_SCORE = Number(process.env.YUKTIPREP_WEEKLY_SCORE ?? 60);
export const MONTHLY_SCORE = Number(process.env.YUKTIPREP_MONTHLY_SCORE ?? 52);

export const AI_ENABLED = (process.env.YUKTIPREP_AI_ENABLED ?? 'true').toLowerCase() !== 'false';
export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:latest';
export const AI_TIMEOUT = Number(process.env.YUKTIPREP_AI_TIMEOUT ?? 60) * 1000;
export const AI_RETRIES = Number(process.env.YUKTIPREP_AI_RETRIES ?? 2);
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};
