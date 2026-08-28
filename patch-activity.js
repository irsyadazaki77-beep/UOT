const fs = require('fs');

let code = fs.readFileSync('public/activity-service.js', 'utf8');

// Replace recordQuiz payload enrichment
const recordQuizRegex = /recordQuiz\(quizId,\s*score,\s*payload\s*=\s*\{\},\s*options\s*=\s*\{\}\)\s*\{([\s\S]*?)return processPipeline\(/;

const recordQuizReplacement = `recordQuiz(quizId, score, payload = {}, options = {}) {
            const meta = (typeof window !== "undefined" && window.AdaptiveLearningEngine && typeof window.AdaptiveLearningEngine.getActivityMetadata === "function")
                ? window.AdaptiveLearningEngine.getActivityMetadata(quizId)
                : {};
            const enrichedPayload = {
                quizId,
                score: Number(score) || 0,
                accuracy: payload.accuracy !== undefined ? payload.accuracy : (Number(score) || 0),
                skill: payload.skill || meta.skill || "js_variables",
                topic: payload.topic || meta.topic || quizId,
                category: payload.category || meta.domain || "programming",
                difficulty: Number(payload.difficulty || meta.difficulty || 1),
                answers: payload.answers || [],
                hintCount: payload.hintCount !== undefined ? payload.hintCount : (payload.usedHint ? 1 : 0),
                usedHint: Boolean(payload.usedHint || payload.hintCount > 0),
                completionTimeSeconds: Number(payload.completionTimeSeconds || payload.timeSpentSeconds || payload.duration || 0),
                errorType: payload.errorType || "none", // concept, careless, calculation, guessing, reading
                ...payload
            };
            if (typeof window !== "undefined" && window.RecommendationService && typeof window.RecommendationService.invalidateCache === "function") {
                window.RecommendationService.invalidateCache();
            }
            return processPipeline(`;

code = code.replace(recordQuizRegex, recordQuizReplacement);

// Replace recordLesson payload enrichment
const recordLessonRegex = /recordLesson\(lessonId,\s*payload\s*=\s*\{\},\s*options\s*=\s*\{\}\)\s*\{([\s\S]*?)return processPipeline\("lesson_complete",\s*\{\s*lessonId,\s*\.\.\.payload\s*\},/;

const recordLessonReplacement = `recordLesson(lessonId, payload = {}, options = {}) {
            const meta = (typeof window !== "undefined" && window.AdaptiveLearningEngine && typeof window.AdaptiveLearningEngine.getActivityMetadata === "function")
                ? window.AdaptiveLearningEngine.getActivityMetadata(lessonId)
                : {};
            const enrichedPayload = {
                lessonId,
                skill: payload.skill || meta.skill,
                topic: payload.topic || meta.topic || lessonId,
                category: payload.category || meta.domain,
                duration: payload.duration || 0,
                ...payload
            };
            return processPipeline("lesson_complete", enrichedPayload,`;

code = code.replace(recordLessonRegex, recordLessonReplacement);

// Do the same for recordProject
const recordProjectRegex = /recordProject\(projectId,\s*payload\s*=\s*\{\},\s*options\s*=\s*\{\}\)\s*\{([\s\S]*?)return processPipeline\("project_complete",\s*\{\s*projectId,\s*\.\.\.payload\s*\},/;
const recordProjectReplacement = `recordProject(projectId, payload = {}, options = {}) {
            const meta = (typeof window !== "undefined" && window.AdaptiveLearningEngine && typeof window.AdaptiveLearningEngine.getActivityMetadata === "function")
                ? window.AdaptiveLearningEngine.getActivityMetadata(projectId)
                : {};
            const enrichedPayload = {
                projectId,
                skill: payload.skill || meta.skill,
                topic: payload.topic || meta.topic || projectId,
                category: payload.category || meta.domain,
                duration: payload.duration || 0,
                ...payload
            };
            return processPipeline("project_complete", enrichedPayload,`;

code = code.replace(recordProjectRegex, recordProjectReplacement);


// And for recordGame
const recordGameRegex = /recordGame\(gameId,\s*score,\s*payload\s*=\s*\{\},\s*options\s*=\s*\{\}\)\s*\{([\s\S]*?)return processPipeline\("game_complete",\s*\{\s*gameId,\s*score,\s*\.\.\.payload\s*\},/;
const recordGameReplacement = `recordGame(gameId, score, payload = {}, options = {}) {
            const meta = (typeof window !== "undefined" && window.AdaptiveLearningEngine && typeof window.AdaptiveLearningEngine.getActivityMetadata === "function")
                ? window.AdaptiveLearningEngine.getActivityMetadata(gameId)
                : {};
            const enrichedPayload = {
                gameId,
                score,
                skill: payload.skill || meta.skill,
                topic: payload.topic || meta.topic || gameId,
                category: payload.category || meta.domain,
                duration: payload.duration || 0,
                ...payload
            };
            return processPipeline("game_complete", enrichedPayload,`;

code = code.replace(recordGameRegex, recordGameReplacement);


fs.writeFileSync('public/activity-service.js', code, 'utf8');
