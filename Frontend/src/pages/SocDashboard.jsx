// import { useEffect, useState } from 'react';
// import MainLayout from '../layouts/MainLayout';
// import { getOverview, getAnalytics } from '../api/socApi';


// export default function SocDashboard() {
//   const [overview, setOverview] = useState(null);
//   const [analytics, setAnalytics] = useState(null);


//   useEffect(() => {
//     fetchData();
//   }, []);


//   const fetchData = async () => {
//     try {
//       const [o, a] = await Promise.all([getOverview(), getAnalytics()]);
//       setOverview(o.data);
//       setAnalytics(a.data);
//     } catch (err) {
//       console.error('Dashboard error:', err);
//     }
//   };


//   // Added: derive threat level from risk distribution
//   const threatLevel = (() => {
//     if (!analytics) return null;
//     const { high, medium } = analytics.risk_distribution;
//     if (high >= 3)
//       return {
//         label: 'CRITICAL',
//         color: 'text-red-500',
//         bg: 'bg-red-500/10',
//         border: 'border-red-500/30',
//       };
//     if (high >= 1)
//       return {
//         label: 'HIGH',
//         color: 'text-red-400',
//         bg: 'bg-red-500/10',
//         border: 'border-red-500/20',
//       };
//     if (medium >= 3)
//       return {
//         label: 'MEDIUM',
//         color: 'text-yellow-400',
//         bg: 'bg-yellow-500/10',
//         border: 'border-yellow-500/20',
//       };
//     return {
//       label: 'LOW',
//       color: 'text-green-400',
//       bg: 'bg-green-500/10',
//       border: 'border-green-500/20',
//     };
//   })();


//   return (
//     <MainLayout>
//       <div className="space-y-6">
//         {/* HEADER */}
//         <div className="flex items-center justify-between">
//           <h1 className="text-2xl font-bold text-blue-400">SOC Dashboard</h1>
//           {/* Added: live threat level banner */}
//           {threatLevel && (
//             <div
//               className={`px-4 py-1.5 rounded-full border text-xs font-bold ${threatLevel.color} ${threatLevel.bg} ${threatLevel.border}`}
//             >
//               Threat Level: {threatLevel.label}
//             </div>
//           )}
//         </div>


//         {/* ROW 1 — Overview Cards */}
//         {/* Added: phishing rate % card */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <Card title="Total Users" value={overview?.total_users} icon="👥" />
//           <Card title="Total Emails" value={overview?.total_emails} icon="📧" />
//           <Card
//             title="Phishing Emails"
//             value={overview?.phishing_emails}
//             icon="🎣"
//             valueColor="text-red-400"
//           />
//           <Card
//             title="Phishing Rate"
//             value={
//               overview?.total_emails
//                 ? `${Math.round((overview.phishing_emails / overview.total_emails) * 100)}%`
//                 : '0%'
//             }
//             icon="📊"
//             valueColor={
//               overview?.total_emails &&
//               overview.phishing_emails / overview.total_emails > 0.5
//                 ? 'text-red-400'
//                 : 'text-green-400'
//             }
//           />
//         </div>


//         {/* ROW 2 — Risk Summary + Interaction Summary */}
//         <div className="grid grid-cols-2 gap-4">
//           {/* Added: risk breakdown from RiskProfile */}
//           <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl space-y-3">
//             <h2 className="text-sm font-semibold text-gray-300">
//               Risk Breakdown
//             </h2>
//             <RiskBar
//               label="High Risk"
//               value={analytics?.risk_distribution.high}
//               total={
//                 (analytics?.risk_distribution.high ?? 0) +
//                 (analytics?.risk_distribution.medium ?? 0) +
//                 (analytics?.risk_distribution.low ?? 0)
//               }
//               color="bg-red-500"
//             />
//             <RiskBar
//               label="Medium Risk"
//               value={analytics?.risk_distribution.medium}
//               total={
//                 (analytics?.risk_distribution.high ?? 0) +
//                 (analytics?.risk_distribution.medium ?? 0) +
//                 (analytics?.risk_distribution.low ?? 0)
//               }
//               color="bg-yellow-400"
//             />
//             <RiskBar
//               label="Low Risk"
//               value={analytics?.risk_distribution.low}
//               total={
//                 (analytics?.risk_distribution.high ?? 0) +
//                 (analytics?.risk_distribution.medium ?? 0) +
//                 (analytics?.risk_distribution.low ?? 0)
//               }
//               color="bg-green-500"
//             />
//           </div>


