// import { useEffect, useState } from 'react';
// import MainLayout from '../layouts/MainLayout';
// import { getAnalytics } from '../api/socApi';
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   ResponsiveContainer,
// } from 'recharts';


// const RISK_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
// const ACTION_COLORS = {
//   clicked: '#ef4444',
//   reported: '#22c55e',
//   ignored: '#f59e0b',
// };


// export default function SocAnalytics() {
//   const [analytics, setAnalytics] = useState(null);


//   useEffect(() => {
//     fetchAnalytics();
//   }, []);


//   const fetchAnalytics = async () => {
//     try {
//       const res = await getAnalytics();
//       setAnalytics(res.data);
//     } catch (err) {
//       console.error('Analytics error:', err);
//     }
//   };


//   if (!analytics) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center space-y-3">
//             <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
//             <p className="text-gray-400 text-sm">Loading analytics...</p>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }


//   const riskData = [
//     {
//       name: 'High',
//       value: analytics.risk_distribution.high,
//       color: RISK_COLORS.high,
//     },
//     {
//       name: 'Medium',
//       value: analytics.risk_distribution.medium,
//       color: RISK_COLORS.medium,
//     },
//     {
//       name: 'Low',
//       value: analytics.risk_distribution.low,
//       color: RISK_COLORS.low,
//     },
//   ].filter((d) => d.value > 0);


//   const interactionData = Object.entries(analytics.interactions).map(
//     ([action, count]) => ({
//       action: action.charAt(0).toUpperCase() + action.slice(1),
//       count,
//       color: ACTION_COLORS[action] ?? '#6366f1',
//     }),
//   );


//   const emailData = [
//     {
//       name: 'Phishing',
//       value: analytics.email_distribution.phishing,
//       color: '#ef4444',
//     },
//     {
//       name: 'Safe',
//       value: analytics.email_distribution.safe,
//       color: '#22c55e',
//     },
//   ];


//   const totalRisk =
//     (analytics.risk_distribution.high ?? 0) +
//     (analytics.risk_distribution.medium ?? 0) +
//     (analytics.risk_distribution.low ?? 0);


//   const totalInteractions = Object.values(analytics.interactions).reduce(
//     (a, b) => a + b,
//     0,
//   );


//   return (
//     <MainLayout>
//       <div className="space-y-6 p-1">
//         {/* PAGE HEADER */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-white">SOC Analytics</h1>
//             <p className="text-gray-500 text-sm mt-0.5">
//               Security operations center — threat intelligence overview
//             </p>
//           </div>
//           <div className="text-xs text-gray-600 bg-[#0f172a] border border-gray-800 px-3 py-1.5 rounded-lg">
//             Live data
//           </div>
//         </div>


//         {/* SUMMARY STAT STRIP */}
//         <div className="grid grid-cols-3 gap-3">
//           <StatStrip
//             label="Total Users Profiled"
//             value={totalRisk}
//             sub="across all risk levels"
//             color="text-blue-400"
//           />
//           <StatStrip
//             label="Total Interactions"
//             value={totalInteractions}
//             sub="clicked · reported · ignored"
//             color="text-purple-400"
//           />
//           <StatStrip
//             label="High Risk Users"
//             value={analytics.risk_distribution.high}
//             sub={
//               analytics.risk_distribution.high > 0
//                 ? 'requires attention'
//                 : 'all clear'
//             }
//             color={
//               analytics.risk_distribution.high > 0
//                 ? 'text-red-400'
//                 : 'text-green-400'
//             }
//           />
//         </div>


