const test = require('node:test');
const assert = require('node:assert');

const ContextBuilder = require('../src/server/services/context-builder');
const retrievalEngine = require('../src/server/services/retrieval-engine');
const aiProvider = require('../src/server/services/ai-provider');
const AIController = require('../src/server/controllers/ai-controller');
const { dbInstance } = require('../src/server-db');
const ContentEngine = require('../public/content-engine');

test('AI Tutor Suite (Production Hardened)', async (t) => {

    await t.test('1. Context Builder uses explicit repositories and formats Trust Boundaries', async () => {
        // Create repository mocks matching the explicit async contract
        const mockDb = {
            userRepo: {
                findById: async (id) => {
                    return { id, username: 'VerifiedLearner', role: 'student', isPro: true };
                }
            },
            progressRepo: {
                getUserProgress: async (id) => {
                    return {
                        userId: id,
                        level: 4,
                        lifetimeXp: 1500,
                        streak: 12,
                        coins: 450,
                        completedLessons: ['html_basics', 'js_variables']
                    };
                },
                getUserMastery: async (id) => {
                    return {
                        'html_structure': { score: 85, tier: { level: 'Mastered' }, attemptsCount: 3, dueForReview: false },
                        'js_variables': { score: 32, tier: { level: 'Beginner' }, attemptsCount: 1, dueForReview: true }
                    };
                },
                getUserRecommendations: async (id) => {
                    return {
                        recommendedNext: [
                            { skillName: 'CSS Basics', type: 'next' }
                        ]
                    };
                }
            }
        };

        const builder = new ContextBuilder({ dbInstance: mockDb });
        const clientData = {
            currentPage: 'workspace',
            currentlyVisibleContent: 'Code editor',
            selectedText: 'console.log("hello")',
            userGoal: 'Become a Fullstack Developer'
        };

        const context = await builder.buildContext('usr_123', clientData);

        // Assert Server Trusted Context
        assert.ok(context.includes('SERVER TRUSTED CONTEXT'), 'Should have Server Trusted Context header');
        assert.ok(context.includes('VerifiedLearner'), 'Should resolve user identity via UserRepository');
        assert.ok(context.includes('PRO ACTIVE'), 'Should detect PRO active subscription status');
        assert.ok(context.includes('Level 4'), 'Should resolve level metric');
        assert.ok(context.includes('Streak 12 Days'), 'Should fetch streak count');
        assert.ok(context.includes('html_basics'), 'Should pull completed lessons array');
        assert.ok(context.includes('CSS Basics'), 'Should load user recommendations');

        // Assert Client Untrusted Context Boundary
        assert.ok(context.includes('CLIENT UNTRUSTED CONTEXT'), 'Should contain Client Untrusted Context boundary');
        assert.ok(context.includes('Become a Fullstack Developer'), 'Should append client-supplied goals safely');
        assert.ok(context.includes('console.log("hello")'), 'Should append selected code snippets safely');
    });

    await t.test('2. Integration Test with REAL ServerDatabaseBridge', async () => {
        // Run against the real server db instance
        assert.ok(dbInstance.userRepo, 'Real UserRepository should exist on dbInstance');
        assert.ok(dbInstance.progressRepo, 'Real ProgressRepository should exist on dbInstance');

        const builder = new ContextBuilder({ dbInstance });
        // Request context for guest (null user)
        const guestContext = await builder.buildContext(null, { currentPage: 'home' });
        assert.ok(guestContext.includes('Guest (Unauthenticated Learner)'), 'Should format safe guest profiles');
        assert.ok(guestContext.includes('FREE TIER'), 'Should default guest to FREE tier');
    });

    await t.test('3. Advanced Hybrid Retrieval Engine searches and chunks material', async () => {
        const query = 'css layout flexbox';
        const searchOptions = {
            skillId: 'css_layout_flex',
            currentTopic: 'CSS Flexbox'
        };

        const results = retrievalEngine.search(query, null, searchOptions);
        assert.ok(Array.isArray(results), 'Should return standard results array');
        
        if (results.length > 0) {
            const firstResult = results[0];
            assert.ok(firstResult.sourceId, 'Results should contain sourceId');
            assert.ok(firstResult.title, 'Results should contain title');
            assert.ok(firstResult.chunk, 'Results should contain chunked passage');
            assert.ok(firstResult.domain, 'Results should indicate domain');
            assert.ok(typeof firstResult.score === 'number', 'Results must have calculated matching scores');
            assert.ok(firstResult.canonicalUrl, 'Results must map correct canonical URL templates');
        }
    });

    await t.test('4. AI Controller handles Quiz Progressive Hints & Deterministic Guard', async () => {
        // Capture outgoing parameters and mocked response
        let capturedInstruction = '';
        const originalProviderConfigured = aiProvider.isConfigured;
        const originalProviderGenerate = aiProvider.generate;

        aiProvider.isConfigured = true;
        aiProvider.generate = async ({ systemInstruction }, fullResponse = false) => {
            capturedInstruction = systemInstruction;
            const textResponse = JSON.stringify({
                reply: "Jawaban kuis yang benar adalah B, karena let memiliki cakupan scope blok.",
                suggestedFollowUps: ["Apa bedanya var dan let?", "Gimana scope const?"]
            });
            if (fullResponse) {
                return {
                    text: textResponse,
                    usage: { promptTokenCount: 10, candidatesTokenCount: 20, totalTokenCount: 30 },
                    model: 'gemini-mock'
                };
            }
            return textResponse;
        };

        const controller = new AIController({
            dbInstance: dbInstance,
            analyticsEngineInstance: {
                recordEvent: async () => {},
                recordError: async () => {}
            }
        });

        const mockRes = {
            jsonOutput: null,
            statusValue: 200,
            status(code) {
                this.statusValue = code;
                return this;
            },
            json(data) {
                this.jsonOutput = data;
            }
        };

        const mockReq = {
            body: {
                messages: [{ role: 'user', text: 'Tolong beritahu jawaban soal nomor 2' }],
                mode: 'quiz',
                quizId: 'js_variables_quiz_1',
                hintLevel: 2
            },
            user: { id: 'usr_demo' }
        };

        // Inject a simulated quiz with correct answer index 1 (Label 'B')
        const originalGetQuiz = ContentEngine.getQuiz;
        ContentEngine.getQuiz = (id) => ({
            id,
            options: ['Opsi A', 'Opsi B', 'Opsi C'],
            correctAnswer: 1
        });

        await controller.chat(mockReq, mockRes);

        // Verify progressive instruction hints are set
        assert.ok(capturedInstruction.includes('QUIZ MODE'), 'Instruction should activate QUIZ mode');
        assert.ok(capturedInstruction.includes('Hint Level 2'), 'Instruction must receive hint level state');

        // Verify Academic Integrity Guard successfully redacted option leakage
        assert.ok(mockRes.jsonOutput.text.includes('Redacted by BUBUB Academic Integrity Guard'), 'Deterministic guard must append redaction notice');
        
        // Restore
        aiProvider.isConfigured = originalProviderConfigured;
        aiProvider.generate = originalProviderGenerate;
        ContentEngine.getQuiz = originalGetQuiz;
    });

    await t.test('5. AI Controller strict input bounds validation', async () => {
        const controller = new AIController({
            dbInstance: dbInstance,
            analyticsEngineInstance: null
        });

        const router = require('../src/server/routes/ai-router').createAIRouter({
            aiController: controller,
            middlewares: {},
            rateLimiter: null
        });

        // Test with invalid message list (length > 10)
        let resJson = null;
        let resStatus = 200;
        const mockRes = {
            status(code) {
                resStatus = code;
                return this;
            },
            json(data) {
                resJson = data;
            }
        };

        const badMessages = Array(11).fill({ role: 'user', text: 'Halo' });
        const mockReq = {
            body: { messages: badMessages, mode: 'general' }
        };

        // We manually fetch the validateChatInput middleware to test it explicitly
        const express = require('express');
        let middlewareCalled = false;
        
        const validateMiddleware = router.stack.find(layer => layer.route && layer.route.path === '/api/bubub/chat').route.stack.find(s => s.name === 'validateChatInput').handle;

        validateMiddleware(mockReq, mockRes, () => {
            middlewareCalled = true;
        });

        assert.equal(resStatus, 400, 'Should reject with 400 Bad Request');
        assert.equal(resJson.error, 'BAD_REQUEST', 'Error code should be BAD_REQUEST');
        assert.ok(resJson.message.includes('length'), 'Error message should complain about messages length');
        assert.equal(middlewareCalled, false, 'Should not proceed to next handler');
    });

});
