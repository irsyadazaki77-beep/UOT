const fs = require('fs');

let code = fs.readFileSync('public/snbt-dashboard.js', 'utf8');

const submitRegex = /saveState\(\);\s*renderAnswers\(\);/;

const submitReplacement = `saveState();
        if (typeof window !== "undefined" && window.ActivityService && typeof window.ActivityService.recordQuiz === "function") {
            try {
                // Determine Error Type for TKA/SNBT
                let errorType = "none";
                if (!correct) {
                    if (fromTimeout) errorType = "time pressure";
                    else if (currentQuestion.difficulty === "hots") errorType = "concept"; // Often logic/concept error on HOTS
                    else errorType = "careless";
                }
                
                // Map SNBT subject to Activity category/topic
                const isTka = currentQuestion.track === "tka";
                const cat = isTka ? "tka" : "snbt";
                
                window.ActivityService.recordQuiz(
                    currentQuestion.id,
                    correct ? 100 : 0,
                    {
                        category: cat,
                        topic: currentQuestion.topic,
                        difficulty: currentQuestion.difficulty,
                        errorType: errorType,
                        accuracy: correct ? 100 : 0
                    }
                );
            } catch (err) {
                console.warn("ActivityService record error in SNBT:", err);
            }
        }
        renderAnswers();`;

code = code.replace(submitRegex, submitReplacement);
fs.writeFileSync('public/snbt-dashboard.js', code, 'utf8');
