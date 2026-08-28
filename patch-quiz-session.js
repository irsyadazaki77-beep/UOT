const fs = require('fs');
let code = fs.readFileSync('public/quiz-session.js', 'utf8');

const regex = /if\s*\(typeof window !== "undefined" && window\.ProgressionEngine && typeof window\.ProgressionEngine\.recordActivity === "function"\)\s*\{[\s\S]*?\} catch \(err\) \{[\s\S]*?\}[\s\S]*?\}/;

const replacement = `if (typeof window !== "undefined" && window.ActivityService && typeof window.ActivityService.recordQuiz === "function") {
            try {
                // Determine errors
                const conceptErrors = state.history.filter(h => !h.isCorrect && h.isConcept).length;
                let errorType = "none";
                if (state.history.some(h => !h.isCorrect)) {
                    errorType = conceptErrors > 0 ? "concept" : "careless";
                }

                window.ActivityService.recordQuiz(
                    session.sessionId || \`quiz_\${Date.now()}\`,
                    score,
                    {
                        category: state.payload?.config?.category || "programming",
                        topic: state.payload?.config?.topic || "general",
                        answers: state.history,
                        hintCount: state.helpUsed,
                        completionTimeSeconds: Math.round((Date.now() - state.timeStart) / 1000),
                        errorType: errorType,
                        accuracy: (state.correct / state.totalQuestions) * 100
                    }
                );
            } catch (err) {
                console.warn("[QuizSession] ActivityService record error:", err);
            }
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/quiz-session.js', code, 'utf8');
