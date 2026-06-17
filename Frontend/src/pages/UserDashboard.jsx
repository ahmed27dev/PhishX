import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getInbox, interactEmail, getRisk } from "../api/userApi";

export default function UserDashboard() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const [result, setResult] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const [nextEmail, setNextEmail] = useState(null);

  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmails();
    fetchRisk();
  }, []);

  const fetchEmails = async () => {
    try {
      const res = await getInbox();
      const data = Array.isArray(res.data) ? res.data : [];
      setEmails(data);
    } catch (err) {
      console.error("Inbox error:", err);
      setEmails([]);
    }
  };

  const fetchRisk = async () => {
    try {
      const res = await getRisk();
      setRisk(res.data);
    } catch (err) {
      console.error("Risk error:", err);
    }
  };

  const handleAction = async (action) => {
    if (!selectedEmail) return;
    setLoading(true);

    try {
      const res = await interactEmail({ email_id: selectedEmail.id, action });
      const agent = res.data.agent_result;

      setResult(agent || null);
      setAiMessage(agent?.ai_awareness_message || null);

      setEmails((prev) =>
        prev.map((e) =>
          e.id === selectedEmail.id ? { ...e, acted: true, action } : e
        )
      );

      const newEmail = res.data.next_email;
      if (newEmail) {
        setNextEmail(newEmail);
        await fetchEmails();
      }

      await fetchRisk();
    } catch (err) {
      console.error("Interaction error:", err);
      alert("Error processing action");
    }

    setLoading(false);
  };

  const loadNextEmail = () => {
    if (!nextEmail) return;
    const fullEmail = emails.find((e) => e.id === nextEmail.id);
    if (fullEmail) setSelectedEmail(fullEmail);
    setResult(null);
    setAiMessage(null);
    setNextEmail(null);
  };

  const isCorrectDecision = () => {
    if (!selectedEmail || !result) return null;
    const isPhishing = selectedEmail.type === "phishing";
    const action = selectedEmail.action;
    if (isPhishing && action === "reported") return true;
    if (!isPhishing && action !== "reported") return true;
    return false;
  };

  // ── Compute stats live from emails array (not risk_profiles) ──
  const actedEmails = emails.filter((e) => e.acted);
  const totalEmails = actedEmails.length;
  const totalReports = actedEmails.filter((e) => e.action === "reported").length;
  const totalClicks = actedEmails.filter((e) => e.action === "clicked").length;
  const reportRate = totalEmails > 0 ? Math.round((totalReports / totalEmails) * 100) : 0;
  const clickRate = totalEmails > 0 ? Math.round((totalClicks / totalEmails) * 100) : 0;

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">

        {/* ═══════════════════════════════════════════
            TOP BAR — always visible
        ═══════════════════════════════════════════ */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-xl px-5 py-3 flex items-center gap-6 flex-wrap">

          {/* Risk Score */}
          <div className="flex items-center gap-3 min-w-[160px]">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Risk Score</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${
                  (risk?.risk_score ?? 0) > 70 ? "text-red-400" :
                  (risk?.risk_score ?? 0) > 40 ? "text-yellow-400" :
                  "text-green-400"
                }`}>
                  {risk?.risk_score ?? "—"}
                </span>
                <span className="text-xs text-gray-600">/ 100</span>
              </div>
            </div>
            {/* mini progress bar */}
            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  (risk?.risk_score ?? 0) > 70 ? "bg-red-500" :
                  (risk?.risk_score ?? 0) > 40 ? "bg-yellow-400" :
                  "bg-green-500"
                }`}
                style={{ width: `${risk?.risk_score ?? 0}%` }}
              />
            </div>
          </div>

          <Divider />

          {/* Trend */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Trend</p>
            <span className={`text-sm font-bold ${
              risk?.trend === "worsening" || risk?.trend === "critical" ? "text-red-400" :
              risk?.trend === "improving" ? "text-green-400" :
              "text-yellow-400"
            }`}>
              {risk?.trend === "worsening" ? "↑ Worsening" :
               risk?.trend === "improving" ? "↓ Improving" :
               risk?.trend === "critical"  ? "⚠ Critical"  :
               "→ Stable"}
            </span>
          </div>

          <Divider />

          {/* Total Emails acted on */}
          <StatPill label="Emails" value={totalEmails} color="text-blue-400" />

          <Divider />

          {/* Reports */}
          <StatPill label="Reported" value={totalReports} color="text-green-400" />

          <Divider />

          {/* Clicks */}
          <StatPill label="Clicked" value={totalClicks} color="text-red-400" />

          <Divider />

          {/* Report Rate bar */}
          <div className="flex-1 min-w-[140px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Report Rate</span>
              <span className="text-green-400 font-semibold">{reportRate}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-green-500 rounded-full transition-all duration-700"
                style={{ width: `${reportRate}%` }}
              />
            </div>
          </div>

          {/* Click Rate bar */}
          <div className="flex-1 min-w-[140px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Click Rate</span>
              <span className="text-red-400 font-semibold">{clickRate}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-red-500 rounded-full transition-all duration-700"
                style={{ width: `${clickRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            MAIN CONTENT — inbox + email view
        ═══════════════════════════════════════════ */}
        <div className="flex gap-6 flex-1 min-h-0">

          {/* LEFT: INBOX */}
          <div className="w-1/3 bg-[#0f172a] border border-gray-800 rounded-xl p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-blue-400">Inbox</h2>

            {emails.length === 0 && (
              <p className="text-gray-500">No emails available</p>
            )}

            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  setResult(null);
                  setAiMessage(email.ai_message || null);
                }}
                className={`p-3 mb-2 rounded cursor-pointer transition
                  ${selectedEmail?.id === email.id
                    ? "bg-blue-600/20 border border-blue-500"
                    : "hover:bg-gray-800"}`}
              >
                <p className="text-sm font-semibold">{email.subject || "Loading..."}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{email.created_at}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    email.acted
                      ? email.type === "phishing"
                        ? "bg-red-600/20 text-red-400"
                        : "bg-green-600/20 text-green-400"
                      : "bg-gray-600/20 text-gray-400"
                  }`}>
                    {email.acted ? (email.type || "unknown").toUpperCase() : "NEW"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: EMAIL VIEW */}
          <div className="flex-1 bg-[#0f172a] border border-gray-800 rounded-xl p-6 overflow-y-auto">
            {!selectedEmail ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-4xl mb-3">📧</p>
                <p className="text-gray-400 font-medium">Select an email to begin training</p>
                <p className="text-gray-600 text-sm mt-1">Your live stats are tracked in the bar above</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h2>
                <p className="text-gray-300 mb-6 whitespace-pre-line">{selectedEmail.body}</p>

                {!selectedEmail.acted && (
                  <div className="flex gap-3 mb-6 flex-wrap">
                    {["opened", "clicked", "downloaded", "reported", "ignored"].map((a) => (
                      <button
                        key={a}
                        onClick={() => handleAction(a)}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm capitalize"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}

                {loading && <p className="text-yellow-400 mb-4">Processing...</p>}

                {result && (
                  <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-2 mt-2 mb-4">
                    <h3 className="text-blue-400 font-bold">Analysis Result</h3>

                    <p className={`font-semibold ${isCorrectDecision() ? "text-green-400" : "text-red-400"}`}>
                      {isCorrectDecision() ? "✔ Correct Decision" : "❌ Wrong Decision"}
                    </p>

                    <p><strong>Severity:</strong> {result.structured_explanation?.severity_level}</p>
                    <p><strong>Risk:</strong> {result.structured_explanation?.risk_reason}</p>

                    <ul className="list-disc ml-5 text-sm text-gray-300">
                      {result.structured_explanation?.red_flags?.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>

                    <p className="text-yellow-400">{result.structured_explanation?.training_feedback}</p>
                    <p className="text-green-400">{result.structured_explanation?.recommended_action}</p>
                  </div>
                )}

                <div className="bg-blue-900/40 p-4 rounded-xl border border-blue-900/30">
                  <h3 className="text-blue-300 font-bold mb-1">AI Awareness</h3>
                  <p className="text-sm text-gray-300">{aiMessage || "Not available"}</p>
                </div>

                {nextEmail && (
                  <button
                    onClick={loadNextEmail}
                    className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                  >
                    Next Email →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// ── helpers ──
function Divider() {
  return <div className="w-px h-8 bg-gray-800 self-center flex-shrink-0" />;
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex-shrink-0">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value ?? 0}</p>
    </div>
  );
}