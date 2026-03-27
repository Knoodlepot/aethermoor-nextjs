import { Pool, PoolClient, QueryResult } from 'pg';

// Database connection pool
let pool: Pool | null = null;

export interface Account {
  id: string;
  email: string;
  password_hash: string;
  player_id: string;
  reset_token?: string;
  reset_expires?: Date;
  verified: boolean;
  verify_token?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Player {
  player_id: string;
  account_id?: string;
  tokens: number;
  total_spent: number;
  created_at: Date;
  updated_at: Date;
}

export interface TokenLog {
  id: number;
  player_id: string;
  change: number;
  reason: string;
  created_at: Date;
}

export interface Purchase {
  id: string;
  player_id: string;
  stripe_session_id?: string;
  tokens_awarded: number;
  amount_pence: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

export interface DungeonProgress {
  player_id: string;
  current_floor: number;
  deepest_floor: number;
  last_descent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LeaderboardEntry {
  player_id: string;
  hero_name: string;
  hero_class: 'Warrior' | 'Rogue' | 'Mage' | 'Cleric';
  hero_level: number;
  deepest_floor: number;
  ng_plus: number;
  updated_at: Date;
}

export interface DungeonDescent {
  id: number;
  player_id: string;
  floor: number;
  created_at: Date;
}

export interface GameSave {
  player_id: string;
  player_json: string;
  seed_json: string;
  messages_json?: string;
  narrative?: string;
  log_json?: string;
  saved_at: Date;
  updated_at: Date;
}

export interface ModerationIncident {
  id: number;
  account_id: string;
  player_id: string;
  source: string;
  reason: string;
  trigger_text?: string;
  status: 'pending' | 'dismissed' | 'escalated';
  admin_notes?: string;
  created_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
}

let dbInitialized = false;

/**
 * Initialize PostgreSQL connection pool
 */
export async function initDb(): Promise<void> {
  if (dbInitialized && pool) {
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 3,                      // limit simultaneous connections (serverless safety)
    connectionTimeoutMillis: 8000, // fail fast rather than hang
    idleTimeoutMillis: 30000,
  });

  // Test connection
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    console.log('✓ Database connection established');
  } finally {
    client.release();
  }

  dbInitialized = true;
}

/**
 * Get database client from pool
 */
export async function getDbClient(): Promise<PoolClient> {
  if (!pool || !dbInitialized) {
    await initDb();
  }
  return pool!.connect();
}

/**
 * Execute database query
 */
export async function query<T extends Record<string, any> = Record<string, any>>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  if (!pool || !dbInitialized) {
    await initDb();
  }
  return pool!.query<T>(text, params);
}

/**
 * Initialize database schema (create tables if they don't exist)
 */
