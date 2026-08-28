const aiProvider = require('../services/ai-provider');
const ContextBuilder = require('../services/context-builder');
const retrievalEngine = require('../services/retrieval-engine');

class AIController {
    constructor({ dbInstance, analyticsEngineInstance }) {
        this.contextBuilder = new ContextBuilder({ dbInstance });
        this.analytics = analyticsEngineInstance;
    }

    async chat(req, res) {
        try {
            const { messages, contextData, mode = 'general' } = req.body;
            const userId = req.user ? req.user.id : null;

            if (!messages || !Array.isArray(messages)) {
                return res.status(400).json({ ok: false, error: 'Messages are required.' });
            }

            // Fallback checking
            if (!aiProvider.isConfigured) {
                return res.json({
                    ok: true,
                    fallback: true,
                    text: "Maaf, BUBUB sedang offline saat ini. Silakan gunakan panduan belajar biasa ya!"
                });
            }

            // 1. Build Context
            const builtContext = await this.contextBuilder.buildContext(userId, contextData || {});

            // 2. Retrieval (RAG)
            const lastMessage = messages[messages.length - 1].text;
            const searchResults = retrievalEngine.search(lastMessage, contextData?.domain);
            let ragContext = '';
            if (searchResults.length > 0) {
                ragContext = `\nRELEVANSI KONTEN UOT:\n` + searchResults.map(r => `- [${r.domain}] ${r.title}: ${r.description}`).join('\n');
            }

            // 3. Determine Persona / System Instruction
            let systemInstruction = `Kamu adalah BUBUB, Personal AI Learning Tutor di platform Universe of Tech (UOT).
Peranmu adalah membimbing user belajar, bukan sekadar memberikan jawaban langsung.
Sesuaikan gaya bahasamu dengan tingkat keahlian user (Beginner: sederhana & step-by-step. Intermediate: teknis & menantang. Advanced: ringkas & konseptual).
Gunakan bahasa Indonesia yang ramah, asik, dan edukatif.

KONTEKS USER SAAT INI:
${builtContext}
${ragContext}
`;

            if (mode === 'quiz') {
                systemInstruction += `\nMODE: QUIZ MODE.
PENTING: Jangan memberikan jawaban akhir dari pertanyaan kuis.
Berikan Progressive Hint:
- Hint 1: Jelaskan konsep yang relevan.
- Hint 2: Beri arahan cara berpikir (reasoning).
- Hint 3: Bantu eliminasi opsi yang salah.
Jika user sudah menjawab dan membahas hasilnya, baru berikan pembahasan tuntas.`;
            } else if (mode === 'socratic') {
                systemInstruction += `\nMODE: SOCRATIC MODE.
Bimbing user menemukan jawaban sendiri menggunakan pertanyaan.
Jangan langsung beri solusi kode/matematika. Tanyakan logika mereka atau hasil dari suatu langkah.`;
            } else if (mode === 'error_analysis') {
                systemInstruction += `\nMODE: ERROR ANALYSIS.
Analisis kesalahan user. Beri tahu pola kesalahannya, berikan mini review singkat, dan rekomendasikan materi/latihan UOT yang relevan.`;
            }

            // 4. Generate Response
            const replyText = await aiProvider.generate({
                messages,
                systemInstruction,
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 800 // Cost Control
                }
            });

            // Log interactions for observability
            if (this.analytics) {
                this.analytics.trackEvent('AI_CHAT_INTERACTION', { userId, mode, promptLength: lastMessage.length });
            }

            return res.json({
                ok: true,
                text: replyText,
                suggestedFollowUps: this.generateFollowUps(replyText),
                sourceLinks: searchResults.slice(0,2) // Send top 2 as recommendations
            });

        } catch (error) {
            console.error('[AIController] Chat error:', error);
            // Fallback response on error
            return res.json({
                ok: true,
                fallback: true,
                text: "Waduh, BUBUB lagi pusing mikir nih. Coba tanya lagi nanti ya, atau cek materi kita di library!"
            });
        }
    }

    generateFollowUps(text) {
        // Dummy logic to return context-aware follow ups. 
        // In reality, this could be prompted to the LLM to output JSON, 
        // but to save tokens, we fallback to static/rule-based for now.
        if (text.toLowerCase().includes('html')) return ['Apa itu DOM?', 'Contoh tag semantic HTML?'];
        if (text.toLowerCase().includes('javascript')) return ['Gimana cara kerja event loop?', 'Bedanya let dan const?'];
        return ['Jelaskan lebih detail', 'Beri contoh kasusnya'];
    }
}

module.exports = AIController;
