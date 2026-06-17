import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { createCampaign, activateCampaign, deactivateCampaign, getOrgStyle, getCampaigns } from "../api/adminApi";

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [campaignType, setCampaignType] = useState("IT");
  const [targetType, setTargetType] = useState("organization");
  const [department, setDepartment] = useState("");
  const [emailsPerUser, setEmailsPerUser] = useState(3);
  const [ratio, setRatio] = useState(0.5);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [orgStyle, setOrgStyle] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [message, setMessage] = useState(null);

  const inputStyle =
    "w-full p-2 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500";

  useEffect(() => {
    fetchOrgStyle();
    fetchCampaigns();
  }, []);

  const fetchOrgStyle = async () => {
    try {
      const res = await getOrgStyle();
      setOrgStyle(res.data);
    } catch (err) {
      console.error("Failed to fetch org style");
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await getCampaigns();
      setCampaigns(res.data);
    } catch (err) {
      console.error("Failed to fetch campaigns");
    }
  };

  const handleCreate = async () => {
    if (!name) return setMessage({ type: "error", text: "Campaign name is required." });
    try {
      setLoadingCreate(true);
      setMessage(null);
      const res = await createCampaign({
        name,
        difficulty,
        campaign_type: campaignType,
        target_type: targetType,
        target_department: department || null,
        emails_per_user: Number(emailsPerUser),
        phishing_ratio: Number(ratio),
      });
      setMessage({ type: "success", text: `Campaign created! ID: ${res.data.campaign_id}` });
      setName("");
      fetchCampaigns();
    } catch (err) {
      setMessage({ type: "error", text: "Error creating campaign" });
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      setLoadingAction(id);
      setMessage(null);
      await activateCampaign(id);
      setMessage({ type: "success", text: "Campaign activated 🚀 Emails are being generated..." });
      fetchCampaigns();
    } catch (err) {
      setMessage({ type: "error", text: "Activation failed" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this campaign? Users will stop receiving new emails. Existing data is preserved.")) return;
    try {
      setLoadingAction(id);
      setMessage(null);
      await deactivateCampaign(id);
      setMessage({ type: "success", text: "Campaign deactivated. Existing emails and data preserved." });
      fetchCampaigns();
    } catch (err) {
      setMessage({ type: "error", text: "Deactivation failed" });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-blue-400">Campaign Management</h1>

        {/* Org Style Status */}
        <div className={`p-3 rounded-lg border text-sm ${
          orgStyle?.configured
            ? "border-green-600 bg-green-900/20 text-green-400"
            : "border-yellow-600 bg-yellow-900/20 text-yellow-400"
        }`}>
          {orgStyle?.configured
            ? `✅ Org Style Active — emails will use ${orgStyle.tone} tone with "${orgStyle.greeting_style}" greeting`
            : "⚠️ Org Style Not Configured — go to Org Onboarding to upload internal emails first"}
        </div>

        {/* Create Campaign Form */}
        <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold text-white">Create New Campaign</h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              className={inputStyle}
              placeholder="Campaign Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select className={inputStyle} value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>

            <input
              className={inputStyle}
              placeholder="Campaign Type (IT, HR, Finance...)"
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
            />

            <select className={inputStyle} value={targetType}
              onChange={(e) => setTargetType(e.target.value)}>
              <option value="organization">Organization (All Users)</option>
              <option value="department">Department</option>
            </select>

            {targetType === "department" && (
              <input
                className={inputStyle}
                placeholder="Department name (e.g. IT, HR)"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            )}

            <input
              type="number"
              className={inputStyle}
              placeholder="Emails per user"
              value={emailsPerUser}
              onChange={(e) => setEmailsPerUser(e.target.value)}
            />

            <div className="col-span-2 space-y-1">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Phishing Ratio</span>
                <span className="text-blue-400 font-bold">{Math.round(ratio * 100)}% phishing</span>
              </div>
              <input
                type="range" min="0" max="1" step="0.1"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0% (all safe)</span>
                <span>100% (all phishing)</span>
              </div>
            </div>
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

          <button
            onClick={handleCreate}
            disabled={loadingCreate}
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {loadingCreate ? "Creating... ⏳" : "Create Campaign"}
          </button>
        </div>

        {/* Campaigns List */}
        <div className="bg-[#0f172a] border border-gray-800 p-6 rounded-xl space-y-4">
          <h2 className="text-lg font-bold text-white">All Campaigns</h2>

          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-sm">No campaigns yet.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="pr-4">Difficulty</th>
                  <th className="pr-4">Status</th>
                  <th className="pr-4">Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-900">

                    {/* Clickable campaign name */}
                    <td className="py-2 pr-4">
                      <button
                        onClick={() => navigate(`/admin/campaigns/${c.id}/detail`)}
                        className="text-blue-400 hover:text-blue-300 font-medium hover:underline text-left"
                      >
                        {c.name}
                      </button>
                    </td>

                    <td className="pr-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-300 capitalize">
                        {c.difficulty}
                      </span>
                    </td>

                    <td className="pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        c.active
                          ? "bg-green-900 text-green-300"
                          : "bg-gray-700 text-gray-400"
                      }`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="pr-4 text-gray-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>

                    <td>
                      <div className="flex gap-2 items-center">
                        {!c.active ? (
                          <button
                            onClick={() => handleActivate(c.id)}
                            disabled={loadingAction === c.id}
                            className="text-xs bg-green-700 hover:bg-green-800 px-3 py-1 rounded disabled:opacity-50"
                          >
                            {loadingAction === c.id ? "Activating..." : "Activate"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeactivate(c.id)}
                            disabled={loadingAction === c.id}
                            className="text-xs bg-red-700 hover:bg-red-800 px-3 py-1 rounded disabled:opacity-50"
                          >
                            {loadingAction === c.id ? "Deactivating..." : "Deactivate"}
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/campaigns/${c.id}/detail`)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                        >
                          Detail
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}