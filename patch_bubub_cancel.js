const fs = require('fs');
let code = fs.readFileSync('public/bubub-ai.js', 'utf8');

const stopBtnSetup = `
    const stopBtn = createEl("button", "bubub-ai-stop-btn");
    stopBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"></rect></svg>';
    stopBtn.style.display = "none";
    stopBtn.onclick = cancelGeneration;
    state.elements.inputWrapper.appendChild(stopBtn);
`;

// Find where inputWrapper is set up
code = code.replace(/state\.elements\.send = createEl\("button", "bubub-ai-send"\);/, 'state.elements.send = createEl("button", "bubub-ai-send");\\n    ' + stopBtnSetup + '\\n    state.elements.stopBtn = stopBtn;');

code = code.replace(/function showTyping\(\) \{/, 'function showTyping() {\\n        if (state.elements.stopBtn) state.elements.stopBtn.style.display = "flex";\\n        if (state.elements.send) state.elements.send.style.display = "none";');
code = code.replace(/function removeTyping\(\) \{/, 'function removeTyping() {\\n        if (state.elements.stopBtn) state.elements.stopBtn.style.display = "none";\\n        if (state.elements.send) state.elements.send.style.display = "flex";');

fs.writeFileSync('public/bubub-ai.js', code);
