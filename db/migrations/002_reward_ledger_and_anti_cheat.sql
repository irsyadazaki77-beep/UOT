-- Universe of Tech - Database Schema Migration 002
-- Reward Ledger, Step Deduplication, and Anti-Cheat Telemetry

CREATE TABLE IF NOT EXISTS reward_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    content_id TEXT,
    status TEXT NOT NULL, -- 'APPLIED', 'REPLAY', 'CAPPED', 'REJECTED'
    base_xp INTEGER NOT NULL DEFAULT 0,
    awarded_xp INTEGER NOT NULL DEFAULT 0,
    base_coins INTEGER NOT NULL DEFAULT 0,
    awarded_coins INTEGER NOT NULL DEFAULT 0,
    balance_xp_before INTEGER NOT NULL DEFAULT 0,
    balance_xp_after INTEGER NOT NULL DEFAULT 0,
    balance_coins_before INTEGER NOT NULL DEFAULT 0,
    balance_coins_after INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reward_ledger_user_id ON reward_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_event_id ON reward_ledger(event_id);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_created_at ON reward_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_reward_ledger_event_type_content ON reward_ledger(event_type, content_id);

CREATE TABLE IF NOT EXISTS user_completed_steps (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL,
    step_number INTEGER NOT NULL,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, project_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_completed_steps_user_project ON user_completed_steps(user_id, project_id);
