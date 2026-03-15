export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { migrateDb } = await import('./lib/db');
      await migrateDb();
    } catch (err) {
      // Log but do not crash — the server must start even if the DB is briefly
      // unavailable on deploy. Migration will be retried on the first API request.
      console.error('[instrumentation] DB migration failed on startup (will retry on first request):', err);
    }
  }
}
