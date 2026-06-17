import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getUsers, getCampaigns, updateUser, deleteUser, getUserRisk } from "../api/adminApi";

const trendIcon = (trend) => {
  switch (trend) {
    case "improving": return "↑";
    case "worsening": return "↓";
    case "critical":  return "🔴";
    default:          return "→";
  }
};

const trendColor = (trend) => {
  switch (trend) {
    case "improving": return "text-green-400";
    case "worsening": return "text-yellow-400";
    case "critical":  return "text-red-400";
    default:          return "text-gray-400";
  }
};

const riskColor = (score) => {
  if (score >= 61) return "text-red-400";
  if (score >= 31) return "text-yellow-400";
  return "text-green-400";
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [userRisks, setUserRisks] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const usersRes = await getUsers();
      const campRes = await getCampaigns();
      setUsers(usersRes.data);
      setCampaigns(campRes.data);
      // Fetch risk for user-role only
      const risks = {};
      for (const u of usersRes.data) {
        if (u.role === "user") {
          try {
            const r = await getUserRisk(u.id);
            risks[u.id] = r.data;
          } catch { risks[u.id] = null; }
        }
      }
      setUserRisks(risks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditOpen = (u) => {
    setEditingUser(u.id);
    setEditForm({ email: u.email, role: u.role, department: u.department });
  };

  const handleEditSave = async () => {
    try {
      await updateUser(editingUser, editForm);
      setMessage({ type: "success", text: "User updated." });
      setEditingUser(null);
      fetchData();
    } catch {
      setMessage({ type: "error", text: "Update failed." });
    }
  };

  const handleDelete = async (id, email) => {
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      setMessage({ type: "success", text: "User deleted." });
      fetchData();
    } catch {
      setMessage({ type: "error", text: "Delete failed." });
    }
  };

  const inputStyle = "p-1 rounded bg-gray-800 border border-gray-600 text-white text-sm w-full";

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-400">Admin Dashboard</h1>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Total Users" value={users.length} />
          <StatCard title="Campaigns" value={campaigns.length} />
          <StatCard title="Active Campaigns" value={campaigns.filter(c => c.active).length} />
        </div>

        {/* MESSAGE */}
        {message && (
          <div className={`p-2 rounded text-sm text-center ${
            message.type === "success" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {/* USERS TABLE */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4">
          <h2 className="mb-4 font-semibold text-lg">Users</h2>
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="text-left py-2">Email</th>
                <th className="text-center">Role</th>
                <th className="text-center">Department</th>
                <th className="text-center">Risk Score</th>
                <th className="text-center">Trend</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const risk = userRisks[u.id];
                const isEditing = editingUser === u.id;

                return (
                  <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-2">
                      {isEditing ? (
                        <input className={inputStyle} value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                      ) : u.email}
                    </td>
                    <td className="text-center">
                      {isEditing ? (
                        <select className={inputStyle} value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                          <option value="soc">soc</option>
                        </select>
                      ) : u.role}
                    </td>
                    <td className="text-center">
                      {isEditing ? (
                        <input className={inputStyle} value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
                      ) : u.department || "—"}
                    </td>

                    {/* Risk Score — only for users */}
                    <td className="text-center">
                      {u.role === "user" && risk ? (
                        <span className={`font-bold ${riskColor(risk.risk_score)}`}>
                          {risk.risk_score}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Trend */}
                    <td className="text-center">
                      {u.role === "user" && risk ? (
                        <span className={`font-bold ${trendColor(risk.trend)}`}>
                          {trendIcon(risk.trend)} {risk.trend}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-center">
                      <div className="flex gap-2 justify-center">
                        {isEditing ? (
                          <>
                            <button onClick={handleEditSave}
                              className="text-xs bg-green-700 hover:bg-green-800 px-2 py-1 rounded">
                              Save
                            </button>
                            <button onClick={() => setEditingUser(null)}
                              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditOpen(u)}
                              className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(u.id, u.email)}
                              className="text-xs bg-red-700 hover:bg-red-800 px-2 py-1 rounded">
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CAMPAIGNS TABLE */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4">
          <h2 className="mb-4 font-semibold text-lg">Campaigns</h2>
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-center">Difficulty</th>
                <th className="text-center">Status</th>
                <th className="text-center">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-2">{c.name}</td>
                  <td className="text-center capitalize">{c.difficulty}</td>
                  <td className="text-center">
                    <span className={c.active ? "text-green-400" : "text-red-400"}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-center text-gray-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-1">{value}</h2>
    </div>
  );
}

