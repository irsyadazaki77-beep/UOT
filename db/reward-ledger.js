/**
 * UNIVERSE OF TECH - REWARD LEDGER & TRANSACTION MANAGER
 * FASE 19: Double-Entry Immutable Economy Mutation Ledger with Anti-Abuse Controls
 */

const { REWARD_POLICY } = require('./reward-policy');

class RewardLedger {
    constructor(dbAdapter) {
        this.db = dbAdapter;
    }

    /**
     * Compute and record an economy mutation into the reward_ledger table within an active transaction.
     * Enforces daily caps, cooldowns, replay rates, and the monotonic Lifetime XP invariant.
     */
    processRewardMutation(tx, options) {
        const {
            userId,
            eventId,
            eventType,
            contentId = null,
            policyKey = null,
            customReward = null,
            isFirstCompletion = true,
            timeSpentSeconds = null,
            clientTimestamp = null,
            serverTimestamp = new Date().toISOString()
        } = options;

        const todayStart = serverTimestamp.split('T')[0] + 'T00:00:00.000Z';
        const todayDateStr = serverTimestamp.split('T')[0];

        // 1. Get current balance before mutation
        const progressRow = tx.get('SELECT lifetime_xp, coins, level FROM user_progress WHERE user_id = ?', [userId]);
        const balanceXpBefore = progressRow ? progressRow.lifetime_xp : 0;
        const balanceCoinsBefore = progressRow ? progressRow.coins : 0;

        // 2. Resolve Policy
        const policy = policyKey && REWARD_POLICY[policyKey] ? REWARD_POLICY[policyKey] : null;

        let baseReward = customReward;
        if (!baseReward && policy) {
            baseReward = isFirstCompletion ? policy.fullReward : (policy.replayReward || { xp: 0, coins: 0, reason: "Replay" });
        }
        if (!baseReward) {
            baseReward = { xp: 5, coins: 2, reason: "Aktivitas Pembelajaran" };
        }

        let baseExp = Math.max(0, Number(baseReward.xp) || 0);
        let baseCoins = Math.max(0, Number(baseReward.coins) || 0);
        let reason = baseReward.reason || "Penghargaan Belajar";
        let status = isFirstCompletion ? 'APPLIED' : 'REPLAY';

        // 3. Cooldown Check
        if (policy && policy.cooldownMs > 0) {
            const cooldownThreshold = new Date(new Date(serverTimestamp).getTime() - policy.cooldownMs).toISOString();
            const recentEvent = tx.get(`
                SELECT created_at FROM reward_ledger
                WHERE user_id = ? AND event_type = ? AND created_at >= ? AND status != 'REJECTED'
                ORDER BY created_at DESC LIMIT 1
            `, [userId, eventType, cooldownThreshold]);

            if (recentEvent) {
                // Rate limited / on cooldown
                status = 'CAPPED';
                baseExp = 0;
                baseCoins = 0;
                reason = `Cooldown aktif (${Math.round(policy.cooldownMs / 1000)}s)`;
            }
        }

        // 4. Max Daily Runs Check (e.g. Sandbox max 3 runs per day)
        if (policy && policy.maxDailyRuns > 0 && status !== 'CAPPED') {
            const dailyRunsRow = tx.get(`
                SELECT COUNT(*) as count FROM reward_ledger
                WHERE user_id = ? AND event_type = ? AND created_at >= ? AND awarded_xp > 0
            `, [userId, eventType, todayStart]);

            const runsCount = dailyRunsRow?.count || 0;
            if (runsCount >= policy.maxDailyRuns) {
                status = 'CAPPED';
                baseExp = 0;
                baseCoins = 0;
                reason = `Batas reward harian tercapai (${policy.maxDailyRuns}x/hari)`;
            }
        }

        // 5. Daily Cap Check
        if (policy && policy.dailyCap > 0 && baseExp > 0 && status !== 'CAPPED') {
            const dailyTotalXpRow = tx.get(`
                SELECT COALESCE(SUM(awarded_xp), 0) as totalXp FROM reward_ledger
                WHERE user_id = ? AND event_type = ? AND created_at >= ?
            `, [userId, eventType, todayStart]);

            const currentDailyXp = dailyTotalXpRow?.totalXp || 0;
            if (currentDailyXp >= policy.dailyCap) {
                status = 'CAPPED';
                baseExp = 0;
                baseCoins = 0;
                reason = `Batas harian XP tercapai (${policy.dailyCap} XP/hari)`;
            } else if (currentDailyXp + baseExp > policy.dailyCap) {
                const remainingCap = Math.max(0, policy.dailyCap - currentDailyXp);
                baseExp = remainingCap;
                status = 'CAPPED';
                reason = `Sebagian reward disesuaikan dengan batas harian`;
            }
        }

        // 6. One Time Only Hard Rule (e.g. Project completion or step already completed)
        if (policy && policy.oneTimeOnly && !isFirstCompletion) {
            status = 'REPLAY';
            baseExp = 0;
            baseCoins = 0;
            reason = baseReward.reason || "Aktivitas satu kali sudah diselesaikan sebelumnya";
        }

        const awardedXp = Math.max(0, baseExp);
        const awardedCoins = Math.max(0, baseCoins);

        const balanceXpAfter = balanceXpBefore + awardedXp;
        const balanceCoinsAfter = balanceCoinsBefore + awardedCoins;

        // INVARIANT CHECK: Lifetime XP NEVER decreases
        if (balanceXpAfter < balanceXpBefore) {
            throw new Error(`CRITICAL INVARIANT VIOLATION: Lifetime XP cannot decrease (before=${balanceXpBefore}, after=${balanceXpAfter})`);
        }

        // 7. Record to reward_ledger table
        const ledgerId = `led_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        tx.run(`
            INSERT INTO reward_ledger (
                id, user_id, event_id, event_type, content_id, status,
                base_xp, awarded_xp, base_coins, awarded_coins,
                balance_xp_before, balance_xp_after,
                balance_coins_before, balance_coins_after,
                reason, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            ledgerId,
            userId,
            eventId,
            eventType,
            contentId || null,
            status,
            Number(baseReward.xp) || 0,
            awardedXp,
            Number(baseReward.coins) || 0,
            awardedCoins,
            balanceXpBefore,
            balanceXpAfter,
            balanceCoinsBefore,
            balanceCoinsAfter,
            reason,
            serverTimestamp
        ]);

