import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getCampaignDetail } from "../api/adminApi";

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const res = await getCampaignDetail(id);
      setDetail(res.data);
    } catch (err) {
      console.error("Failed to load campaign detail");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MainLayout><p className="text-gray-400">Loading...</p></MainLayout>;
  if (!detail) return <MainLayout><p className="text-red-400">Campaign not found.</p></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/create-campaign")}
            className="text-gray-400 hover:text-white text-sm">
            ← Back to Campaigns
          </button>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">{detail.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
            detail.active
              ? "bg-green-900 text-green-300"
              : "bg-gray-700 text-gray-400"
          }`}>
            {detail.active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Difficulty", value: detail.difficulty },
            { label: "Type", value: detail.campaign_type },
            { label: "Target", value: detail.target_type },
            { label: "Department", value: detail.target_department || "All" },
            { label: "Users Targeted", value: detail.stats.users_targeted },
            { label: "Created", value: new Date(detail.created_at).toLocaleDateString() }
          ].map((item, i) => (
            <div key={i} className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl">
              <p className="text-gray-400 text-xs">{item.label}</p>
              <p className="text-white font-semibold capitalize mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-4">Campaign Statistics</h2>
          <div className="grid grid-cols-4 gap-4">
            <StatBox label="Total Emails" value={detail.stats.total_emails} color="text-blue-400" />
            <StatBox label="Phishing" value={detail.stats.phishing_emails} color="text-red-400" />
            <StatBox label="Safe" value={detail.stats.safe_emails} color="text-green-400" />
            <StatBox label="Total Opens" value={detail.stats.total_opens} color="text-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-[#1e293b] p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm">Click Rate</p>
              <p className={`text-3xl font-bold mt-1 ${
                detail.stats.click_rate > 50 ? "text-red-400" :
                detail.stats.click_rate > 25 ? "text-yellow-400" : "text-green-400"
              }`}>
                {detail.stats.click_rate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {detail.stats.total_clicks} clicks / {detail.stats.phishing_emails} phishing emails
              </p>
            </div>
            <div className="bg-[#1e293b] p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm">Report Rate</p>
              <p className={`text-3xl font-bold mt-1 ${
                detail.stats.report_rate > 50 ? "text-green-400" :
                detail.stats.report_rate > 25 ? "text-yellow-400" : "text-red-400"
              }`}>
                {detail.stats.report_rate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {detail.stats.total_reports} reports / {detail.stats.phishing_emails} phishing emails
              </p>
            </div>
          </div>
        </div>

        {/* Themes */}
        <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-3">Generated Themes</h2>
          <div className="flex flex-wrap gap-2">
            {detail.themes.length === 0 ? (
              <p className="text-gray-500 text-sm">No themes generated yet.</p>
            ) : detail.themes.map((t, i) => (
              <span key={i}
                className="bg-blue-900/40 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-800">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Targeted Users */}
        <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl">
          <h2 className="text-lg font-bold text-white mb-3">
            Targeted Users ({detail.targeted_users.length})
          </h2>
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="text-left py-2">Email</th>
                <th className="text-center">Department</th>
              </tr>
            </thead>
            <tbody>
              {detail.targeted_users.map((u, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-2 text-white">{u.email}</td>
                  <td className="text-center text-gray-300">{u.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </MainLayout>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-[#1e293b] p-4 rounded-xl text-center">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}