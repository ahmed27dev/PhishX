//newly added for bulk Users.
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { createUser, bulkUploadUsers } from "../api/adminApi";

const inputStyle =
  "w-full p-2 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500";

// ─────────────────────────────────────────
// Manual Create (Admin / SOC accounts)
// ─────────────────────────────────────────
function ManualCreateUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    try {
      await createUser({ email, password, role, department });
      setMessage({ type: "success", text: "User created successfully!" });
      setEmail(""); setPassword(""); setDepartment("");
    } catch (err) {
      setMessage({ type: "error", text: "Error creating user" });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#0f172a] border border-gray-800 p-6 rounded-xl space-y-4">
      <p className="text-sm text-gray-400">
        Use this form to manually create <span className="text-yellow-400">Admin</span> or{" "}
        <span className="text-blue-400">SOC</span> accounts.
      </p>

      {message && (
        <div className={`p-2 rounded text-sm text-center ${
          message.type === "success" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
        }`}>
          {message.text}
        </div>
      )}

      <input className={inputStyle} placeholder="Email"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className={inputStyle} placeholder="Password"
        value={password} onChange={(e) => setPassword(e.target.value)} />
      <select className={inputStyle} value={role}
        onChange={(e) => setRole(e.target.value)}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="soc">SOC</option>
      </select>
      <input className={inputStyle} placeholder="Department"
        value={department} onChange={(e) => setDepartment(e.target.value)} />
      <button onClick={handleSubmit}
        className="w-full bg-green-600 hover:bg-green-700 p-2 rounded-lg font-semibold">
        Create User
      </button>
    </div>
  );
}

// ─────────────────────────────────────────
// Bulk Upload (Regular Users via CSV)
// ─────────────────────────────────────────
function BulkUploadUsers() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file");
    setLoading(true);
    setResults([]);
    setSummary(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await bulkUploadUsers(formData);
      const data = res.data.results;
      setResults(data);
      setSummary({
        created: data.filter(r => r.status === "created").length,
        failed: data.filter(r => r.status === "failed").length,
      });
    } catch (err) {
      alert("Upload failed. Check file format.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const created = results.filter(r => r.status === "created");
    const csv = [
      "email,department,role,temp_password",
      ...created.map(r =>
        `${r.email},${r.department},${r.role},${r.temp_password}`
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_credentials.csv";
    a.click();
  };

  const downloadTemplate = () => {
    const csv = "email,department,role\njohn@company.com,IT,user\njane@company.com,HR,user";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_upload_template.csv";
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#0f172a] border border-gray-800 p-6 rounded-xl space-y-4">

      {/* Info */}
      <div className="bg-[#1e293b] p-3 rounded-lg space-y-1 text-sm">
        <p className="text-gray-300">
          CSV columns: <code className="text-blue-400">email, department, role</code>
        </p>
        <p className="text-gray-300">
          Default password for all uploaded users:{" "}
          <code className="text-yellow-400">PhishX@2025</code>
        </p>
        <p className="text-gray-400 text-xs">
          Users will be required to change password on first login.
        </p>
        <button onClick={downloadTemplate}
          className="text-xs text-blue-400 underline mt-1">
          Download CSV Template
        </button>
      </div>

      {/* File Upload */}
      <input
        type="file"
        accept=".csv"
        className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 p-2 rounded-lg font-semibold"
      >
        {loading ? "Uploading..." : "Upload Users"}
      </button>

      {/* Summary */}
      {summary && (
        <div className="flex justify-between items-center">
          <p className="text-sm">
            <span className="text-green-400 font-bold">✅ {summary.created} created</span>
            {" "}&nbsp;
            <span className="text-red-400 font-bold">❌ {summary.failed} failed</span>
          </p>
          {summary.created > 0 && (
            <button
              onClick={downloadCSV}
              className="text-sm bg-green-700 hover:bg-green-800 px-3 py-1 rounded"
            >
              Download Credentials CSV
            </button>
          )}
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-2 pr-4">Email</th>
                <th className="pr-4">Department</th>
                <th className="pr-4">Role</th>
                <th className="pr-4">Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="py-2 pr-4 text-white">{r.email}</td>
                  <td className="pr-4 text-gray-300">{r.department || "-"}</td>
                  <td className="pr-4 text-gray-300">{r.role || "-"}</td>
                  <td className="pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      r.status === "created"
                        ? "bg-green-800 text-green-300"
                        : "bg-red-800 text-red-300"
                    }`}>
                      {r.status === "created" ? "✅ Created" : "❌ Failed"}
                    </span>
                  </td>
                  <td className="text-gray-500 text-xs">{r.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Page with Tabs
// ─────────────────────────────────────────
export default function CreateUserPage() {
  const [tab, setTab] = useState("manual");

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-400">User Management</h1>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-700 pb-2">
          <button
            onClick={() => setTab("manual")}
            className={`pb-2 font-semibold transition-colors ${
              tab === "manual"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Manual Create
          </button>
          <button
            onClick={() => setTab("bulk")}
            className={`pb-2 font-semibold transition-colors ${
              tab === "bulk"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Bulk Upload (CSV)
          </button>
        </div>

        {tab === "manual" ? <ManualCreateUser /> : <BulkUploadUsers />}
      </div>
    </MainLayout>
  );
}


