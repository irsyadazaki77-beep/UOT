"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadCurriculum(initialStorage = {}) {
    const data = new Map(Object.entries(initialStorage));
    const localStorage = {
        getItem(key) { return data.has(key) ? data.get(key) : null; },
        setItem(key, value) { data.set(key, String(value)); },
        removeItem(key) { data.delete(key); }
    };
    const sandbox = {
        window: { dispatchEvent() {} },
        localStorage,
        CustomEvent: class CustomEvent {
            constructor(type, init) { this.type = type; this.detail = init?.detail; }
        },
        console,
        Date,
        Math
    };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync("public/curriculum-data.js", "utf8"), sandbox);
    return { curriculum: sandbox.window.QNCurriculum, localStorage };
}

{
    const { curriculum } = loadCurriculum();
    assert.equal(curriculum.version, 3);
    assert.equal(curriculum.tracks.length, 21);
    const chapters = curriculum.tracks.flatMap((track) => track.chapters);
    assert.equal(chapters.length, 84);
    assert.equal(chapters.reduce((total, chapter) => total + chapter.assessment.questions.length, 0), 840);
    assert.equal(curriculum.validate().length, 0);

    const questionIds = new Set();
    chapters.forEach((chapter) => {
        assert.equal(chapter.assessment.passingScore, 80);
        assert.equal(chapter.assessment.questions.length, 10);
        chapter.assessment.questions.forEach((question) => {
            assert.equal(question.options.length, 4);
            assert.ok(question.correctIndex >= 0 && question.correctIndex < 4);
            assert.ok(question.explanation.length > 20);
            assert.ok(question.lessonId);
            assert.ok(!questionIds.has(question.id));
            questionIds.add(question.id);
        });
    });
}

{
    const legacy = {
        version: 2,
        tracks: {
            programming: {
                lessons: {},
                capstone: {}
            }
        },
        lastTrackId: "programming",
        lastLessonId: "logika-program-input-proses-dan-output"
    };
    const { curriculum } = loadCurriculum({
        quiznationCurriculumProgress: JSON.stringify(legacy)
    });
    const migrated = curriculum.readProgress();
    assert.equal(migrated.version, 3);
    assert.equal(Object.keys(migrated.certificates).length, 0);
    assert.equal(Object.keys(migrated.tracks.programming.chapterAssessments).length, 0);
}

{
    const { curriculum } = loadCurriculum();
    const track = curriculum.getTrack("programming");
    const firstChapter = track.chapters[0];
    const progress = curriculum.readProgress();
    assert.equal(curriculum.getChapterAssessmentState(track.id, firstChapter.id, progress), "locked");

    progress.tracks[track.id] = { lessons: {}, chapterAssessments: {}, capstone: {} };
    firstChapter.lessons.forEach((lesson) => {
        progress.tracks[track.id].lessons[lesson.id] = { status: "completed" };
    });
    assert.equal(curriculum.getChapterAssessmentState(track.id, firstChapter.id, progress), "available");
    progress.tracks[track.id].chapterAssessments[firstChapter.id] = { attempts: 1, bestScore: 70, passed: false };
    assert.equal(curriculum.getChapterAssessmentState(track.id, firstChapter.id, progress), "attempted");
    progress.tracks[track.id].chapterAssessments[firstChapter.id] = { attempts: 2, bestScore: 80, passed: true };
    assert.equal(curriculum.getChapterAssessmentState(track.id, firstChapter.id, progress), "passed");

    track.chapters.forEach((chapter, index) => {
        progress.tracks[track.id].chapterAssessments[chapter.id] = {
            attempts: 1,
            bestScore: 80 + index * 5,
            passed: true
        };
    });
    const eligibility = curriculum.getCertificateEligibility(track.id, progress);
    assert.equal(eligibility.eligible, true);
    assert.equal(eligibility.score, 88);

    const firstCertificate = curriculum.issueCertificate(track.id, "Nadia Papua", progress);
    const secondProgress = curriculum.readProgress();
    const secondCertificate = curriculum.issueCertificate(track.id, "Nadia P. Papua", secondProgress);
    assert.equal(secondCertificate.id, firstCertificate.id);
    assert.equal(secondCertificate.issuedAt, firstCertificate.issuedAt);
    assert.notEqual(secondCertificate.verification, firstCertificate.verification);
}

console.log("OK: 84 kuis bab, 840 soal, migrasi progres, kelulusan, dan sertifikat tervalidasi.");
