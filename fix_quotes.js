const fs = require('fs');
let code = fs.readFileSync('public/bubub-ai.js', 'utf8');

// The error is because of unescaped newlines inside double quotes.
// A hacky way is to match `text: "..."` that spans multiple lines and change to backticks, 
// or simply replace the newlines inside double quoted strings.
// But we know it's only in `findKnowledge` array and a few other places.
// Let's replace actual newlines that are inside double quotes.
let inQuote = false;
let result = "";
for (let i = 0; i < code.length; i++) {
    if (code[i] === '"' && code[i-1] !== '\\') {
        inQuote = !inQuote;
        result += code[i];
    } else if (code[i] === '\n' && inQuote) {
        result += '\\n';
    } else {
        result += code[i];
    }
}
fs.writeFileSync('public/bubub-ai.js', result);
