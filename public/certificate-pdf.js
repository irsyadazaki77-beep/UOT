(function () {
    "use strict";

    const WIDTH = 2100;
    const HEIGHT = 1485;
    const PDF_WIDTH = 841.89;
    const PDF_HEIGHT = 595.28;

    function clean(value, fallback = "") {
        return String(value ?? fallback).replace(/\s+/g, " ").trim();
    }

    function safeFilename(value) {
        return clean(value, "sertifikat")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 70) || "sertifikat";
    }

    function roundedRect(ctx, x, y, width, height, radius) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
    }

    function drawPattern(ctx, x, y, scale, color, alpha = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        for (let row = 0; row < 5; row += 1) {
            for (let column = 0; column < 5; column += 1) {
                const px = column * 54 + (row % 2) * 27;
                const py = row * 54;
                ctx.beginPath();
                ctx.moveTo(px, py + 22);
                ctx.lineTo(px + 22, py);
                ctx.lineTo(px + 44, py + 22);
                ctx.lineTo(px + 22, py + 44);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(px + 11, py + 22);
                ctx.lineTo(px + 22, py + 11);
                ctx.lineTo(px + 33, py + 22);
                ctx.lineTo(px + 22, py + 33);
                ctx.closePath();
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    function fitText(ctx, text, maxWidth, startSize, minSize, family, weight = 700) {
        let size = startSize;
        do {
            ctx.font = `${weight} ${size}px ${family}`;
            if (ctx.measureText(text).width <= maxWidth) break;
            size -= 2;
        } while (size > minSize);
        return size;
    }

    function drawTrackedText(ctx, text, x, y, tracking) {
        const chars = [...text];
        const widths = chars.map((char) => ctx.measureText(char).width);
        const total = widths.reduce((sum, width) => sum + width, 0) + tracking * Math.max(0, chars.length - 1);
        let cursor = x - total / 2;
        chars.forEach((char, index) => {
            ctx.fillText(char, cursor, y);
            cursor += widths[index] + tracking;
        });
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });
    }

    function drawSeal(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = "#0b684e";
        ctx.beginPath();
        for (let point = 0; point < 32; point += 1) {
            const angle = (Math.PI * 2 * point) / 32 - Math.PI / 2;
            const radius = point % 2 ? 86 : 101;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            if (point === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#d8af52";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(0, 0, 75, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#f7e8b8";
        ctx.font = "800 29px Manrope, Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("UOT", 0, -12);
        ctx.font = "700 17px Inter, sans-serif";
        ctx.fillText("ACHIEVEMENT", 0, 19);
        ctx.fillText("2026", 0, 44);
        ctx.restore();
    }

    async function buildCanvas(data) {
        await document.fonts?.ready;
        const canvas = document.createElement("canvas");
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        const ctx = canvas.getContext("2d", { alpha: false });

        const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        background.addColorStop(0, "#fbfaf4");
        background.addColorStop(.52, "#ffffff");
        background.addColorStop(1, "#f4f0df");
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = "#063f35";
        ctx.fillRect(0, 0, WIDTH, 105);
        ctx.fillRect(0, HEIGHT - 105, WIDTH, 105);
        ctx.fillStyle = "#d9b55d";
        ctx.fillRect(0, 105, WIDTH, 12);
        ctx.fillRect(0, HEIGHT - 117, WIDTH, 12);

        drawPattern(ctx, -10, 125, 1.1, "#b78928", .22);
        drawPattern(ctx, WIDTH - 320, HEIGHT - 430, 1.1, "#0a6c55", .18);

        ctx.strokeStyle = "#0a6c55";
        ctx.lineWidth = 5;
        roundedRect(ctx, 73, 153, WIDTH - 146, HEIGHT - 306, 18);
        ctx.stroke();
        ctx.strokeStyle = "#d8af52";
        ctx.lineWidth = 2;
        roundedRect(ctx, 94, 174, WIDTH - 188, HEIGHT - 348, 13);
        ctx.stroke();

        ctx.fillStyle = "rgba(10,108,85,.055)";
        ctx.beginPath();
        ctx.arc(WIDTH / 2, HEIGHT / 2 + 80, 430, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(183,137,40,.16)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(WIDTH / 2, HEIGHT / 2 + 80, 360, 0, Math.PI * 2);
        ctx.stroke();

        let logo = null;
        try {
            logo = await loadImage(data.logoUrl || "universe-of-tech-logo.webp");
        } catch {
            logo = null;
        }
        if (logo) {
            const size = 112;
            ctx.save();
            roundedRect(ctx, WIDTH / 2 - size / 2, 190, size, size, 28);
            ctx.clip();
            ctx.drawImage(logo, WIDTH / 2 - size / 2, 190, size, size);
            ctx.restore();
        } else {
            ctx.fillStyle = "#0a6c55";
            roundedRect(ctx, WIDTH / 2 - 56, 190, 112, 112, 28);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.font = "800 43px Manrope, sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("U", WIDTH / 2, 264);
        }

        ctx.textAlign = "center";
        ctx.fillStyle = "#0a5d4a";
        ctx.font = "800 28px Manrope, Inter, sans-serif";
        drawTrackedText(ctx, "UNIVERSE OF TECH", WIDTH / 2, 348, 8);

        ctx.fillStyle = "#9a7122";
        ctx.font = "700 22px Inter, sans-serif";
        drawTrackedText(ctx, "SERTIFIKAT PENGHARGAAN", WIDTH / 2, 407, 7);

        ctx.fillStyle = "#17322c";
        ctx.font = "500 26px Inter, sans-serif";
        ctx.fillText("Dengan bangga diberikan kepada", WIDTH / 2, 486);

        const name = clean(data.recipientName, "Pembelajar Universe Of Tech");
        const nameSize = fitText(ctx, name, 1420, 86, 52, "Manrope, Inter, sans-serif", 800);
        ctx.fillStyle = "#083e34";
        ctx.font = `800 ${nameSize}px Manrope, Inter, sans-serif`;
        ctx.fillText(name, WIDTH / 2, 590);
        const nameWidth = Math.min(ctx.measureText(name).width + 90, 1480);
        const nameLine = ctx.createLinearGradient(WIDTH / 2 - nameWidth / 2, 0, WIDTH / 2 + nameWidth / 2, 0);
        nameLine.addColorStop(0, "rgba(216,175,82,0)");
        nameLine.addColorStop(.18, "#d8af52");
        nameLine.addColorStop(.82, "#d8af52");
        nameLine.addColorStop(1, "rgba(216,175,82,0)");
        ctx.fillStyle = nameLine;
        ctx.fillRect(WIDTH / 2 - nameWidth / 2, 614, nameWidth, 4);

        ctx.fillStyle = "#3d5751";
        ctx.font = "500 27px Inter, sans-serif";
        ctx.fillText("atas keberhasilan menuntaskan seluruh kuis bab pada jalur belajar", WIDTH / 2, 688);

        const track = clean(data.trackTitle, "Jalur Pembelajaran Teknologi");
        const trackSize = fitText(ctx, track, 1450, 64, 43, "Manrope, Inter, sans-serif", 800);
        ctx.fillStyle = "#0a6c55";
        ctx.font = `800 ${trackSize}px Manrope, Inter, sans-serif`;
        ctx.fillText(track, WIDTH / 2, 782);

        const metricY = 856;
        const metricWidth = 270;
        const metricHeight = 104;
        const metrics = [
            ["NILAI AKHIR", `${Math.round(Number(data.score || 0))}%`],
            ["BAB LULUS", `${Number(data.completedChapters || 4)} / ${Number(data.totalChapters || 4)}`],
            ["PREDIKAT", Number(data.score || 0) >= 90 ? "Istimewa" : "Kompeten"]
        ];
        metrics.forEach(([label, value], index) => {
            const x = WIDTH / 2 - (metrics.length * metricWidth + (metrics.length - 1) * 22) / 2 + index * (metricWidth + 22);
            ctx.fillStyle = "rgba(10,108,85,.065)";
            roundedRect(ctx, x, metricY, metricWidth, metricHeight, 18);
            ctx.fill();
            ctx.strokeStyle = "rgba(10,108,85,.18)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = "#647771";
            ctx.font = "700 15px Inter, sans-serif";
            drawTrackedText(ctx, label, x + metricWidth / 2, metricY + 33, 2);
            ctx.fillStyle = "#0a5d4a";
            ctx.font = "800 31px Manrope, Inter, sans-serif";
            ctx.fillText(value, x + metricWidth / 2, metricY + 77);
        });

        const issued = new Date(data.issuedAt || Date.now());
        const issuedText = issued.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
        const footerY = 1120;
        ctx.textAlign = "left";
        ctx.fillStyle = "#6a7773";
        ctx.font = "600 17px Inter, sans-serif";
        ctx.fillText("DITERBITKAN", 275, footerY);
        ctx.fillStyle = "#17322c";
        ctx.font = "700 23px Inter, sans-serif";
        ctx.fillText(issuedText, 275, footerY + 40);
        ctx.fillStyle = "#6a7773";
        ctx.font = "600 16px ui-monospace, Consolas, monospace";
        ctx.fillText(`ID ${clean(data.id, "UOT-LOCAL")}`, 275, footerY + 78);
        ctx.fillText(`VERIFIKASI LOKAL ${clean(data.verification, "LOCAL")}`, 275, footerY + 108);

        drawSeal(ctx, WIDTH / 2, footerY + 40);

        ctx.textAlign = "right";
        ctx.strokeStyle = "#b8923f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(WIDTH - 720, footerY + 58);
        ctx.lineTo(WIDTH - 275, footerY + 58);
        ctx.stroke();
        ctx.fillStyle = "#17322c";
        ctx.font = "800 23px Manrope, Inter, sans-serif";
        ctx.fillText("Universe Of Tech Learning Studio", WIDTH - 275, footerY + 96);
        ctx.fillStyle = "#6a7773";
        ctx.font = "500 17px Inter, sans-serif";
        ctx.fillText("Digital Learning Authority", WIDTH - 275, footerY + 128);

        ctx.textAlign = "center";
        ctx.fillStyle = "#f2dfaa";
        ctx.font = "700 18px Inter, sans-serif";
        drawTrackedText(ctx, "LEARN  BUILD  VERIFY  GROW", WIDTH / 2, HEIGHT - 42, 5);

        return canvas;
    }

    function ascii(value) {
        return new TextEncoder().encode(value);
    }

    function concatBytes(parts) {
        const length = parts.reduce((sum, part) => sum + part.length, 0);
        const output = new Uint8Array(length);
        let offset = 0;
        parts.forEach((part) => {
            output.set(part, offset);
            offset += part.length;
        });
        return output;
    }

    function pdfObject(number, body) {
        const parts = [ascii(`${number} 0 obj\n`)];
        if (body instanceof Uint8Array) parts.push(body);
        else parts.push(ascii(body));
        parts.push(ascii("\nendobj\n"));
        return concatBytes(parts);
    }

    async function canvasToPdfBlob(canvas) {
        const jpegBlob = await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Gagal merender sertifikat.")), "image/jpeg", .94);
        });
        const jpeg = new Uint8Array(await jpegBlob.arrayBuffer());
        const content = ascii(`q\n${PDF_WIDTH} 0 0 ${PDF_HEIGHT} 0 0 cm\n/Im0 Do\nQ`);
        const imageStream = concatBytes([
            ascii(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
            jpeg,
            ascii("\nendstream")
        ]);
        const contentStream = concatBytes([
            ascii(`<< /Length ${content.length} >>\nstream\n`),
            content,
            ascii("\nendstream")
        ]);
        const objects = [
            pdfObject(1, "<< /Type /Catalog /Pages 2 0 R >>"),
            pdfObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
            pdfObject(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`),
            pdfObject(4, imageStream),
            pdfObject(5, contentStream)
        ];
        const header = ascii("%PDF-1.4\n%UOT-CERTIFICATE\n");
        const offsets = [0];
        let cursor = header.length;
        objects.forEach((object) => {
            offsets.push(cursor);
            cursor += object.length;
        });
        const xrefOffset = cursor;
        const xref = [
            "xref",
            "0 6",
            "0000000000 65535 f ",
            ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `),
            "trailer",
            "<< /Size 6 /Root 1 0 R >>",
            "startxref",
            String(xrefOffset),
            "%%EOF"
        ].join("\n");
        return new Blob([header, ...objects, ascii(`${xref}\n`)], { type: "application/pdf" });
    }

    async function renderPreview(data, image) {
        const canvas = await buildCanvas(data);
        if (image) {
            image.src = canvas.toDataURL("image/jpeg", .88);
            image.alt = `Pratinjau sertifikat ${clean(data.trackTitle)} untuk ${clean(data.recipientName)}`;
        }
        return canvas;
    }

    async function createPdfBlob(data) {
        const canvas = await buildCanvas(data);
        return canvasToPdfBlob(canvas);
    }

    async function download(data) {
        const blob = await createPdfBlob(data);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sertifikat-${safeFilename(data.trackTitle)}-${safeFilename(data.recipientName)}.pdf`;
        link.hidden = true;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        return blob;
    }

    window.QNCertificatePDF = { buildCanvas, renderPreview, createPdfBlob, download, safeFilename };
})();
