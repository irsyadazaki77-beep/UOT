const fs = require('fs');
let code = fs.readFileSync('public/reader-studio.js', 'utf8');

const regex = /storage\.set\("library_read_activity", activity\.slice\(-120\)\);/;
const replacement = `storage.set("library_read_activity", activity.slice(-120));
        
        if (typeof window !== "undefined" && window.ActivityService && typeof window.ActivityService.recordLesson === "function") {
            try {
                window.ActivityService.recordLesson(bookId, {
                    topic: book.title,
                    category: "reading",
                    chapter: chapterIndex,
                    progress: entry.progress,
                    duration: Math.max(1, Math.round(estimateMinutes(book.chapters[chapterIndex].content) * chapterProgress))
                });
            } catch (err) {}
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('public/reader-studio.js', code, 'utf8');
