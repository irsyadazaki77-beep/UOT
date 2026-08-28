const fs = require('fs');
let code = fs.readFileSync('public/learning-journey.js', 'utf8');

const injection = `
    async function autoCheckMilestones() {
        if (!window.RecommendationService) return;
        try {
            const recs = await window.RecommendationService.getRecommendations();
            if (!recs || !recs.masterySummary) return;
            
            const goal = getGoal();
            let changed = false;
            
            // Just a basic heuristic: if average mastery across related skills is > 75, we can auto-complete some steps.
            const masteryScores = Object.values(recs.masterySummary).map(m => m.score).filter(s => s > 0);
            if (masteryScores.length === 0) return;
            
            const avgMastery = masteryScores.reduce((a, b) => a + b, 0) / masteryScores.length;
            
            // Auto complete steps proportional to overall mastery. (e.g. 80% mastery -> 80% of steps complete)
            const numStepsToUnlock = Math.floor((avgMastery / 100) * goal.steps.length);
            
            for (let i = 0; i < numStepsToUnlock; i++) {
                if (!state.completedSteps.includes(i)) {
                    state.completedSteps.push(i);
                    changed = true;
                }
            }
            if (changed) {
                saveState();
                renderPath();
            }
        } catch (e) {}
    }
`;

code = code.replace(/function renderPath\(\) \{/, injection + '\n    function renderPath() {');

// Inject call into renderAll()
code = code.replace(/populateManualTopics\(\); scheduleReminder\(\);/, 'populateManualTopics(); scheduleReminder(); autoCheckMilestones();');

fs.writeFileSync('public/learning-journey.js', code, 'utf8');