        return {
            ledgerId,
            status,
            awardedXp,
            awardedCoins,
            balanceXpBefore,
            balanceXpAfter,
            balanceCoinsBefore,
            balanceCoinsAfter,
            reason
        };
    }

    /**
     * Record a rejected transaction attempt into the ledger for auditability
     */
    recordRejectedTransaction(tx, userId, eventId, eventType, contentId, reason, serverTimestamp = new Date().toISOString()) {
        const progressRow = tx.get('SELECT lifetime_xp, coins FROM user_progress WHERE user_id = ?', [userId]);
        const xp = progressRow ? progressRow.lifetime_xp : 0;
        const coins = progressRow ? progressRow.coins : 0;

        const ledgerId = `led_rej_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        tx.run(`
            INSERT INTO reward_ledger (
                id, user_id, event_id, event_type, content_id, status,
                base_xp, awarded_xp, base_coins, awarded_coins,
                balance_xp_before, balance_xp_after,
                balance_coins_before, balance_coins_after,
                reason, created_at
            ) VALUES (?, ?, ?, ?, ?, 'REJECTED', 0, 0, 0, 0, ?, ?, ?, ?, ?, ?)
        `, [
            ledgerId,
            userId,
            eventId,
            eventType,
            contentId || null,
            xp,
            xp,
            coins,
            coins,
            reason,
            serverTimestamp
        ]);

        return {
            ledgerId,
            status: 'REJECTED',
            awardedXp: 0,
            awardedCoins: 0,
            reason
        };
    }
}

module.exports = {
    RewardLedger
};
