# Phase 3: Personalized AI Learning Tutor (BUBUB)

## 1. AI Architecture Diagram
```
[Frontend BUBUB] 
   | (User Message, mode, window context)
   v
[AI Router (Rate Limit & Sanitization)]
   |
   v
[AI Controller (Secure Backend Endpoint)]
   |-- fetches -> [Context Builder (User Mastery, Progress, Goals, Mistakes)]
   |-- fetches -> [Retrieval Engine (RAG: Lessons, Quiz, Books, Projects)]
   v
[AI Provider Abstraction (@google/genai)]
   | (System Instruction + Context + RAG + Mode)
   v
[Gemini 3.7 Flash Model]
   | (Generated Response)
   v
[AI Controller (Response Safety & Logging)]
   |
   v
[Frontend BUBUB (Typing UI, Cancel, Rendering)]
```

## 2. File Baru & Diubah
- **Baru:**
  - `src/server/services/ai-provider.js`: Abstraksi LLM provider (`@google/genai`).
  - `src/server/services/context-builder.js`: Membangun konteks spesifik user berdasarkan database progress.
  - `src/server/services/retrieval-engine.js`: Simple RAG untuk sinkronisasi materi internal (keyword & tags).
  - `src/server/controllers/ai-controller.js`: Endpoint controller untuk logic system instruction, fallback, & safety.
  - `src/server/routes/ai-router.js`: Express router dengan rate-limiting & parameter sanitation.
  - `tests/ai-tutor.test.js`: Suite test baru.
- **Diubah:**
  - `src/server/app.js`: Integrasi routing `ai-router.js`.
  - `public/bubub-ai.js`: Diupgrade dari sinkron (rule-based) menjadi asinkron (`fetch`) dengan typing status & cancel button, sambil mempertahankan fungsi lokal sebagai fallback.
  - `public/bubub-ai.css`: Menambahkan animasi typing & tombol cancel.
  - `package.json`: Menambahkan dependensi `@google/genai` & test baru.

## 3. Retrieval Strategy (RAG)
Saat ini menggunakan **Keyword-Based Search** via `ContentEngine`. Engine memecah prompt user, dan mencari relevansi di seluruh katalog (`materi`, `games`, `snbt`, `culture`, dll). Hasil teratas dilampirkan ke dalam System Prompt sebagai "RELEVANSI KONTEN UOT" agar AI menjawab menggunakan fakta materi lokal, mengurangi halusinasi.

## 4. Context Structure
Sebelum AI menjawab, Context Builder merakit string berisi:
- **User Profile:** Role & Username.
- **Learning Goal & Current Page:** Menyesuaikan fokus (e.g. sedang di halaman quiz budaya).
- **Mastery Summary:** Hasil persentase mastery per skill.
- **Recent Quiz Mistakes:** Kesalahan kuis terakhir, agar AI tahu *blind-spot* user.
- **Recent Activities:** Riwayat belajar terakhir untuk kesinambungan sapaan.

## 5. Fallback Behavior
Jika API Key tidak dikonfigurasi, kuota habis, atau terjadi error jaringan, AI Controller mengembalikan respons `fallback: true`. Frontend secara otomatis beralih memanggil fungsi `buildResponse(text)` bawaan lama (rule/keyword-based) tanpa merusak UX. User tidak akan menyadari adanya downtime infrastruktur (Graceful Degradation).

## 6. Security Controls
- **Tidak ada API Key di Frontend:** API tersembunyi di dalam environment variable backend.
- **Rate Limiting:** Dibatasi maksimal 10 request per menit per IP via `express-rate-limit`.
- **Input Limit & Sanitization:** Maksimal 10 history message per request, dan 1000 karakter per pesan untuk mencegah injection & context-overflow.
- **Cost Control:** `maxOutputTokens` dibatasi pada 800 tokens per jawaban.

## 7. Contoh Personalized Conversation (Socratic & Error Analysis)
**User:** "Kenapa perulangan while ku ini infinite loop ya? \`while(i < 5) { console.log(i); }\`"
**BUBUB (Socratic & Error Analysis Mode):** "Ah, aku lihat kamu sering lupa masalah *loop boundary* dari latihan kuis JS-mu kemarin. Coba perhatikan kodenya, apakah nilai \`i\` pernah bertambah atau berubah di dalam kurung kurawal? Apa yang harus kamu tambahkan agar \`i\` akhirnya bisa mencapai angka 5?"
