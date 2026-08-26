# Universe of Tech (UOT) — Cloud Save & Data Architecture

## 1. System Overview

Universe of Tech implements an **Offline-First, Server-Authoritative Cloud Save Architecture**. User progression, achievements, inventory, learning progress, and settings are synchronized seamlessly between client offline storage and a persistent server database.

```
+-------------------------------------------------------------------------+
|                               CLIENT SIDE                               |
|                                                                         |
|   +---------------------+    Events Queue    +----------------------+   |
|   | Progression Engine  | -----------------> |    Sync Engine       |   |
|   |  (uot_game_state)   | <----------------- |   (sync-engine.js)   |   |
|   +---------------------+  Authoritative     +----------------------+   |
|                                Updates                   |              |
+----------------------------------------------------------|--------------+
                                                           | HTTP / REST
                                                           v
+-------------------------------------------------------------------------+
|                               SERVER SIDE                               |
|                                                                         |
|   +---------------------+   Database Methods  +---------------------+   |
|   |    Express Server   | -----------------> |  Server Database DB  |   |
|   |     (server.js)     | <----------------- |    (server-db.js)    |   |
|   +---------------------+   Authoritative     +---------------------+   |
|                                 State                    |              |
|                                                          v              |
|                                               +---------------------+   |
|                                               | Persistent Storage  |   |
|                                               |  (data/db_store)    |   |
|                                               +---------------------+   |
+-------------------------------------------------------------------------+
```

---

## 2. Server Authoritative Data Schema (Schema Version 5)

The server stores the full user progress document with the following schema:

```json
{
  "userId": "usr_demo_7701",
  "schemaVersion": 5,
  "profile": {
    "username": "DemoLearner",
    "email": "demo@universeoftech.id",
    "avatar": "👨‍💻",
    "title": "Script Kiddie",
    "role": "user",
    "isPro": false
  },
  "lifetimeXp": 150,
  "level": 2,
  "coins": 85,
  "streak": 1,
  "lastActiveDate": "2026-08-22",
  "streakFreezeCount": 0,
  "achievements": ["first_step"],
  "inventory": ["👨‍💻"],
  "equippedItems": {
    "avatar": "👨‍💻",
    "theme": "ocean",
    "accent": "ocean"
  },
  "learningProgress": {
    "completedLessons": ["web-html-semantik"],
    "chapterProgress": {}
  },
  "quizHistory": {
    "web-quiz-1": {
      "attempts": 1,
      "bestScore": 100,
      "passedAt": "2026-08-22T02:00:00Z"
    }
  },
  "projectProgress": {},
  "missionProgress": {
    "daily": { "dateKey": "2026-08-22", "completedIds": [], "claimedIds": [] },
    "weekly": { "weekKey": "2026-W34", "completedIds": [], "claimedIds": [] }
  },
  "settings": {
    "theme": "light",
    "soundEnabled": true,
    "studyMode": "balanced",
    "dailyGoal": 30,
    "language": "id",
    "reducedMotion": false,
    "publicProfile": true,
    "analytics": true
  },
  "processedEvents": {
    "evt_1724300000_abc123": {
      "processedAt": "2026-08-22T02:00:00Z",
      "eventType": "lesson_complete",
      "result": { "awardedXp": 15, "awardedCoins": 8 }
    }
  },
  "updatedAt": "2026-08-22T02:45:00.000Z"
}
```

---

## 3. Server Endpoints & Security Controls

| Method | Endpoint | Description | Security / Constraints |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/me` | Fetch user profile & summary progression | Session check, CSRF header |
| `GET` | `/api/progress` | Fetch authoritative progress document | CSRF header |
| `POST` | `/api/progress/events` | Send activity event for server verification | Idempotency check, rejects arbitrary XP |
| `POST` | `/api/progress/sync` | Batch event sync & legacy data migration | Rate limited (30/min), CSRF header |
| `GET` | `/api/achievements` | Fetch catalog & unlocked status | Read-only |
| `GET` | `/api/inventory` | Fetch inventory & equipped items | Read-only |
| `PATCH` | `/api/settings` | Update user preferences | Input validation |
| `POST` | `/api/inventory/equip` | Equip item | Item ownership verification |

---

## 4. Anti-Cheat & Event Validation Rules

Client submissions requesting direct XP modifications (e.g. `{ xp: 999999 }`) are **STRICTLY REJECTED** by the server with `400 Bad Request (ARBITRARY_XP_REJECTED)`.

All progression updates must be driven by verified activity events:
- `lesson_complete`: Rewards +15 XP, +8 coins for new lessons.
- `quiz_complete`: Validates score (0..100). Rewards +40 XP for pass (>=70%), +75 XP for perfect score (100%).
- `project_complete` / `project_step`: Rewards step or full project completion based on server configuration.
- `daily_mission_claim`: Validates mission is unclaimed today. Rewards +40 XP, +20 coins.
- `achievement_unlock`: Validates achievement exists in catalog and wasn't previously unlocked.

---

## 5. Conflict Resolution Strategy

When synchronizing client cache and server database, UOT applies domain-specific conflict resolution rules:

1. **Lifetime XP & Level**: Server authoritative. Level is calculated directly using `calculateLevelMetrics(lifetimeXp)`.
2. **Achievements**: Set union (`Array.from(new Set([...server, ...client]))`). Laptops or mobile devices unlocking different badges offline will merge all badges safely.
3. **Inventory**: Set union. Items unlocked on any device remain in the user's permanent collection.
4. **Quiz Scores**: Maximum score preserved (`Math.max(serverBest, clientBest)`).
5. **Completed Lessons**: Set union of lesson IDs.
6. **Settings**: Timestamp-based latest update wins.

---

## 6. Offline Support & Sync Status UI

The client `SyncEngine` manages an offline queue in `localStorage` (`uot_pending_events`).
- When offline, activity events are safely appended to `uot_pending_events`.
- When connectivity is restored, `SyncEngine` automatically flushes the queue using exponential backoff (starting at 1s, doubling up to 30s).
- An unobtrusive status pill (`#syncStatusBadge`) displays real-time connection state:
  - 🟢 `Synced`
  - 🔄 `Syncing...`
  - 📡 `Offline`
  - ⚠️ `Sync Error`