//           {/* Added: interaction summary from Interaction table */}
//           <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl space-y-3">
//             <h2 className="text-sm font-semibold text-gray-300">
//               User Interactions
//             </h2>
//             <InteractionRow
//               label="Clicked"
//               value={analytics?.interactions?.clicked}
//               color="text-red-400"
//               icon="🖱️"
//             />
//             <InteractionRow
//               label="Reported"
//               value={analytics?.interactions?.reported}
//               color="text-green-400"
//               icon="🚩"
//             />
//             <InteractionRow
//               label="Ignored"
//               value={analytics?.interactions?.ignored}
//               color="text-yellow-400"
//               icon="👁️"
//             />
//           </div>
//         </div>


//         {/* ROW 3 — High Risk Users */}
//         {/* Added: real high risk users from analytics */}
//         <div className="bg-[#0f172a] border border-red-900/30 p-4 rounded-xl">
//           <h2 className="text-sm font-semibold text-red-400 mb-3">
//             ⚠ High Risk Users
//           </h2>
//           {!analytics?.high_risk_users?.length ? (
//             <p className="text-gray-500 text-sm">
//               No high risk users detected.
//             </p>
//           ) : (
//             <div className="space-y-2">
//               {analytics.high_risk_users.map((u) => (
//                 <div
//                   key={u.user_id}
//                   className="flex justify-between items-center bg-[#1e293b] px-4 py-3 rounded-xl border border-gray-700"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-2 h-7 rounded-full bg-red-500" />
//                     <div>
//                       <p className="text-sm text-white">User #{u.user_id}</p>
//                       <p className="text-xs text-gray-500">
//                         Score: {u.risk_score}
//                       </p>
//                     </div>
//                   </div>
//                   <TrendBadge trend={u.trend} />
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   );
// }


// // --- OVERVIEW CARD ---
// function Card({ title, value, icon, valueColor = 'text-white' }) {
//   return (
//     <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl">
//       <div className="flex items-center gap-2 mb-1">
//         <span className="text-base">{icon}</span>
//         <p className="text-gray-400 text-xs">{title}</p>
//       </div>
//       <h2 className={`text-2xl font-bold mt-1 ${valueColor}`}>{value ?? 0}</h2>
//     </div>
//   );
// }


// // Added: visual risk bar with percentage fill
// function RiskBar({ label, value, total, color }) {
//   const pct = total > 0 ? Math.round((value / total) * 100) : 0;
//   return (
//     <div className="space-y-1">
//       <div className="flex justify-between text-xs text-gray-400">
//         <span>{label}</span>
//         <span>
//           {value ?? 0} users ({pct}%)
//         </span>
//       </div>
//       <div className="w-full bg-gray-800 rounded-full h-2">
//         <div
//           className={`h-2 rounded-full ${color} transition-all duration-500`}
//           style={{ width: `${pct}%` }}
//         />
//       </div>
//     </div>
//   );
// }


// // Added: interaction row with icon + count
// function InteractionRow({ label, value, color, icon }) {
//   return (
//     <div className="flex justify-between items-center py-1 border-b border-gray-800">
//       <div className="flex items-center gap-2 text-sm text-gray-300">
//         <span>{icon}</span>
//         <span>{label}</span>
//       </div>
//       <span className={`font-bold text-sm ${color}`}>{value ?? 0}</span>
//     </div>
//   );
// }


// // Added: trend badge (consistent with Analytics + SocUsers)
// function TrendBadge({ trend }) {
//   if (!trend) return <span className="text-gray-500 text-xs">—</span>;


//   const map = {
//     improving: { color: 'text-green-400', icon: '↓' },
//     worsening: { color: 'text-red-400', icon: '↑' },
//     stable: { color: 'text-yellow-400', icon: '→' },
//     critical: { color: 'text-red-500', icon: '⚠' },
//   };


//   const t = map[trend] ?? { color: 'text-gray-400', icon: '?' };


//   return (
//     <span className={`text-xs font-semibold ${t.color}`}>
//       {t.icon} {trend}
//     </span>
//   );
// }




import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { getOverview, getAnalytics } from '../api/socApi';


