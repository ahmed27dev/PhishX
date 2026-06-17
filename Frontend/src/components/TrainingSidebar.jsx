import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getTrainingContent } from "../api/userApi";

export default function TrainingPage() {
  const [training, setTraining] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchTraining();
  }, []);

  const fetchTraining = async () => {
    try {
      const res = await getTrainingContent();
      setTraining(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Training fetch error:", err);
      setTraining([]);
    }
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

        {/* LEFT PANEL */}
        <div className="w-1/3 bg-[#0f172a] border border-gray-800 rounded-xl p-4 overflow-y-auto">
          <h2 className="text-green-400 font-bold mb-4">🎓 Training Materials</h2>

          {training.length === 0 ? (
            <p className="text-gray-500">No training available</p>
          ) : training.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className={`p-3 mb-2 rounded cursor-pointer border transition
                ${selected?.id === item.id
                  ? "bg-blue-600/20 border-blue-500"
                  : "border-transparent hover:bg-gray-800 hover:border-blue-500"}`}
            >
              <p className="font-semibold text-white">
                {contentTypeIcon(item.content_type)} {item.title}
              </p>
              {item.topic && (
                <p className="text-xs text-gray-400 mt-1">{item.topic}</p>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 capitalize mt-2 inline-block">
                {item.content_type}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-[#0f172a] border border-gray-800 rounded-xl p-6 overflow-y-auto">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <span className="text-5xl">🎓</span>
              <p className="text-gray-400 text-lg font-medium">Select a training material</p>
              <p className="text-gray-600 text-sm">Choose an item from the left panel</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-blue-400 mb-2">
                {contentTypeIcon(selected.content_type)} {selected.title}
              </h2>
              <div className="flex gap-2 mb-4">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-300 capitalize">
                  {selected.content_type}
                </span>
                {selected.topic && (
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                    {selected.topic}
                  </span>
                )}
              </div>
              <div className="bg-white text-gray-900 p-6 rounded-xl text-sm leading-relaxed">
                {selected.w3_content ? (
                  <div
                    className="prose max-w-none"
                    style={{ lineHeight: "1.8" }}
                    dangerouslySetInnerHTML={{ __html: selected.w3_content }}
                  />
                ) : selected.file_path ? (
                  <div className="space-y-4">
                    <p className="text-gray-700">📄 This is a file-based material.</p>
                    
                      <a href={selected.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm text-white"
                    >
                      📥 Download / Open File
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No content available</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}