import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getAuditLogs } from "../api/adminApi";

const serviceColor = (service) => {
  switch (service) {
    case "campaign": return "bg-blue-900 text-blue-300";
    case "user":     return "bg-green-900 text-green-300";
    case "auth":     return "bg-yellow-900 text-yellow-300";
    default:         return "bg-gray-700 text-gray-300";
  }
};

const actionIcon = (action) => {
  if (action.includes("create")) return "➕";
  if (action.includes("delete")) return "🗑";
  if (action.includes("activate")) return "▶️";
  if (action.includes("deactivate")) return "⏹";
  if (action.includes("login")) return "🔐";
  if (action.includes("upload")) return "📤";
  return "📋";
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (serviceFilter === "all") {
      setFiltered(logs);
    } else {
      setFiltered(logs.filter(l => l.service === serviceFilter));
    }
  }, [serviceFilter, logs]);

  const fetchLogs = async () => {
    try {
      const res = await getAuditLogs();
      setLogs(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const services = ["all", ...new Set(logs.map(l => l.service))];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-blue-400">Audit Logs</h1>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <span className="text-gray-400 text-sm">Filter by service:</span>
          {services.map(s => (
            <button key={s}
              onClick={() => setServiceFilter(s)}
              className={`text-xs px-3 py-1 rounded-full capitalize transition ${
                serviceFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}>
              {s}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-500">
            Showing {filtered.length} of {logs.length} logs
          </span>
        </div>

        {/* Logs Table */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-xl p-4">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-sm">No audit logs yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="text-left py-2 pr-4">Action</th>
                  <th className="pr-4">Service</th>
                  <th className="pr-4">Actor</th>
                  <th className="pr-4">Details</th>
                  <th className="text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-900">
                    <td className="py-2 pr-4 text-white">
                      {actionIcon(log.action)} {log.action.replace(/_/g, " ")}
                    </td>
                    <td className="pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${serviceColor(log.service)}`}>
                        {log.service}
                      </span>
                    </td>
                    <td className="pr-4 text-gray-300 text-xs">
                      {log.actor_id ? `User #${log.actor_id}` : "system"}
                    </td>
                    <td className="pr-4 text-gray-500 text-xs max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                    <td className="text-right text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
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