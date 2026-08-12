import db from './connection.js';

export function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id TEXT PRIMARY KEY,
      id TEXT,
      name TEXT NOT NULL UNIQUE,
      purpose TEXT NOT NULL,
      owning_team TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      approved_scopes TEXT NOT NULL,
      requested_scopes TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      last_api_call_at TEXT,
      current_credential_id TEXT,
      registered_by TEXT NOT NULL DEFAULT 'Admin',
      requested_lifetime_days INTEGER NOT NULL DEFAULT 30
    );

    CREATE TABLE IF NOT EXISTS credentials (
      credential_id TEXT PRIMARY KEY,
      id TEXT,
      agent_id TEXT NOT NULL,
      token_preview TEXT NOT NULL,
      full_token TEXT NOT NULL,
      token_hash TEXT,
      scopes TEXT NOT NULL,
      issued_at TEXT NOT NULL,
      created_at TEXT,
      expires_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      revoked_at TEXT,
      revoked_reason TEXT,
      FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
    );

    CREATE TABLE IF NOT EXISTS review_reports (
      review_id TEXT PRIMARY KEY,
      id TEXT,
      run_at TEXT NOT NULL,
      run_by TEXT NOT NULL,
      total_active_agents INTEGER NOT NULL,
      stale_agent_ids TEXT NOT NULL,
      team_breakdown TEXT NOT NULL,
      sensitive_scope_holders TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      event_type TEXT NOT NULL,
      action TEXT,
      agent_id TEXT,
      actor_role TEXT NOT NULL DEFAULT 'System',
      details TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_call_log (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      credential_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      required_scope TEXT NOT NULL,
      result TEXT NOT NULL,
      reason_code TEXT
    );

    CREATE TABLE IF NOT EXISTS sim_clock (
      id INTEGER PRIMARY KEY DEFAULT 1,
      sim_offset_ms INTEGER NOT NULL DEFAULT 0
    );

    INSERT OR IGNORE INTO sim_clock (id, sim_offset_ms) VALUES (1, 0);
  `);

  // Safely alter existing tables to add alias columns if missing
  const safeAddColumn = (table: string, col: string, def: string) => {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    } catch (_) {
      // Column already exists
    }
  };

  safeAddColumn('agents', 'id', 'TEXT');
  safeAddColumn('agents', 'requested_scopes', 'TEXT');
  safeAddColumn('credentials', 'id', 'TEXT');
  safeAddColumn('credentials', 'token_hash', 'TEXT');
  safeAddColumn('credentials', 'created_at', 'TEXT');
  safeAddColumn('review_reports', 'id', 'TEXT');
  safeAddColumn('audit_log', 'action', 'TEXT');

  db.exec(`
    CREATE VIEW IF NOT EXISTS audit_logs AS SELECT id, agent_id, COALESCE(action, event_type) as action, event_type, actor_role, details, timestamp FROM audit_log;
    CREATE VIEW IF NOT EXISTS api_call_logs AS SELECT id, agent_id, credential_id, endpoint, timestamp, required_scope, result, reason_code FROM api_call_log;
  `);
}
