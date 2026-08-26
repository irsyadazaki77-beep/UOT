-- Universe of Tech - Database Schema Migration 001
-- Tables, Foreign Keys, Unique Constraints, and Performance Indexes

CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_pro INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf_token TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    is_pro INTEGER NOT NULL DEFAULT 0,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    lifetime_xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    coins INTEGER NOT NULL DEFAULT 50,
    streak INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    streak_freeze_count INTEGER NOT NULL DEFAULT 0,
    equipped_avatar TEXT DEFAULT '👨‍💻',
    equipped_theme TEXT DEFAULT 'ocean',
    equipped_accent TEXT DEFAULT 'ocean',
    flagged INTEGER NOT NULL DEFAULT 0,
    settings_json TEXT,
    personal_bests_json TEXT,
    daily_missions_json TEXT,
    weekly_missions_json TEXT,
    challenge_progress_json TEXT,
    recommendation_history_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress_events (
    event_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    client_timestamp TEXT,
    server_timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    coins_awarded INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    payload_json TEXT,
    result_json TEXT,
    UNIQUE(user_id, event_id)
);

CREATE TABLE IF NOT EXISTS user_completed_lessons (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    is_passed INTEGER NOT NULL DEFAULT 0,
    is_perfect INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL,
    current_step INTEGER NOT NULL DEFAULT 0,
    completed_steps_json TEXT,
    is_completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS achievements (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_inventory (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    source TEXT DEFAULT 'manual',
    starts_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT,
    is_trial INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS followers (
    follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL,
    target_goal INTEGER NOT NULL DEFAULT 1,
    creator_progress INTEGER NOT NULL DEFAULT 0,
    target_progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    winner_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    data_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content (
    domain TEXT NOT NULL,
    id TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    content_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (domain, id)
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    event_name TEXT NOT NULL,
    session_id TEXT,
    user_id TEXT,
    properties_json TEXT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS error_telemetry (
    id TEXT PRIMARY KEY,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    url TEXT,
    session_id TEXT,
    user_id TEXT,
    metadata_json TEXT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS web_vitals (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    rating TEXT,
    url TEXT,
    session_id TEXT,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feature_flags (
    flag_key TEXT PRIMARY KEY,
    is_enabled INTEGER NOT NULL DEFAULT 0,
    fallback INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suspicious_flags (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    event_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_state (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_progress_events_user_id ON progress_events(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_event_type ON progress_events(event_type);
CREATE INDEX IF NOT EXISTS idx_progress_events_server_timestamp ON progress_events(server_timestamp);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_content_domain_status ON content(domain, status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_telemetry_timestamp ON error_telemetry(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
