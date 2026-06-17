import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { getOrgStyle, uploadOrgStyle } from "../api/adminApi";

export default function OrgOnboardingPage() {
  const [internalFiles, setInternalFiles] = useState([]);
  const [phishingFiles, setPhishingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getOrgStyle();
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch org style");
    }
  };

  const handleUpload = async () => {
    if (internalFiles.length === 0) {
      return setMessage({ type: "error", text: "Please upload at least one internal email file." });
    }
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      Array.from(internalFiles).forEach(f => formData.append("internal_files", f));
      Array.from(phishingFiles).forEach(f => formData.append("phishing_files", f));
      await uploadOrgStyle(formData);
      setMessage({ type: "success", text: "Org style profile extracted and saved!" });
      fetchProfile();
    } catch (err) {
      setMessage({ type: "error", text: "Extraction failed. Check backend logs." });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-2 rounded bg-gray-900 border border-gray-700 text-white";

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-400">Org Style Onboarding</h1>
        <p className="text-gray-400 text-sm">
          Upload internal company emails so the system can learn your organization's
          communication style. This improves the realism of phishing simulations.
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border text-sm ${
            profile?.raw_sample_count > 0
              ? "border-green-600 bg-green-900/20"
              : "border-yellow-600 bg-yellow-900/20"
          }`}>
            <p className="text-gray-400 mb-1">Internal Emails</p>
            <p className={`font-bold text-lg ${
              profile?.raw_sample_count > 0 ? "text-green-400" : "text-yellow-400"
            }`}>
              {profile?.raw_sample_count > 0
                ? `✅ ${profile.raw_sample_count} uploaded`
                : "❌ Not uploaded"}
            </p>
          </div>

          <div className={`p-4 rounded-lg border text-sm ${
            profile?.phishing_sample_count > 0
              ? "border-green-600 bg-green-900/20"
              : "border-yellow-600 bg-yellow-900/20"
          }`}>
            <p className="text-gray-400 mb-1">Phishing Corpus</p>
            <p className={`font-bold text-lg ${
              profile?.phishing_sample_count > 0 ? "text-green-400" : "text-yellow-400"
            }`}>
              {profile?.phishing_sample_count > 0
                ? `✅ ${profile.phishing_sample_count} uploaded`
                : "❌ Not uploaded"}
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl space-y-5">

          <div className="space-y-2">
            <label className="text-white font-semibold">
              Internal Email Samples <span className="text-red-400">*</span>
            </label>
            <p className="text-gray-400 text-xs">
              Upload 5–20 internal company emails (.eml, .txt, .msg, .mbox).
              PII will not be stored — only style patterns are extracted.
            </p>
            <input type="file" multiple accept=".eml,.txt,.msg,.mbox"
              className={inputStyle}
              onChange={(e) => setInternalFiles(e.target.files)} />
            {internalFiles.length > 0 && (
              <p className="text-green-400 text-xs">{internalFiles.length} file(s) selected</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-white font-semibold">
              Phishing Corpus Samples <span className="text-gray-500">(optional)</span>
            </label>
            <p className="text-gray-400 text-xs">
              Upload known phishing email samples (.eml, .txt) from datasets
              like Nazario or CEAS 2008 to improve attack pattern realism.
            </p>
            <input type="file" multiple accept=".eml,.txt,.msg,.mbox"
              className={inputStyle}
              onChange={(e) => setPhishingFiles(e.target.files)} />
            {phishingFiles.length > 0 && (
              <p className="text-green-400 text-xs">{phishingFiles.length} file(s) selected</p>
            )}
          </div>

          {message && (
            <div className={`p-2 rounded text-sm text-center ${
              message.type === "success"
                ? "bg-green-900 text-green-300"
                : "bg-red-900 text-red-300"
            }`}>
              {message.text}
            </div>
          )}

          <button onClick={handleUpload} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 p-2 rounded-lg font-semibold">
            {loading ? "Extracting Style... (this may take 30–60s)" : "Extract & Save Org Style"}
          </button>
        </div>

        {/* Current Profile */}
        {profile?.configured && profile?.raw_sample_count > 0 && (
          <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-blue-300">Current Org Style Profile</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Greeting Style</p>
                <p className="text-white font-medium">{profile.greeting_style || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Sign-off Style</p>
                <p className="text-white font-medium">{profile.signoff_style || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Tone</p>
                <p className="text-white font-medium capitalize">{profile.tone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Samples Processed</p>
                <p className="text-white font-medium">{profile.raw_sample_count}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Common Phrases</p>
              <div className="flex flex-wrap gap-2">
                {(profile.common_phrases || []).map((phrase, i) => (
                  <span key={i}
                    className="bg-[#1e293b] text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-800">
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

