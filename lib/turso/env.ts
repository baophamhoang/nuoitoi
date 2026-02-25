// Centralized Turso environment helpers

export function getTursoUrl(): string {
  return process.env.TURSO_DATABASE_URL || '';
}

export function getTursoAuthToken(): string {
  return process.env.TURSO_AUTH_TOKEN || '';
}

export function isTursoConfigured(): boolean {
  return Boolean(getTursoUrl());
}
