/**
 * UNIVERSE OF TECH - CENTRALIZED REWARD POLICY & ECONOMY CONTROLS
 * FASE 19: Full Rewards, Replay Caps, Daily/Weekly Limits, and Cooldowns
 */

const REWARD_POLICY = Object.freeze({
    READ_LESSON: {
        eventType: 'lesson_complete',
        fullReward: { xp: 15, coins: 8, reason: "Membaca Bagian Materi" },
        replayReward: { xp: 3, coins: 1, reason: "Latihan Ulang Materi" },
        dailyCap: 150, // max 150 XP per day from lessons
        cooldownMs: 2000, // 2 seconds between lessons
        oneTimeOnly: false
    },
    COMPLETE_CHAPTER: {
        eventType: 'chapter_complete',
        fullReward: { xp: 50, coins: 25, reason: "Menyelesaikan Bab Materi" },
        replayReward: { xp: 10, coins: 5, reason: "Mengulang Bab Materi" },
        dailyCap: 200,
        cooldownMs: 3000,
        oneTimeOnly: false
    },
    QUIZ_PASSED: {
        eventType: 'quiz_complete',
        fullReward: { xp: 40, coins: 20, reason: "Menyelesaikan Kuis (Lulus)" },
        replayReward: { xp: 5, coins: 2, reason: "Latihan Ulang Kuis" },
        dailyCap: 250,
        cooldownMs: 3000,
        oneTimeOnly: false
    },
    QUIZ_PERFECT: {
        eventType: 'quiz_complete_perfect',
        fullReward: { xp: 75, coins: 40, reason: "Skor Sempurna Kuis (100%)" },
        replayReward: { xp: 10, coins: 5, reason: "Latihan Ulang Kuis Sempurna" },
        dailyCap: 300,
        cooldownMs: 3000,
        oneTimeOnly: false
    },
    SANDBOX_RUN: {
        eventType: 'sandbox_run',
        fullReward: { xp: 15, coins: 8, reason: "Eksperimen Kode di Sandbox" },
        replayReward: { xp: 0, coins: 0, reason: "Batas Eksperimen Harian" },
        maxDailyRuns: 3, // Max 3 rewarded runs per day
        dailyCap: 45,    // 3 * 15 XP
        cooldownMs: 10000, // 10s cooldown
        oneTimeOnly: false
    },
    SANDBOX_CHALLENGE: {
        eventType: 'sandbox_challenge',
        fullReward: { xp: 60, coins: 30, reason: "Menyelesaikan Lab Tantangan" },
        replayReward: { xp: 10, coins: 5, reason: "Mengulang Lab Tantangan" },
        dailyCap: 120,
        cooldownMs: 10000,
        oneTimeOnly: false
    },
    PROJECT_STEP: {
        eventType: 'project_step',
        fullReward: { xp: 25, coins: 12, reason: "Menyelesaikan Langkah Proyek" },
        replayReward: { xp: 0, coins: 0, reason: "Langkah Proyek Sudah Selesai" },
        oneTimeOnly: true // Step X of Project P rewarded strictly ONCE
    },
    PROJECT_COMPLETE: {
        eventType: 'project_complete',
        fullReward: { xp: 120, coins: 60, reason: "Menyelesaikan Proyek Portofolio" },
        replayReward: { xp: 0, coins: 0, reason: "Proyek Sudah Diselesaikan Sebelumnya" },
        oneTimeOnly: true // Project P rewarded strictly ONCE per user
    },
    DAILY_MISSION: {
        eventType: 'daily_mission_claim',
        fullReward: { xp: 40, coins: 20, reason: "Klaim Misi Harian" },
        replayReward: { xp: 0, coins: 0, reason: "Misi Harian Sudah Diklaim" },
        dailyCap: 120,
        oneTimeOnly: true
    },
    WEEKLY_MISSION: {
        eventType: 'weekly_mission_claim',
        fullReward: { xp: 120, coins: 60, reason: "Klaim Misi Mingguan" },
        replayReward: { xp: 0, coins: 0, reason: "Misi Mingguan Sudah Diklaim" },
        weeklyCap: 360,
        oneTimeOnly: true
    }
});

module.exports = {
    REWARD_POLICY
};