//         {/* ROW 1 — PIE CHARTS */}
//         <div className="grid grid-cols-2 gap-4">
//           <ChartCard
//             title="Risk Distribution"
//             subtitle="Users by risk score tier"
//             accent="border-l-blue-500"
//           >
//             {riskData.length === 0 ? (
//               <EmptyState message="No risk profiles yet" />
//             ) : (
//               <>
//                 <ResponsiveContainer width="100%" height={200}>
//                   <PieChart>
//                     <Pie
//                       data={riskData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={85}
//                       paddingAngle={4}
//                       dataKey="value"
//                       strokeWidth={0}
//                     >
//                       {riskData.map((entry, i) => (
//                         <Cell key={i} fill={entry.color} opacity={0.9} />
//                       ))}
//                     </Pie>
//                     <Tooltip content={<CustomTooltip />} />
//                     <Legend
//                       iconType="circle"
//                       iconSize={8}
//                       formatter={(value) => (
//                         <span style={{ color: '#9ca3af', fontSize: 12 }}>
//                           {value}
//                         </span>
//                       )}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 {/* Risk breakdown rows */}
//                 <div className="space-y-2 mt-2 border-t border-gray-800 pt-3">
//                   {[
//                     {
//                       label: 'High',
//                       value: analytics.risk_distribution.high,
//                       color: 'bg-red-500',
//                     },
//                     {
//                       label: 'Medium',
//                       value: analytics.risk_distribution.medium,
//                       color: 'bg-yellow-400',
//                     },
//                     {
//                       label: 'Low',
//                       value: analytics.risk_distribution.low,
//                       color: 'bg-green-500',
//                     },
//                   ].map((r) => (
//                     <div
//                       key={r.label}
//                       className="flex items-center gap-3 text-xs text-gray-400"
//                     >
//                       <div className={`w-2 h-2 rounded-full ${r.color}`} />
//                       <span className="w-14">{r.label}</span>
//                       <div className="flex-1 bg-gray-800 rounded-full h-1.5">
//                         <div
//                           className={`h-1.5 rounded-full ${r.color} transition-all duration-700`}
//                           style={{
//                             width:
//                               totalRisk > 0
//                                 ? `${(r.value / totalRisk) * 100}%`
//                                 : '0%',
//                           }}
//                         />
//                       </div>
//                       <span className="w-6 text-right">{r.value}</span>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </ChartCard>


//           <ChartCard
//             title="Email Distribution"
//             subtitle="Phishing vs safe emails sent"
//             accent="border-l-purple-500"
//           >
//             <ResponsiveContainer width="100%" height={200}>
//               <PieChart>
//                 <Pie
//                   data={emailData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={60}
//                   outerRadius={85}
//                   paddingAngle={4}
//                   dataKey="value"
//                   strokeWidth={0}
//                 >
//                   {emailData.map((entry, i) => (
//                     <Cell key={i} fill={entry.color} opacity={0.9} />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend
//                   iconType="circle"
//                   iconSize={8}
//                   formatter={(value) => (
//                     <span style={{ color: '#9ca3af', fontSize: 12 }}>
//                       {value}
//                     </span>
//                   )}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//             {/* Email stat rows */}
//             <div className="space-y-2 mt-2 border-t border-gray-800 pt-3">
//               {emailData.map((e) => (
//                 <div
//                   key={e.name}
//                   className="flex justify-between text-xs text-gray-400"
//                 >
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="w-2 h-2 rounded-full"
//                       style={{ background: e.color }}
//                     />
//                     <span>{e.name}</span>
//                   </div>
//                   <span className="font-semibold" style={{ color: e.color }}>
//                     {e.value} emails
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </ChartCard>
//         </div>


//         {/* ROW 2 — BAR CHART */}
//         <ChartCard
//           title="User Interactions"
//           subtitle="How users responded to phishing simulations"
//           accent="border-l-green-500"
//         >
//           {interactionData.length === 0 ? (
//             <EmptyState message="No interaction data yet" />
//           ) : (
//             <ResponsiveContainer width="100%" height={220}>
//               <BarChart
//                 data={interactionData}
//                 margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
//               >
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   stroke="#1e293b"
//                   vertical={false}
//                 />
//                 <XAxis
//                   dataKey="action"
//                   tick={{ fill: '#6b7280', fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis
//                   tick={{ fill: '#6b7280', fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                   allowDecimals={false}
//                 />
//                 <Tooltip
//                   content={<CustomTooltip />}
//                   cursor={{ fill: '#ffffff08' }}
//                 />
//                 <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={80}>
//                   {interactionData.map((entry, i) => (
//                     <Cell key={i} fill={entry.color} opacity={0.85} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </ChartCard>


