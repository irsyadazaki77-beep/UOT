const fs = require('fs');

let code = fs.readFileSync('public/projects.js', 'utf8');

const regex = /window\.ActivityService\.recordProject\(project\.id, \{[\s\S]*?\}, \{ showModal: true \}\);/;
const replacement = `window.ActivityService.recordProject(project.id, {
                        title: project.title,
                        xp: project.xp || 100,
                        coins: Math.round((project.xp || 100) / 2),
                        category: project.category || "programming",
                        topic: (project.skills || [])[0] || "general",
                        skill: \`\${project.category}_\${(project.skills || [])[0]}\`.toLowerCase().replace(/\\s+/g, '_'),
                        accuracy: 100 // completed project counts as 100% accuracy for the target skill
                    }, { showModal: true });`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/projects.js', code, 'utf8');
