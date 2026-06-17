// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { logout, getUser } from "../utils/auth";
// import {
//   LayoutDashboard, Users, ShieldAlert,
//   BarChart3, LogOut, Mail, UserPlus,
//   Building2, BookOpen, ClipboardList, ScrollText
// } from "lucide-react";

// // export default function MainLayout({ children }) 
// export default function MainLayout({ children, risk }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const user = getUser();
//   const role = user?.role;

//   const handleLogout = () => { logout(); navigate("/"); };

//   const isActive = (path) =>
//     location.pathname === path
//       ? "bg-blue-600/20 text-blue-400"
//       : "text-gray-400 hover:text-white hover:bg-gray-800";

//   return (
//     <div className="flex h-screen bg-[#0a0f1c] text-white">
//       <div className="w-64 bg-[#0f172a] border-r border-gray-800 flex flex-col p-4">
//         <h1 className="text-xl font-bold mb-8 text-blue-400 tracking-wide">⚡ PhishX</h1>

//         <nav className="flex flex-col gap-2">
//           {role === "admin" && (
//             <>
//               <Link to="/admin" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin")}`}>
//                 <LayoutDashboard size={18} /> Dashboard
//               </Link>
//               <Link to="/admin/create-user" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/create-user")}`}>
//                 <UserPlus size={18} /> User Management
//               </Link>
//               <Link to="/admin/create-campaign" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/create-campaign")}`}>
//                 <Mail size={18} /> Campaigns
//               </Link>
//               <Link to="/admin/org-onboarding" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/org-onboarding")}`}>
//                 <Building2 size={18} /> Org Onboarding
//               </Link>
//               <Link to="/admin/training" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/training")}`}>
//                 <BookOpen size={18} /> Training Content
//               </Link>
//               <Link to="/admin/audit-logs" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/audit-logs")}`}>
//                 <ScrollText size={18} /> Audit Logs
//               </Link>
//             </>
//           )}

//           {role === "user" && (
//             <>
//               <Link to="/user" className={`flex items-center gap-2 p-2 rounded ${isActive("/user")}`}>
//                 <Mail size={18} /> Inbox
//               </Link>

//               {/* 🔥 TRAINING IN SIDEBAR */}
//               <Link 
//                 to="/user/training" 
//                 className="flex items-center gap-2 p-2 rounded text-gray-400 hover:text-white hover:bg-gray-800"
//               >
//                 <BookOpen size={18} />
//                 🎓 Training
//               </Link>
//             </>
//           )}


//           {role === "soc" && (
//             <>
//               <Link to="/soc" className={`flex items-center gap-2 p-2 rounded ${isActive("/soc")}`}>
//                 <ShieldAlert size={18} /> Overview
//               </Link>
//               <Link to="/soc/users" className={`flex items-center gap-2 p-2 rounded ${isActive("/soc/users")}`}>
//                 <Users size={18} /> Users Risk
//               </Link>
//               <Link to="/soc/analytics" className={`flex items-center gap-2 p-2 rounded ${isActive("/soc/analytics")}`}>
//                 <BarChart3 size={18} /> Analytics
//               </Link>
//             </>
//           )}
//         </nav>
//         {role === "user" && risk && (
//         <div className="mb-4 p-3 rounded-xl bg-[#0a0f1c] border border-gray-800">
//           <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Score</p>
//           <div className={`text-2xl font-bold ${
//             risk.risk_score > 70 ? "text-red-400" :
//             risk.risk_score > 40 ? "text-yellow-400" :
//             "text-green-400"
//           }`}>
//             {risk.risk_score ?? "—"}
//             <span className="text-sm font-normal text-gray-500"> / 100</span>
//           </div>
//           <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
//             risk.risk_level === "High" ? "bg-red-600/20 text-red-400" :
//             risk.risk_level === "Medium" ? "bg-yellow-600/20 text-yellow-400" :
//             "bg-green-600/20 text-green-400"
//           }`}>
//             {risk.risk_level}
//           </span>
//         </div>
//       )}
//         <button onClick={handleLogout}
//           className="mt-auto flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 p-2 rounded">
//           <LogOut size={18} /> Logout
//         </button>
//       </div>

//       <div className="flex-1 flex flex-col">
//         <div className="h-14 border-b border-gray-800 flex items-center px-6 bg-[#0f172a]">
//           <h2 className="text-sm text-gray-400">
//             Logged in as <span className="text-blue-400">{user?.email}</span>
//           </h2>
//         </div>
//         <div className="flex-1 p-6 overflow-y-auto">{children}</div>
//       </div>
//     </div>
//   );
// }

import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, getUser } from "../utils/auth";
import {
  LayoutDashboard, Users, ShieldAlert,
  BarChart3, LogOut, Mail, UserPlus,
  Building2, BookOpen, ClipboardList, ScrollText
} from "lucide-react";

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const role = user?.role;

  const handleLogout = () => { logout(); navigate("/"); };

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-600/20 text-blue-400"
      : "text-gray-400 hover:text-white hover:bg-gray-800";

  return (
    <div className="flex h-screen bg-[#0a0f1c] text-white">
      <div className="w-64 bg-[#0f172a] border-r border-gray-800 flex flex-col p-4">
        <h1 className="text-xl font-bold mb-8 text-blue-400 tracking-wide">⚡ PhishX</h1>

        <nav className="flex flex-col gap-2">
          {role === "admin" && (
            <>
              <Link to="/admin" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin")}`}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/admin/create-user" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/create-user")}`}>
                <UserPlus size={18} /> User Management
              </Link>
              <Link to="/admin/create-campaign" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/create-campaign")}`}>
                <Mail size={18} /> Campaigns
              </Link>
              <Link to="/admin/org-onboarding" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/org-onboarding")}`}>
                <Building2 size={18} /> Org Onboarding
              </Link>
              <Link to="/admin/training" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/training")}`}>
                <BookOpen size={18} /> Training Content
              </Link>
              <Link to="/admin/audit-logs" className={`flex items-center gap-2 p-2 rounded ${isActive("/admin/audit-logs")}`}>
                <ScrollText size={18} /> Audit Logs
              </Link>
            </>
          )}

          {role === "user" && (
            <>
              <Link to="/user" className={`flex items-center gap-2 p-2 rounded ${isActive("/user")}`}>
                <Mail size={18} /> Inbox
              </Link>
              <Link
                to="/user/training"
                className={`flex items-center gap-2 p-2 rounded ${isActive("/user/training")}`}
              >
                <BookOpen size={18} /> 🎓 Training
              </Link>
            </>
          )}

          {role === "soc" && (
            <>
              <Link to="/soc" className={`flex items-center gap-2 p-2 rounded ${isActive("/soc")}`}>
                <ShieldAlert size={18} /> Overview
              </Link>
              <Link to="/soc/users" className={`flex items-center gap-2 p-2 rounded ${isActive("/soc/users")}`}>
                <Users size={18} /> Users Risk
              </Link>
              <Link to="/soc/analytics" className={`flex items-center gap-2 p-2 rounded ${isActive("/soc/analytics")}`}>
                <BarChart3 size={18} /> Analytics
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 p-2 rounded"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-gray-800 flex items-center px-6 bg-[#0f172a]">
          <h2 className="text-sm text-gray-400">
            Logged in as <span className="text-blue-400">{user?.email}</span>
          </h2>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}