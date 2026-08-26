# UNIVERSE OF TECH (UOT) — SYSTEM INTEGRATION & ARCHITECTURE MAP

This document details the single integrated application architecture for Universe Of Tech (UOT). It specifies the dependency map, unified activity pipeline, event bus contracts, and server-authoritative state model.

---

## 1. SUBSYSTEM DEPENDENCY & INTEGRATION MAP

```
                     ┌───────────────────────────┐
                     │   UI Activities / Pages   │
                     │ (Lesson, Quiz, Project,   │
                     │  Game, Sandbox, Mission)  │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │     ActivityService       │
                     │    (/activity-service.js) │
                     └──────┬────────────┬───────┘
                            │            │
            ┌───────────────┘            └───────────────┐
            │                                            │
            ▼                                            ▼
┌───────────────────────────┐                ┌───────────────────────────┐
│     ProgressionEngine     │                │        SyncEngine         │
│  (Optimistic Local State) │                │  (Offline Queue / Event)  │
└───────────┬───────────────┘                └───────────┬───────────────┘
            │                                            │
            │                                            ▼
            │                                ┌───────────────────────────┐
            │                                │      Backend Server       │
            │                                │ (/api/progress/events)    │
            │                                └───────────┬───────────────┘
            │                                            │
            ▼                                            ▼
┌───────────────────────────┐                ┌───────────────────────────┐
│   Adaptive Learning &     │                │   Authoritative State     │
│      Analytics SDK        │◄───────────────┤    (Server Database)      │
└───────────────────────────┘                └───────────────────────────┘
```

### Core Subsystems Matrix

| Subsystem | File / Entrypoint | Key Role in Integrated Pipeline |
| :--- | :--- | :--- |
| **Activity Pipeline** | `/activity-service.js` | Single entry point and facade for all user activity completions. Orchestrates local updates, sync queueing, telemetry, and event bus emissions. |
| **Progression Engine** | `/progression-engine.js` | Authoritative local store for XP, Coins, Level calculations, Streaks, Daily/Weekly Missions, and Achievements. |
| **Sync Engine** | `/sync-engine.js` | Manages offline event queueing (`uot_pending_events`), client-server synchronization, idempotency, and retry handling. |
| **Adaptive Learning** | `/adaptive-learning-engine.js` | Computes multi-factor skill mastery, spaced repetition timers, prerequisite gating, and remedial activity recommendations. |
| **Analytics Engine** | `/analytics-engine.js`, `/analytics.js` | Privacy-conscious event tracking, performance reporting, session metrics, and error logging. |
| **Content Engine** | `/content-engine.js` | Schema validation and metadata retrieval for courses, quizzes, and learning materials. |
| **Backend API** | `/server.js`, `/server-db.js` | Authoritative validation server processing `/api/progress/events`, enforcing server-side reward rules and data isolation. |

---

## 2. THE UNIFIED SINGLE ACTIVITY PIPELINE

All user interactions (`lesson`, `quiz`, `project`, `game`, `achievement`, `mission`, `sandbox`) follow the strict 7-stage single pipeline:

```
[1. UI Activity Trigger]
        │
        ▼
[2. ActivityService Entry Point]
        │
        ├─► [3. Local Progress Optimistic Update (ProgressionEngine)]
        │
        ├─► [4. SyncEngine Event Queueing (SyncEngine.queueEvent)]
        │
        ├─► [5. Telemetry Logging (UOTAnalytics.trackEvent)]
        │
        ├─► [6. Mastery & Recommendation Calculation (AdaptiveLearningEngine)]
        │
        ├─► [7. Event Bus Emissions (uot:activity, uot:progress, uot:mastery)]
        │
        ▼
[8. Authoritative Server Sync & UI State Refresh]
```

### Pipeline Flow Explanation:

