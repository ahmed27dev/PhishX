import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import CreateUserPage from "./pages/CreateUserPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import SocDashboard from "./pages/SocDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SocUsers from "./pages/SocUsers";
import SocAnalytics from "./pages/SocAnalytics";
import OrgOnboardingPage from "./pages/OrgOnboardingPage";
import TrainingManagementPage from "./pages/TrainingManagementPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import AuditLogPage from "./pages/AuditLogPage";
import TrainingPage from "./pages/TrainingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* ADMIN */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/create-user" element={<ProtectedRoute role="admin"><CreateUserPage /></ProtectedRoute>} />
        <Route path="/admin/create-campaign" element={<ProtectedRoute role="admin"><CreateCampaignPage /></ProtectedRoute>} />
        <Route path="/admin/org-onboarding" element={<ProtectedRoute role="admin"><OrgOnboardingPage /></ProtectedRoute>} />
        <Route path="/admin/training" element={<ProtectedRoute role="admin"><TrainingManagementPage /></ProtectedRoute>} />
        <Route path="/admin/campaigns/:id/detail" element={<ProtectedRoute role="admin"><CampaignDetailPage /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute role="admin"><AuditLogPage /></ProtectedRoute>} />

        {/* USER */}
        <Route path="/user" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/training" element={<ProtectedRoute role="user"><TrainingPage /></ProtectedRoute>} />

        {/* SOC */}
        <Route path="/soc" element={<ProtectedRoute role="soc"><SocDashboard /></ProtectedRoute>} />
        <Route path="/soc/users" element={<ProtectedRoute role="soc"><SocUsers /></ProtectedRoute>} />
        <Route path="/soc/analytics" element={<ProtectedRoute role="soc"><SocAnalytics /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;