export default function SocDashboard() {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      const [o, a] = await Promise.all([getOverview(), getAnalytics()]);
      setOverview(o.data);
      setAnalytics(a.data);
      // DEBUG: remove this log once you confirm the field name
      console.log('high_risk_users sample:', a.data?.high_risk_users?.[0]);
    } catch (err) {
      console.error('Dashboard error:', err);
    }
  };


  // Derive threat level from risk distribution
  const threatLevel = (() => {
    if (!analytics) return null;
    const { high, medium } = analytics.risk_distribution;
    if (high >= 3)
      return {
        label: 'CRITICAL',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
      };
    if (high >= 1)
      return {
        label: 'HIGH',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
      };
    if (medium >= 3)
      return {
        label: 'MEDIUM',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
      };
    return {
      label: 'LOW',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    };
  })();


  return (
    <MainLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">SOC Dashboard</h1>
          {threatLevel && (
            <div
              className={`px-4 py-1.5 rounded-full border text-xs font-bold ${threatLevel.color} ${threatLevel.bg} ${threatLevel.border}`}
            >
              Threat Level: {threatLevel.label}
            </div>
          )}
        </div>


        {/* ROW 1 — Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="Total Users" value={overview?.total_users} icon="👥" />
          <Card title="Total Emails" value={overview?.total_emails} icon="📧" />
          <Card
            title="Phishing Emails"
            value={overview?.phishing_emails}
            icon="🎣"
            valueColor="text-red-400"
          />
          <Card
            title="Phishing Rate"
            value={
              overview?.total_emails
                ? `${Math.round((overview.phishing_emails / overview.total_emails) * 100)}%`
                : '0%'
            }
            icon="📊"
            valueColor={
              overview?.total_emails &&
              overview.phishing_emails / overview.total_emails > 0.5
                ? 'text-red-400'
                : 'text-green-400'
            }
          />
        </div>


        {/* ROW 2 — Risk Summary + Interaction Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl space-y-3">
            <h2 className="text-sm font-semibold text-gray-300">
              Risk Breakdown
            </h2>
            <RiskBar
              label="High Risk"
              value={analytics?.risk_distribution.high}
              total={
                (analytics?.risk_distribution.high ?? 0) +
                (analytics?.risk_distribution.medium ?? 0) +
                (analytics?.risk_distribution.low ?? 0)
              }
              color="bg-red-500"
            />
            <RiskBar
              label="Medium Risk"
              value={analytics?.risk_distribution.medium}
              total={
                (analytics?.risk_distribution.high ?? 0) +
                (analytics?.risk_distribution.medium ?? 0) +
                (analytics?.risk_distribution.low ?? 0)
              }
              color="bg-yellow-400"
            />
            <RiskBar
              label="Low Risk"
              value={analytics?.risk_distribution.low}
              total={
                (analytics?.risk_distribution.high ?? 0) +
                (analytics?.risk_distribution.medium ?? 0) +
                (analytics?.risk_distribution.low ?? 0)
              }
              color="bg-green-500"
            />
          </div>


          <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl space-y-3">
            <h2 className="text-sm font-semibold text-gray-300">
              User Interactions
            </h2>
            <InteractionRow
              label="Clicked"
              value={analytics?.interactions?.clicked}
              color="text-red-400"
              icon="🖱️"
            />
            <InteractionRow
              label="Reported"
              value={analytics?.interactions?.reported}
              color="text-green-400"
              icon="🚩"
            />
            <InteractionRow
              label="Ignored"
              value={analytics?.interactions?.ignored}
              color="text-yellow-400"
              icon="👁️"
            />
          </div>
        </div>


        {/* ROW 3 — High Risk Users */}
        <div className="bg-[#0f172a] border border-red-900/30 p-4 rounded-xl">
          <h2 className="text-sm font-semibold text-red-400 mb-3">
            ⚠ High Risk Users
          </h2>
          {!analytics?.high_risk_users?.length ? (
            <p className="text-gray-500 text-sm">
              No high risk users detected.
            </p>
          ) : (
            <div className="space-y-2">
              {analytics.high_risk_users.map((u) => (
                <div
                  key={u.user_id}
                  className="flex justify-between items-center bg-[#1e293b] px-4 py-3 rounded-xl border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-7 rounded-full bg-red-500" />
                    <div>
                      {/* Primary: show email, then name/username, fallback to ID */}
                      <p className="text-sm text-white">
                        {u.email
                          ? u.email
                          : u.name || u.username
                          ? u.name || u.username
                          : `User #${u.user_id}`}
                      </p>
                      {/* Secondary line: show name alongside email if both exist */}
                      {u.email && (u.name || u.username) && (
                        <p className="text-xs text-gray-400">
                          {u.name || u.username}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Risk Score: {u.risk_score}
                      </p>
                    </div>
                  </div>
                  <TrendBadge trend={u.trend} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}


// --- OVERVIEW CARD ---
function Card({ title, value, icon, valueColor = 'text-white' }) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 p-4 rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <p className="text-gray-400 text-xs">{title}</p>
      </div>
      <h2 className={`text-2xl font-bold mt-1 ${valueColor}`}>{value ?? 0}</h2>
    </div>
  );
}


// Visual risk bar with percentage fill
function RiskBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span>
          {value ?? 0} users ({pct}%)
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}


// Interaction row with icon + count
function InteractionRow({ label, value, color, icon }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-800">
      <div className="flex items-center gap-2 text-sm text-gray-300">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <span className={`font-bold text-sm ${color}`}>{value ?? 0}</span>
    </div>
  );
}


// Trend badge
function TrendBadge({ trend }) {
  if (!trend) return <span className="text-gray-500 text-xs">—</span>;

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