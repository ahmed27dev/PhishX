import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getTrainingContent, addTrainingContent, deleteTrainingContent, uploadTrainingFile } from "../api/adminApi";

const inputStyle =
  "w-full p-2 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500";

const contentTypeIcon = (type) => {
  switch (type) {
    case "pdf": return "📄";
    case "video": return "🎬";
    case "article": return "📰";
    case "quiz": return "📝";
    default: return "📌";
  }
};

export default function TrainingManagementPage() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("article");
  const [topic, setTopic] = useState("");
  const [w3Content, setW3Content] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await getTrainingContent();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
    } catch (err) {
      console.error("Failed to load training content");
      setItems([]);
    }
  };

  const handleAdd = async () => {
    if (!title) {
      return setMessage({ type: "error", text: "Title is required." });
    }
    if ((contentType === "article" || contentType === "quiz") && !w3Content) {
      return setMessage({ type: "error", text: "Content is required for articles and quizzes." });
    }
    if (contentType === "video" && !videoUrl) {
      return setMessage({ type: "error", text: "Video URL is required." });
    }
    if (contentType === "pdf" && !file) {
      return setMessage({ type: "error", text: "Please select a PDF file." });
    }

    setLoading(true);
    setMessage(null);

    try {
      let filePath = null;

      // ── PDF: upload file first, get back server path ──
      if (contentType === "pdf" && file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await uploadTrainingFile(formData);
        filePath = uploadRes.data.file_path; // e.g. /admin/files/filename.pdf
      }

      // ── VIDEO: store URL directly ──
      if (contentType === "video") {
        filePath = videoUrl;
      }

      await addTrainingContent({
        title,
        content_type: contentType,
        topic,
        w3_content: (contentType === "article" || contentType === "quiz") ? w3Content : null,
        file_path: filePath
      });

      setMessage({ type: "success", text: "Training content added!" });
      setTitle(""); setTopic(""); setW3Content("");
      setVideoUrl(""); setFile(null);
      fetchContent();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to add content." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this training content?")) return;
    try {
      await deleteTrainingContent(id);
      fetchContent();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-blue-400">Training Content Management</h1>

        <div className="grid grid-cols-2 gap-6">

          {/* ─── ADD FORM ─── */}
          <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white">Add New Content</h2>

            <input className={inputStyle} placeholder="Title"
              value={title} onChange={(e) => setTitle(e.target.value)} />

            <select className={inputStyle} value={contentType}
              onChange={(e) => {
                setContentType(e.target.value);
                setW3Content(""); setVideoUrl(""); setFile(null);
                setPreview(null); setMessage(null);
              }}>
              <option value="article">📰 Article</option>
              <option value="pdf">📄 PDF</option>
              <option value="video">🎬 Video</option>
              <option value="quiz">📝 Quiz</option>
            </select>

            <input className={inputStyle}
              placeholder="Topic (e.g. phishing_awareness, password_security)"
              value={topic} onChange={(e) => setTopic(e.target.value)} />

            {/* ARTICLE / QUIZ */}
            {(contentType === "article" || contentType === "quiz") && (
              <div className="space-y-1">
                <label className="text-sm text-gray-400">
                  Content <span className="text-xs text-gray-600">(HTML supported — W3 style)</span>
                </label>
                <textarea
                  className={`${inputStyle} h-48 resize-none font-mono text-xs`}
                  placeholder="<h2>What is Phishing?</h2><p>Phishing is...</p>"
                  value={w3Content}
                  onChange={(e) => setW3Content(e.target.value)}
                />
                {w3Content && (
                  <button
                    onClick={() => setPreview(preview ? null : w3Content)}
                    className="text-xs text-blue-400 underline"
                  >
                    {preview ? "Hide Preview" : "Show Preview"}
                  </button>
                )}
                {preview && (
                  <div
                    className="bg-white text-gray-900 rounded-lg p-4 text-sm leading-relaxed max-h-48 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: preview }}
                  />
                )}
              </div>
            )}

            {/* VIDEO */}
            {contentType === "video" && (
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Video URL</label>
                <input
                  className={inputStyle}
                  placeholder="https://youtube.com/watch?v=... or direct .mp4 URL"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                {videoUrl && (
                  <p className="text-xs text-green-400">
                    ✅ {videoUrl.includes("youtube") ? "YouTube URL detected" : "Direct video URL"} — will embed in player
                  </p>
                )}
              </div>
            )}

            {/* PDF */}
            {contentType === "pdf" && (
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Upload PDF</label>
                <input
                  type="file"
                  accept=".pdf"
                  className={inputStyle}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file && (
                  <p className="text-xs text-green-400">
                    ✅ {file.name} selected ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  PDF will be uploaded to server and available for download by users.
                </p>
              </div>
            )}

            {message && (
              <div className={`p-2 rounded text-sm text-center ${
                message.type === "success"
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
              }`}>
                {message.text}
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 p-2 rounded-lg font-semibold"
            >
              {loading ? "Uploading..." : "Add Training Content"}
            </button>
          </div>

          {/* ─── CONTENT LIST ─── */}
          <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl space-y-3">
            <h2 className="text-lg font-bold text-white">
              Existing Content ({items.length})
            </h2>

            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">No training content yet.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[500px]">
                {items.map((item) => (
                  <div key={item.id}
                    className="p-3 rounded-lg bg-[#1e293b] border border-gray-700 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-white font-medium text-sm">
                        {contentTypeIcon(item.content_type)} {item.title}
                      </p>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300 text-xs ml-2 flex-shrink-0"
                      >
                        🗑 Delete
                      </button>
                    </div>
                    {item.topic && (
                      <p className="text-xs text-gray-400">{item.topic}</p>
                    )}
                    <div className="flex gap-2 items-center">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 capitalize">
                        {item.content_type}
                      </span>
                      {item.file_path && (
                        <span className="text-xs text-gray-500 truncate max-w-[150px]">
                          {item.file_path}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}