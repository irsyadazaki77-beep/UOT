class ContextBuilder {
    constructor({ dbInstance }) {
        this.db = dbInstance;
    }

    async buildContext(userId, requestData) {
        let userProfile = null;
        let progress = [];
        if (userId) {
            userProfile = this.db.users.get(userId);
            // Get user's progress summary if available
            // Assuming we can fetch it or just get recent history
            const allProgress = Array.from(this.db.progress.values()).filter(p => p.userId === userId);
            progress = allProgress.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10);
        }

        const {
            currentPage,
            currentTopic,
            userGoal,
            quizMistakes,
            weakSkills,
            strongSkills,
            masterySummary
        } = requestData;

        let contextChunks = [];

        contextChunks.push(`USER PROFILE: ${userProfile ? userProfile.username : 'Guest'} (${userProfile?.role || 'student'})`);
        
        if (userGoal) {
            contextChunks.push(`LEARNING GOAL: ${userGoal}`);
        }

        if (currentPage) {
            contextChunks.push(`CURRENT PAGE/CONTEXT: ${currentPage}`);
        }
        if (currentTopic) {
            contextChunks.push(`CURRENT TOPIC/LESSON: ${currentTopic}`);
        }

        if (masterySummary) {
            contextChunks.push(`MASTERY SUMMARY: ${JSON.stringify(masterySummary)}`);
        } else if (weakSkills && strongSkills) {
            contextChunks.push(`STRONG SKILLS: ${strongSkills.join(', ')}`);
            contextChunks.push(`WEAK SKILLS: ${weakSkills.join(', ')}`);
        }

        if (quizMistakes && quizMistakes.length > 0) {
            contextChunks.push(`RECENT QUIZ MISTAKES: ${JSON.stringify(quizMistakes)}`);
        }

        if (progress.length > 0) {
            const recentActivity = progress.map(p => `${p.domain} (${p.topic}): score=${p.score || 0}, status=${p.status}`).join(' | ');
            contextChunks.push(`RECENT ACTIVITIES: ${recentActivity}`);
        }

        return contextChunks.join('\n');
    }
}

module.exports = ContextBuilder;
