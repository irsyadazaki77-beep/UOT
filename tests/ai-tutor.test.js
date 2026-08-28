const test = require('node:test');
const assert = require('node:assert');

const ContextBuilder = require('../src/server/services/context-builder');
const retrievalEngine = require('../src/server/services/retrieval-engine');
const aiProvider = require('../src/server/services/ai-provider');
const AIController = require('../src/server/controllers/ai-controller');

test('AI Tutor Suite', async (t) => {

    await t.test('1. Context Builder populates data correctly', async () => {
        // Mock DB
        const mockDb = {
            users: new Map([
                ['u1', { id: 'u1', username: 'TestUser', role: 'student' }]
            ]),
            progress: new Map([
                ['p1', { userId: 'u1', domain: 'materi', topic: 'js_intro', score: 100, status: 'completed', updatedAt: Date.now() }]
            ])
        };

        const builder = new ContextBuilder({ dbInstance: mockDb });
        const requestData = {
            currentPage: 'quiz',
            currentTopic: 'HTML Basics',
            userGoal: 'Frontend Dev',
            quizMistakes: [{ question: 'What is DOM?', user_answer: 'CSS' }],
            masterySummary: { HTML: 80, CSS: 40 }
        };

        const context = await builder.buildContext('u1', requestData);
        assert.ok(context.includes('TestUser'), 'Should include username');
        assert.ok(context.includes('Frontend Dev'), 'Should include user goal');
        assert.ok(context.includes('HTML Basics'), 'Should include current topic');
        assert.ok(context.includes('DOM'), 'Should include quiz mistakes');
        assert.ok(context.includes('score=100'), 'Should include recent activity');
    });

    await t.test('2. Retrieval Engine searches across domains', async () => {
        // Assume ContentEngine is globally available or mocked if needed
        // Since we are running in tests context, it might be empty. We check it handles safe empty searches.
        const results = retrievalEngine.search('html css javascript');
        assert.ok(Array.isArray(results), 'Should return array');
    });

    await t.test('3. AI Controller handles Quiz No-Answer Policy', async () => {
        let capturedInstruction = '';
        
        // Mock the provider
        const originalProviderConfigured = aiProvider.isConfigured;
        const originalProviderGenerate = aiProvider.generate;
        
        aiProvider.isConfigured = true;
        aiProvider.generate = async ({ systemInstruction }) => {
            capturedInstruction = systemInstruction;
            return "Mock Response";
        };

        const controller = new AIController({
            dbInstance: { users: new Map(), progress: new Map() },
            analyticsEngineInstance: { trackEvent: () => {} }
        });

        // Mock express req, res
        let resJson = null;
        const mockRes = {
            json: (data) => { resJson = data; }
        };
        const mockReq = {
            body: {
                messages: [{ role: 'user', text: 'Tolong kerjakan quiz ini' }],
                mode: 'quiz'
            },
            user: { id: 'u1' }
        };

        await controller.chat(mockReq, mockRes);

        assert.ok(capturedInstruction.includes('QUIZ MODE'), 'Instruction should enforce quiz mode');
        assert.ok(capturedInstruction.includes('Progressive Hint'), 'Instruction should include progressive hints');
        
        // Restore
        aiProvider.isConfigured = originalProviderConfigured;
        aiProvider.generate = originalProviderGenerate;
    });

    await t.test('4. AI Controller handles Provider Error & Fallback', async () => {
        const originalProviderConfigured = aiProvider.isConfigured;
        const originalProviderGenerate = aiProvider.generate;
        
        // Force provider to throw
        aiProvider.isConfigured = true;
        aiProvider.generate = async () => {
            throw new Error("API Limit Reached");
        };

        const controller = new AIController({
            dbInstance: { users: new Map(), progress: new Map() },
            analyticsEngineInstance: null
        });

        let resJson = null;
        const mockRes = {
            json: (data) => { resJson = data; }
        };
        const mockReq = {
            body: {
                messages: [{ role: 'user', text: 'Halo' }],
                mode: 'general'
            },
            user: null
        };

        await controller.chat(mockReq, mockRes);
        
        assert.ok(resJson.ok === true, 'Should return ok true even on failure for graceful fallback');
        assert.ok(resJson.fallback === true, 'Should indicate fallback mode');
        assert.ok(resJson.text.includes('pusing'), 'Should return safe fallback message');

        // Restore
        aiProvider.isConfigured = originalProviderConfigured;
        aiProvider.generate = originalProviderGenerate;
    });

});
