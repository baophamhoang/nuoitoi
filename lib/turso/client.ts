import { createClient, type Client } from '@libsql/client';
import { getTursoAuthToken, getTursoUrl } from './env';

let db: Client | null = null;

export function getDb(): Client {
  if (!db) {
    db = createClient({
      url: getTursoUrl(),
      authToken: getTursoAuthToken() || undefined,
    });
  }
  return db;
}
