const { GoogleGenAI } = require('@google/genai');

/**
 * AI Provider Abstraction
 * Allows swapping out the underlying LLM provider while keeping the same interface.
 */
class AIProvider {
    constructor() {
        // Use Gemini API securely on the server
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({
                apiKey: apiKey,
                httpOptions: {
                    headers: {
                        'User-Agent': 'aistudio-build'
                    }
                }
            });
            this.isConfigured = true;
        } else {
            this.ai = null;
            this.isConfigured = false;
            console.warn("[AIProvider] GEMINI_API_KEY is not configured.");
        }
    }

    /**
     * Interface for generating content
     * @param {Object} options
     * @param {Array} options.messages - Array of message objects {role: 'user'|'model', text: string}
     * @param {String} options.systemInstruction - The system instruction context
     * @param {Object} options.config - Optional configs (temperature, maxOutputTokens, etc.)
     * @returns {Promise<String>} The generated response text
     */
    async generate({ messages, systemInstruction, config = {} }) {
        if (!this.isConfigured) {
            throw new Error("AIProvider is not configured (missing API key).");
        }

        // Gemini uses 'user' and 'model' roles. We need to format the messages properly.
        // For ai.models.generateContent, we can pass a single prompt or multiple parts.
        // Or we can use the Chat API. 
        // Let's format it for generateContent as an array of contents.
        
        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-3.7-flash', // Default to flash for low latency and high quality
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: config.temperature || 0.7,
                    maxOutputTokens: config.maxOutputTokens || 1024,
                    ...config
                }
            });
            
            return response.text;
        } catch (error) {
            console.error("[AIProvider] Error generating content:", error);
            throw error;
        }
    }
}

module.exports = new AIProvider();
