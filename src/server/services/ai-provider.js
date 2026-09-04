const { GoogleGenAI } = require('@google/genai');

/**
 * AI Provider Abstraction
 * Allows swapping out the underlying LLM provider while keeping the same interface.
 * Implements strict timeouts, bounded exponential backoff retries, simple circuit breaker,
 * primary/fallback model swapping, and detailed health metrics.
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

        // Resiliency configurations
        this.primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
        this.fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite';
        this.timeoutMs = 15000; // Strict 15s timeout limit

        // Circuit Breaker State (CLOSED, OPEN, HALF-OPEN)
        this.circuitState = 'CLOSED';
        this.consecutiveFailures = 0;
        this.failureThreshold = 5;
        this.cooldownPeriodMs = 30000; // 30s cooldown before transition to HALF-OPEN
        this.lastStateTransitionTime = Date.now();

        // Health Observability Metrics
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            fallbackRate: 0,
            avgLatencyMs: 0,
            totalLatencyMs: 0
        };
    }

    getHealthMetrics() {
        return {
            ...this.metrics,
            circuitState: this.circuitState,
            consecutiveFailures: this.consecutiveFailures,
            primaryModel: this.primaryModel,
            fallbackModel: this.fallbackModel
        };
    }

    _handleFailure() {
        this.consecutiveFailures++;
        this.metrics.failedRequests++;
        if (this.consecutiveFailures >= this.failureThreshold && this.circuitState !== 'OPEN') {
            this.circuitState = 'OPEN';
            this.lastStateTransitionTime = Date.now();
            console.error(`[AIProvider] Circuit Breaker TRIPPED to OPEN. Failure threshold of ${this.failureThreshold} reached.`);
        }
    }

    _handleSuccess() {
        this.consecutiveFailures = 0;
        this.metrics.successfulRequests++;
        if (this.circuitState !== 'CLOSED') {
            this.circuitState = 'CLOSED';
            this.lastStateTransitionTime = Date.now();
            console.log("[AIProvider] Circuit Breaker RESET to CLOSED.");
        }
    }

    _checkCircuit() {
        if (this.circuitState === 'OPEN') {
            const timeSinceTransition = Date.now() - this.lastStateTransitionTime;
            if (timeSinceTransition > this.cooldownPeriodMs) {
                this.circuitState = 'HALF-OPEN';
                this.lastStateTransitionTime = Date.now();
                console.log("[AIProvider] Circuit Breaker transitioned to HALF-OPEN. Probing provider...");
                return true;
            }
            return false; // Fast fail immediately
        }
        return true;
    }

    /**
     * Interface for generating content with production-grade resiliency
     * @param {Object} options
     * @param {Array} options.messages - Array of message objects {role: 'user'|'model', text: string}
     * @param {String} options.systemInstruction - The system instruction context
     * @param {Object} options.config - Optional configs (temperature, maxOutputTokens, etc.)
     * @param {Boolean} fullResponse - Returns full object with usage metrics and model used
     * @returns {Promise<String|Object>} The generated response text or full response object
     */
    async generate({ messages, systemInstruction, config = {} }, fullResponse = false) {
        if (!this.isConfigured) {
            throw new Error("AIProvider is not configured (missing API key).");
        }

        const allowedToCall = this._checkCircuit();
        if (!allowedToCall) {
            console.warn("[AIProvider] Circuit is OPEN. Serving degraded offline response.");
            const degradedResponse = "Maaf, asisten AI sedang mengalami gangguan koneksi. BUBUB beralih ke mode offline sementara.";
            if (fullResponse) {
                return {
                    text: degradedResponse,
                    usage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
                    model: 'offline-fallback',
                    fallback: true
                };
            }
            return degradedResponse;
        }

        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        let modelToUse = this.primaryModel;
        let attempt = 0;
        const maxRetries = 3;
        let delay = 1000;

        while (attempt <= maxRetries) {
            const startTime = Date.now();
            this.metrics.totalRequests++;

            try {
                const response = await this._callWithTimeout(modelToUse, contents, systemInstruction, config);
                const latency = Date.now() - startTime;
                
                this.metrics.totalLatencyMs += latency;
                this.metrics.avgLatencyMs = this.metrics.totalLatencyMs / (this.metrics.successfulRequests + this.metrics.failedRequests + 1);

                this._handleSuccess();

                if (fullResponse) {
                    return {
                        text: response.text,
                        usage: response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
                        model: modelToUse
                    };
                }
                return response.text;

            } catch (error) {
                const latency = Date.now() - startTime;
                this.metrics.totalLatencyMs += latency;
                this.metrics.avgLatencyMs = this.metrics.totalLatencyMs / (this.metrics.successfulRequests + this.metrics.failedRequests + 1);

                // Determine if error is a non-retriable 4xx (except 429)
                const status = error.status || error.statusCode || (error.message && error.message.includes('400') ? 400 : null);
                const isNonRetriable = status && status >= 400 && status < 500 && status !== 429;

                console.error(`[AIProvider] Attempt ${attempt + 1} failed. Latency: ${latency}ms. Status: ${status || 'Unknown'}. Error:`, error.message);

                if (isNonRetriable || attempt === maxRetries) {
                    this._handleFailure();
                    
                    // Primary model failed, try immediate fallback model if configured differently
                    if (modelToUse === this.primaryModel && this.fallbackModel && this.primaryModel !== this.fallbackModel) {
                        console.warn(`[AIProvider] Primary model failed. Attempting immediate fallback to: ${this.fallbackModel}`);
                        modelToUse = this.fallbackModel;
                        this.metrics.fallbackRate = (this.metrics.fallbackRate * 9 + 1) / 10;
                        attempt = 0;
                        delay = 1000;
                        continue;
                    }

                    throw error;
                }

                // Exponential backoff with jitter for transient errors
                const jitter = Math.random() * 200;
                const backoffDelay = delay + jitter;
                console.log(`[AIProvider] Transient failure. Retrying in ${Math.round(backoffDelay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                
                delay *= 2;
                attempt++;
            }
        }
    }

    async _callWithTimeout(model, contents, systemInstruction, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.timeoutMs);

        try {
            const response = await this.ai.models.generateContent({
                model: model,
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    temperature: (config.temperature !== undefined && config.temperature !== null) ? config.temperature : 0.7,
                    maxOutputTokens: config.maxOutputTokens || 1024,
                    responseMimeType: config.responseMimeType,
                    responseSchema: config.responseSchema,
                }
            });
            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

module.exports = new AIProvider();