//         {/* ROW 3 — HIGH RISK USERS */}
//         <ChartCard
//           title="High Risk Users"
//           subtitle="Users with risk score ≥ 70"
//           accent="border-l-red-500"
//         >
//           {analytics.high_risk_users.length === 0 ? (
//             <div className="flex items-center gap-3 py-4">
//               <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 text-sm">
//                 ✓
//               </div>
//               <div>
//                 <p className="text-sm text-white">No high risk users</p>
//                 <p className="text-xs text-gray-500">
//                   All users are within acceptable risk thresholds
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-2 mt-1">
//               {analytics.high_risk_users.map((u) => (
//                 <div
//                   key={u.user_id}
//                   className="flex justify-between items-center bg-[#1a1f2e] px-4 py-3 rounded-xl border border-red-900/30 hover:border-red-700/40 transition-colors"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
//                       <span className="text-red-400 text-xs font-bold">
//                         {u.risk_score}
//                       </span>
//                     </div>
//                     <div>
//                       <p className="text-sm text-white font-medium">
//                         User #{u.user_id}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         Risk score: {u.risk_score} / 100
//                       </p>
//                     </div>
//                   </div>
//                   <TrendBadge trend={u.trend} />
//                 </div>
//               ))}
//             </div>
//           )}
//         </ChartCard>
//       </div>
//     </MainLayout>
//   );
// }


// // --- CUSTOM TOOLTIP ---
// function CustomTooltip({ active, payload }) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
//       <p className="text-gray-400">
//         {payload[0].name ?? payload[0].payload?.action}
//       </p>
//       <p className="text-white font-bold mt-0.5">{payload[0].value}</p>
//     </div>
//   );
// }


// // --- STAT STRIP CARD ---
// function StatStrip({ label, value, sub, color }) {
//   return (
//     <div className="bg-[#0f172a] border border-gray-800 rounded-xl px-4 py-3">
//       <p className="text-gray-500 text-xs">{label}</p>
//       <p className={`text-2xl font-bold mt-1 ${color}`}>{value ?? 0}</p>
//       <p className="text-gray-600 text-xs mt-0.5">{sub}</p>
//     </div>
//   );
// }


// // --- CHART CARD WRAPPER ---
// function ChartCard({
//   title,
//   subtitle,
//   accent = 'border-l-blue-500',
//   children,
// }) {
//   return (
//     <div
//       className={`bg-[#0f172a] border border-gray-800 border-l-2 ${accent} p-5 rounded-xl`}
//     >
//       <div className="mb-4">
//         <h2 className="text-sm font-semibold text-white">{title}</h2>
//         {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
//       </div>
//       {children}
//     </div>
//   );
// }


// // --- EMPTY STATE ---
// function EmptyState({ message }) {
//   return (
//     <div className="flex items-center justify-center h-32">
//       <p className="text-gray-600 text-sm">{message}</p>
//     </div>
//   );
// }


// // --- TREND BADGE ---
// function TrendBadge({ trend }) {
//   if (!trend) return <span className="text-gray-500 text-xs">—</span>;
//   const map = {
//     improving: { color: 'text-green-400 bg-green-500/10', icon: '↓' },
//     worsening: { color: 'text-red-400 bg-red-500/10', icon: '↑' },
//     stable: { color: 'text-yellow-400 bg-yellow-500/10', icon: '→' },
//     critical: { color: 'text-red-500 bg-red-500/10', icon: '⚠' },
//   };
//   const t = map[trend] ?? { color: 'text-gray-400 bg-gray-800', icon: '?' };
//   return (
//     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.color}`}>
//       {t.icon} {trend}
//     </span>
//   );
// }

import { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { getAnalytics } from '../api/socApi';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';


const RISK_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const ACTION_COLORS = {
  clicked: '#ef4444',
  reported: '#22c55e',
  ignored: '#f59e0b',
};


export default function SocAnalytics() {
  const [analytics, setAnalytics] = useState(null);


  useEffect(() => {
    fetchAnalytics();
  }, []);


  const fetchAnalytics = async () => {
    try {
      const res = await getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };


  if (!analytics) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm">Loading analytics...</p>
          </div>
        </div>
      </MainLayout>
    );
  }


  const riskData = [
    {
      name: 'High',
      value: analytics.risk_distribution.high,
      color: RISK_COLORS.high,
    },
    {
      name: 'Medium',
      value: analytics.risk_distribution.medium,
      color: RISK_COLORS.medium,
    },
    {
      name: 'Low',
      value: analytics.risk_distribution.low,
      color: RISK_COLORS.low,
    },
  ].filter((d) => d.value > 0);


  const interactionData = Object.entries(analytics.interactions).map(
    ([action, count]) => ({
      action: action.charAt(0).toUpperCase() + action.slice(1),
      count,
      color: ACTION_COLORS[action] ?? '#6366f1',
    }),
  );


  const emailData = [
    {
      name: 'Phishing',
      value: analytics.email_distribution.phishing,
      color: '#ef4444',
    },
    {
      name: 'Safe',
      value: analytics.email_distribution.safe,
      color: '#22c55e',
    },
  ];


  const totalRisk =
    (analytics.risk_distribution.high ?? 0) +
    (analytics.risk_distribution.medium ?? 0) +
    (analytics.risk_distribution.low ?? 0);


  const totalInteractions = Object.values(analytics.interactions).reduce(
    (a, b) => a + b,
    0,
  );


  return (
    <MainLayout>
      <div className="space-y-6 p-1">
        {/* PAGE HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">SOC Analytics</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Security operations center — threat intelligence overview
            </p>
          </div>
          <div className="text-xs text-gray-600 bg-[#0f172a] border border-gray-800 px-3 py-1.5 rounded-lg">
            Live data
          </div>
        </div>


        {/* SUMMARY STAT STRIP */}
        <div className="grid grid-cols-3 gap-3">
          <StatStrip
            label="Total Users Profiled"
            value={totalRisk}
            sub="across all risk levels"
            color="text-blue-400"
          />
          <StatStrip
            label="Total Interactions"
            value={totalInteractions}
            sub="clicked · reported · ignored"
            color="text-purple-400"
          />
          <StatStrip
            label="High Risk Users"
            value={analytics.risk_distribution.high}
            sub={
              analytics.risk_distribution.high > 0
                ? 'requires attention'
                : 'all clear'
            }
            color={
              analytics.risk_distribution.high > 0
                ? 'text-red-400'
                : 'text-green-400'
            }
          />
        </div>


        {/* ROW 1 — PIE CHARTS */}
        <div className="grid grid-cols-2 gap-4">
          <ChartCard
            title="Risk Distribution"
            subtitle="Users by risk score tier"
            accent="border-l-blue-500"
          >
            {riskData.length === 0 ? (
              <EmptyState message="No risk profiles yet" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {riskData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.9} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Risk breakdown rows */}
                <div className="space-y-2 mt-2 border-t border-gray-800 pt-3">
                  {[
                    {
                      label: 'High',
                      value: analytics.risk_distribution.high,
                      color: 'bg-red-500',
                    },
                    {
                      label: 'Medium',
                      value: analytics.risk_distribution.medium,
                      color: 'bg-yellow-400',
                    },
                    {
                      label: 'Low',
                      value: analytics.risk_distribution.low,
                      color: 'bg-green-500',
                    },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center gap-3 text-xs text-gray-400"
                    >
                      <div className={`w-2 h-2 rounded-full ${r.color}`} />
                      <span className="w-14">{r.label}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${r.color} transition-all duration-700`}
                          style={{
                            width:
                              totalRisk > 0
                                ? `${(r.value / totalRisk) * 100}%`
                                : '0%',
                          }}
                        />
                      </div>
                      <span className="w-6 text-right">{r.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>


          <ChartCard
            title="Email Distribution"
            subtitle="Phishing vs safe emails sent"
            accent="border-l-purple-500"
          >
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={emailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {emailData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: '#9ca3af', fontSize: 12 }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Email stat rows */}
            <div className="space-y-2 mt-2 border-t border-gray-800 pt-3">
              {emailData.map((e) => (
                <div
                  key={e.name}
                  className="flex justify-between text-xs text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: e.color }}
                    />
                    <span>{e.name}</span>
                  </div>
                  <span className="font-semibold" style={{ color: e.color }}>
                    {e.value} emails
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>


        {/* ROW 2 — BAR CHART */}
        <ChartCard
          title="User Interactions"
          subtitle="How users responded to phishing simulations"
          accent="border-l-green-500"
        >
          {interactionData.length === 0 ? (
            <EmptyState message="No interaction data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={interactionData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="action"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: '#ffffff08' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={80}>
                  {interactionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>


        {/* ROW 3 — HIGH RISK USERS */}
        <ChartCard
          title="High Risk Users"
          subtitle="Users with risk score ≥ 70"
          accent="border-l-red-500"
        >
          {analytics.high_risk_users.length === 0 ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 text-sm">
                ✓
              </div>
              <div>
                <p className="text-sm text-white">No high risk users</p>
                <p className="text-xs text-gray-500">
                  All users are within acceptable risk thresholds
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 mt-1">
              {analytics.high_risk_users.map((u) => (
                <div
                  key={u.user_id}
                  className="flex justify-between items-center bg-[#1a1f2e] px-4 py-3 rounded-xl border border-red-900/30 hover:border-red-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar circle — initials from email */}
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-400 text-xs font-bold">
                        {u.email
                          ? u.email[0].toUpperCase()
                          : u.user_id}
                      </span>
                    </div>
                    <div>
                      {/* Primary: email, fallback to user_id */}
                      <p className="text-sm text-white font-medium">
                        {u.email || `User #${u.user_id}`}
                      </p>
                      {/* Secondary: department + risk score */}
                      <p className="text-xs text-gray-500">
                        {u.department ? `${u.department} · ` : ''}
                        Risk score: {u.risk_score} / 100
                      </p>
                    </div>
                  </div>
                  <TrendBadge trend={u.trend} />
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </MainLayout>
  );
}


// --- CUSTOM TOOLTIP ---
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400">
        {payload[0].name ?? payload[0].payload?.action}
      </p>
      <p className="text-white font-bold mt-0.5">{payload[0].value}</p>
    </div>
  );
}


// --- STAT STRIP CARD ---
function StatStrip({ label, value, sub, color }) {
  return (
    <div className="bg-[#0f172a] border border-gray-800 rounded-xl px-4 py-3">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value ?? 0}</p>
      <p className="text-gray-600 text-xs mt-0.5">{sub}</p>
    </div>
  );
}


// --- CHART CARD WRAPPER ---
function ChartCard({
  title,
  subtitle,
  accent = 'border-l-blue-500',
  children,
}) {
  return (
    <div
      className={`bg-[#0f172a] border border-gray-800 border-l-2 ${accent} p-5 rounded-xl`}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}


// --- EMPTY STATE ---
function EmptyState({ message }) {
  return (
    <div className="flex items-center justify-center h-32">
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
}


// --- TREND BADGE ---
function TrendBadge({ trend }) {
  if (!trend) return <span className="text-gray-500 text-xs">—</span>;
  const map = {
    improving: { color: 'text-green-400 bg-green-500/10', icon: '↓' },
    worsening: { color: 'text-red-400 bg-red-500/10', icon: '↑' },
    stable: { color: 'text-yellow-400 bg-yellow-500/10', icon: '→' },
    critical: { color: 'text-red-500 bg-red-500/10', icon: '⚠' },
  };
  const t = map[trend] ?? { color: 'text-gray-400 bg-gray-800', icon: '?' };
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.color}`}>
      {t.icon} {trend}
    </span>
  );
}



