(() => {
    "use strict";

    const normalize = value => String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("id-ID")
        .trim();

    function searchableText(project) {
        return [
            project.title,
            project.summary,
            project.outcome,
            project.level,
            project.category,
            ...(project.skills || [])
        ].map(normalize).join(" ");
    }

    function selectProjects(projects, options = {}) {
        const query = normalize(options.query);
        const category = options.category || "all";
        const status = options.status || "all";
        const recordFor = options.recordFor || (() => ({ status: "not_started" }));
        const sort = options.sort || "recommended";

        const selected = projects.filter(project => {
            const record = recordFor(project.id);
            const categoryMatch = category === "all" || project.category === category;
            const statusMatch = status === "all" || record.status === status;
            const queryMatch = !query || searchableText(project).includes(query);
            return categoryMatch && statusMatch && queryMatch;
        });

        return selected.sort((a, b) => {
            if (sort === "xp-desc") return b.xp - a.xp;
            if (sort === "time-asc") return parseInt(a.time, 10) - parseInt(b.time, 10);
            if (sort === "title") return a.title.localeCompare(b.title, "id");
            if (sort === "progress") {
                const score = project => {
                    const record = recordFor(project.id);
                    if (record.status === "completed") return 2;
                    if (record.status === "in_progress") return 1;
                    return 0;
                };
                return score(b) - score(a);
            }
            return projects.indexOf(a) - projects.indexOf(b);
        });
    }

    function downloadProject(project, files) {
        const isMarkdown = project.editorType === "markdown";
        const content = isMarkdown
            ? files.markdown || ""
            : `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${project.title}</title>
  <style>${files.css || ""}</style>
</head>
<body>
${files.html || ""}
<script>${files.js || ""}<\/script>
</body>
</html>`;
        const blob = new Blob([content], { type: isMarkdown ? "text/markdown" : "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = isMarkdown ? "README.md" : `${project.id}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    window.ProjectFeatures = Object.freeze({
        selectProjects,
        downloadProject
    });
})();