1. **UI Activity**: The user completes an activity (e.g. finishes a lesson, passes a quiz, submits a project, executes sandbox code, or claims a mission).
2. **Activity Service (`ActivityService`)**: The UI component invokes a method on `window.ActivityService` (e.g., `recordLesson`, `recordQuiz`, `recordProject`, `recordGame`, `recordSandboxRun`).
3. **Local Progress**: `ProgressionEngine` immediately performs an optimistic state update (awarding XP/Coins, checking streak bonuses, and calculating level progress) so the user gets instant feedback without latency.
4. **SyncEngine Queue**: `SyncEngine.queueEvent()` creates an idempotent event payload with a client timestamp and unique `eventId`, storing it in `localStorage` under `uot_pending_events`.
5. **Telemetry**: `UOTAnalytics` logs privacy-compliant telemetry metrics (e.g., completion time, score, pass status).
6. **Mastery Calculation**: `AdaptiveLearningEngine` evaluates domain mastery scores and updates recommendation queues.
7. **Event Bus Emissions**: Custom events (`uot:activity`, `uot:progress`, `uot:mastery`) are dispatched on `window` to allow decoupled UI components to re-render reactively.
8. **Server Sync & Authoritative Reconciliation**: If the client is online, `SyncEngine.flushQueue()` transmits pending events to `POST /api/progress/events`. The server validates event signatures, updates the server database, and returns authoritative state reconciliation.

---

## 3. STANDARD EVENT BUS CONTRACTS

The system utilizes standard `CustomEvent` instances dispatched on `window` and direct subscriptions via `ActivityService.subscribe()`.

### Event Channels

| Channel | Event Name | Payload Description |
| :--- | :--- | :--- |
| **`EVENTS.ACTIVITY`** | `"uot:activity"` | `{ type, activityId, status, payload, feedback, timestamp }` — Emitted when any activity completion is processed. |
| **`EVENTS.PROGRESS`** | `"uot:progress"` | `{ lifetimeXp, coins, level, streak, levelMetrics, timestamp }` — Emitted when player progress metrics change. |
| **`EVENTS.SYNC`** | `"uot:sync"` | `{ status, pendingCount, lastSyncedAt }` — Emitted on sync status transitions (queueing, syncing, synced, offline). |
| **`EVENTS.AUTH`** | `"uot:auth"` | `{ user, isAuthenticated }` — Emitted when user authentication status changes. |
| **`EVENTS.CONTENT`** | `"uot:content"` | `{ type, action, contentId }` — Emitted on content filter, bookmark, or navigation events. |
| **`EVENTS.MASTERY`** | `"uot:mastery"` | `{ masterySummary, recommendations, timestamp }` — Emitted when mastery scores or adaptive recommendations are updated. |

---

## 4. SERVER-AUTHORITATIVE STATE MODEL & OFFLINE RESILIENCE

- **Authenticated Users**: The server (`/server-db.js`) is the canonical authority. XP and rewards calculated on the client are treated as optimistic local state. When online, events queued in `SyncEngine` are transmitted to `/api/progress/events`, where the server evaluates reward multipliers and responds with authoritative totals.
- **Offline Mode**: When offline, events remain securely queued in `uot_pending_events`. When network connectivity is restored (`online` window event), `SyncEngine` automatically flushes the queue sequentially with automatic retry and exponential backoff.
- **Idempotency**: Every sync event carries a deterministic or UUID-based `eventId`. The server tracks processed event IDs in `server_event_log` to guarantee that duplicate network transmissions do not result in double-rewarding.

---

## 5. AUDIT & VERIFICATION SUMMARY

- **All 72 Automated Unit, Integration, and Security Tests**: Passing green.
- **Unified Pipeline Coverage**: Integrated across `materi.html`, `materi-studio.js`, `lms-quiz.js`, `projects.js`, `games/game-core.js`, `sandbox-runner.js`, and `app-shell.js`.
- **Zero Architecture Clutter**: Maintained strict scope discipline without introducing extraneous features.
