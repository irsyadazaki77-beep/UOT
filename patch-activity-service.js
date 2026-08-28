const fs = require('fs');

let code = fs.readFileSync('public/activity-service.js', 'utf8');
const replacement = `                    progressionFeedback = progressionEngine.recordActivity(activityType, {
                        ...options,
                        ...payload,
                        count: payload.count || 1,
                        xp: options.xp !== undefined ? options.xp : payload.xp,
                        coins: options.coins !== undefined ? options.coins : payload.coins,
                        rewardId: options.rewardId || payload.rewardId || \`\${activityType}:\${activityId}\`,
                        title: options.title || payload.title,
                        reason: options.reason || payload.reason,
                        showModal: options.showModal ?? false,
                        showSummary: options.showSummary ?? false
                    });`;

code = code.replace(/progressionFeedback = progressionEngine\.recordActivity\(activityType, \{[\s\S]*?showSummary: options\.showSummary \?\? false\n                    \}\);/, replacement);
fs.writeFileSync('public/activity-service.js', code, 'utf8');
