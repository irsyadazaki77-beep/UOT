const fs = require('fs');
let code = fs.readFileSync('public/bubub-ai.js', 'utf8');

const typingHtml = `
    let typingElement = null;
    let abortController = null;

    function showTyping() {
        if (typingElement) return;
        typingElement = createEl("div", "bubub-ai-message assistant typing");
        typingElement.innerHTML = "<span class='dot'></span><span class='dot'></span><span class='dot'></span>";
        state.elements.messages.appendChild(typingElement);
        state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
    }

    function removeTyping() {
        if (typingElement && typingElement.parentNode) {
            typingElement.parentNode.removeChild(typingElement);
        }
        typingElement = null;
    }

    function cancelGeneration() {
        if (abortController) {
            abortController.abort();
            abortController = null;
            removeTyping();
            appendMessage("assistant", "Oke, aku berhenti mikir. Ada yang lain yang mau ditanyakan?");
        }
    }
`;

const newSendMessage = `
    async function sendMessage(raw) {
        const text = String(raw || state.elements.input.value || "").trim();
        if (!text) return;
        
        state.elements.input.value = "";
        appendMessage("user", text);
        safePlay("click");
        
        showTyping();
        
        // Prepare context data
        const contextData = {
            currentPage: state.page,
            currentTopic: window.UOT_CURRENT_TOPIC || document.title,
            quizMistakes: window.UOT_QUIZ_MISTAKES || [],
            userGoal: window.UOT_USER_GOAL || ''
        };

        let mode = 'general';
        if (state.page.includes('quiz') || state.page.includes('snbt')) {
            mode = 'quiz';
        }
        if (text.toLowerCase().includes('kenapa salah') || text.toLowerCase().includes('error')) {
            mode = 'error_analysis';
        }

        // Format history for LLM
        const messages = state.history.map(m => ({ role: m.sender, text: m.text }));
        
        // Add current message since it was just appended to state.history
        
        abortController = new AbortController();

        try {
            const response = await fetch('/api/bubub/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages,
                    contextData,
                    mode
                }),
                signal: abortController.signal
            });
            
            const data = await response.json();
            removeTyping();
            
            if (data.ok && !data.fallback) {
                let reply = data.text;
                if (data.sourceLinks && data.sourceLinks.length > 0) {
                    reply += "\\n\\n**Sumber Belajar:**\\n" + data.sourceLinks.map(l => "- [" + l.title + "](/" + l.domain + ".html)").join("\\n");
                }
                appendMessage("assistant", reply);
                
                if (data.suggestedFollowUps && data.suggestedFollowUps.length > 0) {
                    renderChips(data.suggestedFollowUps);
                }
                safePlay("success");
            } else {
                // Fallback
                appendMessage("assistant", buildResponse(text));
                safePlay("success");
            }
        } catch (err) {
            removeTyping();
            if (err.name === 'AbortError') return;
            console.error('BUBUB Chat Error:', err);
            appendMessage("assistant", buildResponse(text));
            safePlay("success");
        } finally {
            abortController = null;
        }
    }
`;

code = code.replace(/function sendMessage\([\s\S]*?function setOpen/m, typingHtml + '\\n' + newSendMessage + '\\n    function setOpen');
fs.writeFileSync('public/bubub-ai.js', code);
