import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getTrainingContent } from "../api/userApi";

// ── Converts raw markdown quiz text into structured question objects ──────────
function parseQuizMarkdown(text) {
  if (!text) return [];
  const questions = [];
  // Split on --- or **MCQ N** boundaries
  const blocks = text.split(/---|\*\*MCQ\s*\d+\*\*/i).map((b) => b.trim()).filter(Boolean);
  blocks.forEach((block, idx) => {
    // Extract question text (before first A) option)
    const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;

    // First line(s) before options = question
    const optionRegex = /^[A-D]\)/i;
    const firstOptIdx = lines.findIndex((l) => optionRegex.test(l));
    const questionText = firstOptIdx > 0
      ? lines.slice(0, firstOptIdx).join(" ")
      : lines[0];

    const options = firstOptIdx >= 0
      ? lines.slice(firstOptIdx).filter((l) => optionRegex.test(l))
      : [];

    if (questionText) {
      questions.push({ id: idx + 1, question: questionText, options });
    }
  });
  return questions;
}

// ── Converts a YouTube URL to embeddable format ───────────────────────────────
function toEmbedUrl(url) {
  if (!url) return null;
  // youtube.com/watch?v=ID  →  youtube.com/embed/ID
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // already an embed or direct mp4
  return url;
}

export default function TrainingPage() {
  const [training, setTraining] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const id = "training-prose-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = `
        .prose-training h1,.prose-training h2,.prose-training h3{font-weight:700;margin:1rem 0 .5rem;color:#1e293b}
        .prose-training h1{font-size:1.4rem}.prose-training h2{font-size:1.2rem}.prose-training h3{font-size:1rem;color:#dc2626}
        .prose-training p{margin:.4rem 0;line-height:1.7}
        .prose-training ul,.prose-training ol{margin:.5rem 0 .5rem 1.25rem}
        .prose-training li{margin:.2rem 0}
        .prose-training strong{font-weight:700}
        .prose-training a{color:#2563eb;text-decoration:underline}
        .prose-training table{width:100%;border-collapse:collapse;margin:.5rem 0}
        .prose-training th,.prose-training td{border:1px solid #cbd5e1;padding:.4rem .6rem;text-align:left}
        .prose-training th{background:#f1f5f9}
      `;
      document.head.appendChild(tag);
    }
    fetchTraining();
  }, []);

  const fetchTraining = async () => {
    try {
      const res = await getTrainingContent();
      if (Array.isArray(res.data)) setTraining(res.data);
      else if (Array.isArray(res.data?.data)) setTraining(res.data.data);
      else setTraining([]);
    } catch (err) {
      console.error("Training fetch error:", err);
      setTraining([]);
    }
  };

  const handleSelect = (item) => {
    setSelected(item);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return `http://localhost:8000${path}`;
    return `http://localhost:8000/admin/files/${encodeURIComponent(path)}`;
  };

  const contentTypeIcon = (type) => {
    switch (type) {
      case "pdf":     return "📄";
      case "video":   return "🎬";
      case "article": return "📰";
      case "quiz":    return "📝";
      default:        return "📌";
    }
  };

  return (
    <MainLayout>
      <div className="flex gap-6 h-[calc(100vh-120px)]">

        {/* ── LEFT PANEL ────────────────────────────────── */}
        <div className="w-1/3 bg-[#0f172a] border border-gray-800 rounded-xl p-4 overflow-y-auto">
          <h2 className="text-green-400 font-bold mb-4">🎓 Training Materials</h2>

          {training.length === 0 ? (
            <p className="text-gray-500 text-sm">No training available</p>
          ) : (
            training.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`p-3 mb-2 rounded cursor-pointer border transition
                  ${selected?.id === item.id
                    ? "bg-blue-600/20 border-blue-500"
                    : "border-transparent hover:bg-gray-800 hover:border-blue-500"}`}
              >
                <p className="font-semibold text-white text-sm">
                  {contentTypeIcon(item.content_type)} {item.title}
                </p>
                {item.topic && (
                  <p className="text-xs text-gray-400 mt-1">{item.topic}</p>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 capitalize mt-2 inline-block">
                  {item.content_type}
                </span>
              </div>
            ))
          )}
        </div>

        {/* ── RIGHT PANEL ───────────────────────────────── */}
        <div className="flex-1 bg-[#0f172a] border border-gray-800 rounded-xl p-6 overflow-y-auto">

          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <span className="text-5xl">🎓</span>
              <p className="text-gray-400 text-lg font-medium">Select a training material</p>
              <p className="text-gray-600 text-sm">Choose an item from the left panel</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <h2 className="text-2xl font-bold text-blue-400 mb-2">
                {contentTypeIcon(selected.content_type)} {selected.title}
              </h2>
              <div className="flex gap-2 mb-5">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-300 capitalize">
                  {selected.content_type}
                </span>
                {selected.topic && (
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                    {selected.topic}
                  </span>
                )}
              </div>

              {/* ── ARTICLE ───────────────────────────────── */}
              {selected.content_type === "article" && (
                <div className="bg-white rounded-xl p-6 shadow-inner">
                  {selected.w3_content ? (
                    <div
                      className="prose-training text-gray-800 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selected.w3_content }}
                    />
                  ) : (
                    <p className="text-gray-400 italic">No content available.</p>
                  )}
                </div>
              )}

              {/* ── VIDEO ─────────────────────────────────── */}
              {selected.content_type === "video" && (
                <div className="space-y-4">
                  {selected.file_path ? (
                    <>
                      {/* YouTube embed */}
                      {(selected.file_path.includes("youtube") || selected.file_path.includes("youtu.be")) ? (
                        <div className="rounded-xl overflow-hidden aspect-video bg-black">
                          <iframe
                            src={toEmbedUrl(selected.file_path)}
                            title={selected.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        /* Direct mp4 / other video */
                        <video
                          controls
                          className="w-full rounded-xl bg-black"
                          style={{ maxHeight: 480 }}
                        >
                          <source src={getFileUrl(selected.file_path)} />
                          Your browser does not support the video tag.
                        </video>
                      )}
                      <p className="text-xs text-gray-500">
                        🎬 {selected.file_path}
                      </p>
                    </>
                  ) : (
                    <div className="bg-gray-900 rounded-xl p-8 text-center">
                      <p className="text-gray-500">No video URL provided for this content.</p>
                    </div>
                  )}

                  {/* Article notes under video */}
                  {selected.w3_content && (
                    <div className="bg-white rounded-xl p-5 mt-2">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2 tracking-wide">
                        Notes
                      </p>
                      <div
                        className="prose-training text-gray-800 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: selected.w3_content }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── PDF ───────────────────────────────────── */}
              {selected.content_type === "pdf" && (
                <div className="space-y-4">
                  {selected.file_path ? (
                    <>
                      <iframe
                        src={getFileUrl(selected.file_path)}
                        title="PDF Viewer"
                        className="w-full rounded-xl border border-gray-700"
                        style={{ height: 520 }}
                      />
                      <a
                        href={getFileUrl(selected.file_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm text-white"
                      >
                        📥 Download PDF
                      </a>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No PDF file linked.</p>
                  )}
                </div>
              )}

              {/* ── QUIZ ──────────────────────────────────── */}
              {selected.content_type === "quiz" && (
                <QuizRenderer
                  content={selected.w3_content}
                  answers={quizAnswers}
                  setAnswers={setQuizAnswers}
                  submitted={quizSubmitted}
                  setSubmitted={setQuizSubmitted}
                />
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// ── Quiz renderer — parses markdown MCQs into interactive questions ───────────
function QuizRenderer({ content, answers, setAnswers, submitted, setSubmitted }) {
  const questions = parseQuizMarkdown(content);

  if (!questions.length) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 text-center">
        <p className="text-gray-500">No quiz questions found.</p>
        {/* Fallback: render raw content if parse failed */}
        {content && (
          <pre className="text-left text-xs text-gray-400 mt-4 whitespace-pre-wrap">{content}</pre>
        )}
      </div>
    );
  }

  const score = submitted
    ? questions.filter((q) => answers[q.id] !== undefined).length
    : null;

  return (
    <div className="space-y-5">
      {/* Score banner */}
      {submitted && (
        <div className={`rounded-xl p-4 text-center font-bold text-lg ${
          score === questions.length
            ? "bg-green-900/40 text-green-400 border border-green-800"
            : score >= questions.length / 2
            ? "bg-yellow-900/40 text-yellow-400 border border-yellow-800"
            : "bg-red-900/40 text-red-400 border border-red-800"
        }`}>
          {score === questions.length
            ? `🎉 Perfect Score — ${score}/${questions.length}`
            : `Score: ${score}/${questions.length} — ${Math.round((score / questions.length) * 100)}%`}
        </div>
      )}

      {questions.map((q) => (
        <div
          key={q.id}
          className="bg-[#1e293b] border border-gray-700 rounded-xl p-5 space-y-3"
        >
          <p className="text-white font-semibold text-sm">
            <span className="text-blue-400 mr-2">Q{q.id}.</span>
            {q.question}
          </p>

          {q.options.length > 0 ? (
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const isSelected = answers[q.id] === i;
                return (
                  <button
                    key={i}
                    disabled={submitted}
                    onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition border
                      ${submitted
                        ? isSelected
                          ? "bg-blue-600/30 border-blue-500 text-blue-200"
                          : "bg-gray-800 border-gray-700 text-gray-400"
                        : isSelected
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-600 hover:bg-gray-700"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            /* No parsed options — show text input */
            <input
              disabled={submitted}
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="Type your answer..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      ))}

      {/* Submit / Reset */}
      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          Submit Quiz
        </button>
      ) : (
        <button
          onClick={() => { setAnswers({}); setSubmitted(false); }}
          className="w-full bg-gray-700 hover:bg-gray-600 py-2.5 rounded-xl font-semibold text-sm transition"
        >
          Retake Quiz
        </button>
      )}
    </div>
  );
}