export async function migrateDb(): Promise<void> {
  const client = await getDbClient();
  let migrated = false;

  try {
    // Check if tables exist
    const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'accounts'
      )
    `);

    if (res.rows[0].exists) {
      // Tables exist — apply any column additions idempotently so deploys self-heal.
      const columnMigrations = [
        `ALTER TABLE accounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
        `ALTER TABLE players ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
        `ALTER TABLE dungeon_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`,
        `ALTER TABLE dungeon_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
        `ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
        `ALTER TABLE game_saves ADD COLUMN IF NOT EXISTS slot INTEGER NOT NULL DEFAULT 1`,
        // Re-key game_saves from (player_id) to (player_id, slot) — only if old PK constraint exists
        // We check by trying to drop it; the new unique constraint acts as the PK
        `DO $$ BEGIN
           IF EXISTS (
             SELECT 1 FROM pg_constraint
             WHERE conname = 'game_saves_pkey'
               AND contype = 'p'
               AND conrelid = 'game_saves'::regclass
           ) THEN
             ALTER TABLE game_saves DROP CONSTRAINT game_saves_pkey;
             ALTER TABLE game_saves ADD PRIMARY KEY (player_id, slot);
           END IF;
         END $$`,
        `ALTER TABLE moderation_incidents ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','dismissed','escalated'))`,
        `ALTER TABLE moderation_incidents ADD COLUMN IF NOT EXISTS admin_notes TEXT`,
        `ALTER TABLE moderation_incidents ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ`,
        `ALTER TABLE moderation_incidents ADD COLUMN IF NOT EXISTS reviewed_by TEXT`,
        `ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS world_seed TEXT`,
        `ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS world_name TEXT`,
        `ALTER TABLE leaderboard_entries ADD COLUMN IF NOT EXISTS country_code TEXT`,
        `ALTER TABLE token_log ADD COLUMN IF NOT EXISTS model_tier TEXT`,
        `ALTER TABLE moderation_incidents ADD COLUMN IF NOT EXISTS card_type TEXT CHECK (card_type IN ('yellow', 'red'))`,
        `CREATE TABLE IF NOT EXISTS preview_invites (
          token TEXT PRIMARY KEY,
          used_at TIMESTAMPTZ,
          expires_at TIMESTAMPTZ,
          account_id TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS beta_keys (
          token TEXT PRIMARY KEY,
          label TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ,
          revoked BOOLEAN NOT NULL DEFAULT FALSE
        )`,
      ];
      for (const sql of columnMigrations) {
        await client.query(sql);
      }
      console.log('✓ Database schema up to date');
      return;
    }

    console.log('Creating database schema...');

    // Create accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        player_id TEXT UNIQUE NOT NULL,
        reset_token TEXT,
        reset_expires TIMESTAMPTZ,
        verified BOOLEAN DEFAULT false,
        verify_token TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
      CREATE INDEX IF NOT EXISTS idx_accounts_player_id ON accounts(player_id);
    `);

    // Create players table
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        player_id TEXT PRIMARY KEY,
        account_id UUID UNIQUE REFERENCES accounts(id) ON DELETE CASCADE,
        tokens INTEGER NOT NULL DEFAULT 0 CHECK (tokens >= 0),
        total_spent INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_players_account_id ON players(account_id);
    `);

    // Create token_log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_log (
        id SERIAL PRIMARY KEY,
        player_id TEXT NOT NULL REFERENCES players(player_id),
        change INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_token_log_player_id ON token_log(player_id);
    `);

    // Create purchases table
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL REFERENCES players(player_id),
        stripe_session_id TEXT,
        tokens_awarded INTEGER NOT NULL CHECK (tokens_awarded > 0),
        amount_pence INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_purchases_player_id ON purchases(player_id);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_stripe_session_id ON purchases(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
    `);

    // Create dungeon_progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dungeon_progress (
        player_id TEXT PRIMARY KEY REFERENCES players(player_id),
        current_floor INTEGER NOT NULL DEFAULT 0,
        deepest_floor INTEGER NOT NULL DEFAULT 0,
        last_descent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create leaderboard_entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard_entries (
        player_id TEXT PRIMARY KEY REFERENCES players(player_id),
        hero_name TEXT NOT NULL,
        hero_class TEXT NOT NULL CHECK (hero_class IN ('Warrior', 'Rogue', 'Mage', 'Cleric')),
        hero_level INTEGER NOT NULL DEFAULT 1 CHECK (hero_level > 0),
        deepest_floor INTEGER NOT NULL DEFAULT 0,
        ng_plus INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_leaderboard_floor ON leaderboard_entries(deepest_floor DESC);
    `);

    // Create dungeon_descents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS dungeon_descents (
        id SERIAL PRIMARY KEY,
        player_id TEXT NOT NULL REFERENCES players(player_id),
        floor INTEGER NOT NULL CHECK (floor > 0),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_dungeon_descents_player_id ON dungeon_descents(player_id);
    `);

    // Create game_saves table
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_saves (
        player_id TEXT NOT NULL REFERENCES players(player_id),
        slot INTEGER NOT NULL DEFAULT 1,
        player_json TEXT NOT NULL,
        seed_json TEXT NOT NULL,
        messages_json TEXT DEFAULT '[]',
        narrative TEXT DEFAULT '',
        log_json TEXT DEFAULT '[]',
        saved_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (player_id, slot)
      );
    `);

    // Create moderation_incidents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS moderation_incidents (
        id SERIAL PRIMARY KEY,
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        player_id TEXT NOT NULL,
        source TEXT NOT NULL,
        reason TEXT NOT NULL,
        trigger_text TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'escalated')),
        admin_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ,
        reviewed_by UUID REFERENCES accounts(id)
      );
      CREATE INDEX IF NOT EXISTS idx_moderation_account_id ON moderation_incidents(account_id);
      CREATE INDEX IF NOT EXISTS idx_moderation_status ON moderation_incidents(status);
    `);

    // Create preview_invites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS preview_invites (
        token TEXT PRIMARY KEY,
        used_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ,
        account_id TEXT
      );
    `);

    migrated = true;
  } finally {
    if (migrated) {
      console.log('✓ Database schema created successfully');
    }
    client.release();
  }
}

/**
 * Test database connection
 */
export async function testDb(): Promise<boolean> {
  try {
    const result = await query('SELECT 1');
    return result.rowCount === 1;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

/**
 * Close database connection pool
 */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    dbInitialized = false;
    console.log('✓ Database connection closed');
  }
}
