const ContentEngine = require('./content-engine');
const assert = require('assert');

console.log("=== RUNNING CONTENT ENGINE & MANAGEMENT TESTS (FASE 13) ===");

// 1. Quiz Validation Test
console.log("\n[Test 1] Testing Quiz Schema Validation...");
const validQuiz = {
    id: "q-test-01",
    question: "Apa fungsi console.log dalam JavaScript?",
    options: ["Menampilkan output ke konsol", "Menghapus browser", "Menyimpan ke database", "Membuat server"],
    correctAnswer: 0,
    skills: ["javascript", "debugging"],
    difficulty: "easy"
};
const valQuizRes = ContentEngine.validateQuiz(validQuiz);
assert.strictEqual(valQuizRes.valid, true, "Valid quiz must pass validation");

const invalidQuizAnswer = {
    id: "q-test-02",
    question: "Soal tanpa jawaban",
    options: ["A", "B", "C"],
    correctAnswer: 5, // Out of bounds
    skills: ["test"]
};
const valQuizErrRes = ContentEngine.validateQuiz(invalidQuizAnswer);
assert.strictEqual(valQuizErrRes.valid, false, "Quiz with out-of-bounds answer must fail");
assert.ok(valQuizErrRes.errors.some(e => e.includes("di luar jangkauan")), "Should report out of bounds error");

const dupOptionsQuiz = {
    id: "q-test-03",
    question: "Soal opsi duplikat",
    options: ["Sama", "Sama", "Beda 1", "Beda 2"],
    correctAnswer: 0,
    skills: ["test"]
};
const valDupRes = ContentEngine.validateQuiz(dupOptionsQuiz);
assert.strictEqual(valDupRes.valid, false, "Quiz with duplicate options must fail");
assert.ok(valDupRes.errors.some(e => e.includes("duplicate option")), "Should report duplicate options error");

console.log("✔ Quiz schema validation passed!");

// 2. Lesson Validation Test
console.log("\n[Test 2] Testing Lesson Schema Validation...");
const validLesson = {
    id: "l-test-01",
    title: "Pengenalan Variables",
    skills: ["javascript"],
    difficulty: 1
};
assert.strictEqual(ContentEngine.validateLesson(validLesson).valid, true, "Valid lesson must pass");

const invalidLesson = {
    id: "l-test-02",
    title: "", // Empty title
    skills: []
};
assert.strictEqual(ContentEngine.validateLesson(invalidLesson).valid, false, "Lesson with empty title must fail");

console.log("✔ Lesson schema validation passed!");

// 3. Fallback Error State Test
console.log("\n[Test 3] Testing Fallback Error Isolation...");
const fallbackQuiz = ContentEngine.getQuiz("non-existent-quiz-id");
assert.strictEqual(fallbackQuiz.isFallback, true, "Missing quiz must return fallback state");
assert.strictEqual(fallbackQuiz.id, "non-existent-quiz-id", "Fallback quiz must preserve requested ID");

const fallbackLesson = ContentEngine.getLesson("non-existent-lesson-id");
assert.strictEqual(fallbackLesson.isFallback, true, "Missing lesson must return fallback state");
assert.ok(fallbackLesson.title.length > 0, "Fallback lesson must have title");

console.log("✔ Fallback error isolation passed!");

// 4. Content Registration & Diagnostics Test
console.log("\n[Test 4] Testing Registry & Diagnostic Audit...");
ContentEngine.registerContent("lessons", [
    { id: "les-01", title: "Lesson 1", skills: ["js"], prerequisites: [] },
    { id: "les-02", title: "Lesson 2", skills: ["js"], prerequisites: ["les-missing-99"] } // Invalid prereq
]);

const auditReport = ContentEngine.validateAll();
assert.strictEqual(auditReport.valid, false, "Audit must fail when invalid prereq exists");
assert.ok(auditReport.invalidPrerequisites.some(p => p.prereqId === "les-missing-99"), "Should detect missing prereq ID les-missing-99");

console.log("✔ Diagnostic audit passed!");

// 5. Import / Export Roundtrip Test
console.log("\n[Test 5] Testing Import / Export Roundtrip...");
ContentEngine.registerContent("quizzes", [validQuiz]);

const exportedBundle = ContentEngine.exportAll();
assert.ok(Array.isArray(exportedBundle.quizzes), "Exported bundle must contain quizzes array");

const importResult = ContentEngine.importBundle(exportedBundle);
assert.strictEqual(importResult.success, true, "Bundle import must succeed");
assert.ok(importResult.importedCount > 0, "Imported count must be > 0");

console.log("✔ Import/Export roundtrip passed!");

console.log("\n=== ALL CONTENT ENGINE TESTS PASSED SUCCESSFULLY! ===");
