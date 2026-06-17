import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { getUsers, getUserDetail } from '../api/socApi';


export default function SocUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);


  useEffect(() => {
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    const res = await getUsers();
    setUsers(res.data);
  };


  const handleUserClick = async (userId) => {
    setLoadingDetail(true);
    try {
      const res = await getUserDetail(userId);
      setSelectedUser(res.data);
    } catch (err) {
      console.error('Failed to load user detail:', err);
    }
    setLoadingDetail(false);
  };


  const closeModal = () => setSelectedUser(null);


  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-400">User Risk Analysis</h1>


        {/* USERS TABLE */}
        <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl">
          <p className="text-gray-500 text-xs mb-3">
            Click a user to view their full risk profile
          </p>
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="text-left py-2">Email</th>
                <th>Department</th>
                <th>Emails</th>
                <th>Risk Score</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.user_id}
                  onClick={() => handleUserClick(u.user_id)}
                  className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <td className="py-2 text-blue-300">{u.email}</td>
                  <td className="text-center">{u.department ?? '—'}</td>
                  <td className="text-center">{u.emails_received}</td>
                  {/* Risk score from real RiskProfile */}
                  <td className="text-center">
                    <RiskBadge score={u.risk_score} />
                  </td>
                  <td className="text-center">
                    <TrendBadge trend={u.trend} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* USER DETAIL MODAL */}
      {(selectedUser || loadingDetail) && (
        <Modal onClose={closeModal}>
          {loadingDetail ? (
            <p className="text-gray-400 text-center py-10">Loading...</p>
          ) : (
            <UserDetail user={selectedUser} />
          )}
        </Modal>
      )}
    </MainLayout>
  );
}


// --- RISK BADGE (uses real score from RiskProfile) ---
function RiskBadge({ score }) {
  if (score === undefined || score === null) {
    return <span className="text-gray-500 text-xs">No data</span>;
  }


  // Added: color coding based on actual risk score
  const color =
    score >= 70
      ? 'bg-red-500/20 text-red-400'
      : score >= 40
        ? 'bg-yellow-500/20 text-yellow-400'
        : 'bg-green-500/20 text-green-400';


  const label = score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';


  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
      {label} ({score})
    </span>
  );
}


// --- TREND BADGE ---
function TrendBadge({ trend }) {
  if (!trend) return <span className="text-gray-500 text-xs">—</span>;


  // Added: trend icons and colors
  const map = {
    improving: { color: 'text-green-400', icon: '↓' },
    worsening: { color: 'text-red-400', icon: '↑' },
    stable: { color: 'text-yellow-400', icon: '→' },
    critical: { color: 'text-red-500', icon: '⚠' },
  };


  const t = map[trend] ?? { color: 'text-gray-400', icon: '?' };


  return (
    <span className={`text-xs font-semibold ${t.color}`}>
      {t.icon} {trend}
    </span>
  );
}


// --- MODAL WRAPPER ---
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}


// --- USER DETAIL INSIDE MODAL ---
function UserDetail({ user }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">{user.email}</h2>
        <p className="text-gray-400 text-sm">
          {user.department} · {user.role}
        </p>
      </div>


      {/* Risk Summary Cards */}
      {/* Added: real risk_score + trend from RiskProfile */}
      <div className="grid grid-cols-3 gap-3">
        <MiniCard label="Risk Score" value={user.risk_score} />
        <MiniCard label="Trend" value={user.trend} />
        <MiniCard label="Total Emails" value={user.total_emails} />
      </div>


      {/* Action Summary */}
      {/* Added: clicked/reported/ignored counts from Interaction table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          Action Summary
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <ActionCard
            label="Clicked"
            value={user.action_summary?.clicked}
            color="text-red-400"
          />
          <ActionCard
            label="Reported"
            value={user.action_summary?.reported}
            color="text-green-400"
          />
          <ActionCard
            label="Ignored"
            value={user.action_summary?.ignored}
            color="text-yellow-400"
          />
        </div>
      </div>


      {/* Interaction History */}
      {/* Added: full history from Interaction + Email + Explanation join */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          Interaction History
        </h3>
        <div className="space-y-2">
          {user.history?.length === 0 && (
            <p className="text-gray-500 text-xs">No interactions yet.</p>
          )}
          {user.history?.map((h) => (
            <div
              key={h.interaction_id}
              className="bg-[#1e293b] border border-gray-700 rounded-xl p-3 space-y-1"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-white font-medium truncate">
                  {h.email_subject}
                </p>
                <ActionPill action={h.action} />
              </div>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{h.is_phishing ? '🎣 Phishing' : '✅ Safe'}</span>
                <span>{new Date(h.timestamp).toLocaleString()}</span>
              </div>
              {/* Added: AI explanation from Explanation table */}
              {h.explanation && (
                <div className="mt-2 border-t border-gray-700 pt-2 space-y-1">
                  {typeof h.explanation === 'string' ? (
                    <p className="text-xs text-gray-400">{h.explanation}</p>
                  ) : (
                    <>
                      {h.explanation.risk_reason && (
                        <p className="text-xs text-gray-400">
                          <span className="text-gray-500">Risk: </span>
                          {h.explanation.risk_reason}
                        </p>
                      )}
                      {h.explanation.severity_level && (
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${
                            h.explanation.severity_level === 'High'
                              ? 'bg-red-500/20 text-red-400'
                              : h.explanation.severity_level === 'Medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {h.explanation.severity_level} severity
                        </span>
                      )}
                      {h.explanation.training_feedback && (
                        <p className="text-xs text-blue-300/70">
                          <span className="text-gray-500">Tip: </span>
                          {h.explanation.training_feedback}
                        </p>
                      )}
                      {h.explanation.user_action_analysis && (
                        <p className="text-xs text-gray-400">
                          <span className="text-gray-500">Analysis: </span>
                          {h.explanation.user_action_analysis}
                        </p>
                      )}
                      {h.explanation.red_flags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {h.explanation.red_flags.map((flag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function MiniCard({ label, value }) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-3 text-center">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="text-white font-bold mt-1">{value ?? '—'}</p>
    </div>
  );
}


function ActionCard({ label, value, color }) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-3 text-center">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className={`font-bold text-lg mt-1 ${color}`}>{value ?? 0}</p>
    </div>
  );
}


function ActionPill({ action }) {
  const map = {
    clicked: 'bg-red-500/20 text-red-400',
    reported: 'bg-green-500/20 text-green-400',
    ignored: 'bg-yellow-500/20 text-yellow-400',
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[action] ?? 'bg-gray-700 text-gray-300'}`}
    >
      {action}
    </span>
  );
}



