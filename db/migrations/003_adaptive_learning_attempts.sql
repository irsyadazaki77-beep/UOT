-- Universe of Tech - Database Schema Migration 003
-- Adaptive Learning Telemetry & Skill Attempts Capture

ALTER TABLE quiz_attempts ADD COLUMN skill TEXT;
ALTER TABLE quiz_attempts ADD COLUMN topic TEXT;
ALTER TABLE quiz_attempts ADD COLUMN difficulty INTEGER DEFAULT 1;
ALTER TABLE quiz_attempts ADD COLUMN answers_json TEXT;
ALTER TABLE quiz_attempts ADD COLUMN hint_count INTEGER DEFAULT 0;
ALTER TABLE quiz_attempts ADD COLUMN metadata_json TEXT;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_skill ON quiz_attempts(user_id, skill);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_created ON quiz_attempts(user_id, created_at);
