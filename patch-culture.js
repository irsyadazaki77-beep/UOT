const fs = require('fs');

let code = fs.readFileSync('public/culture-quiz-lms.js', 'utf8');

const regex = /if\s*\(window\.QuizNationPro\)\s*\{[\s\S]*?window\.QuizNationPro\.recordAttempt\(\{[\s\S]*?\}\);\s*\}/;

const replacement = `if (typeof window !== "undefined" && window.ActivityService && typeof window.ActivityService.recordQuiz === "function") {
                window.ActivityService.recordQuiz(
                    item.id || \`\${item.placeId}-\${item.type}-\${current}\`,
                    isCorrect ? 100 : 0,
                    {
                        category: "culture",
                        topic: item.region || item.placeLabel,
                        difficulty: 2, // medium by default
                        errorType: isCorrect ? "none" : "concept",
                        accuracy: isCorrect ? 100 : 0,
                        answers: [value],
                        skill: "culture_tradition"
                    }
                );
            }
            if (window.QuizNationPro) {
                window.QuizNationPro.recordAttempt({
                    questionId: item.id || \`\${item.placeId}-\${item.type}-\${current}\`,
                    question: item.prompt, topic: item.region || item.placeLabel, difficulty: "medium",
                    source: "quiz-budaya", selected: value, correctAnswer: item.correct, isCorrect,
                    explanation: item.explanation, answers: item.answers
                });
            }`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/culture-quiz-lms.js', code, 'utf8');
