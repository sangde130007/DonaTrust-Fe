import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import AdminLayout from './components/common/AdminLayout';

/* ===== Public/Auth ===== */
import HomePage from './pages/Home';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import VerifyEmailPage from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ForgotPassword/ResetPassword';
/* ===== Common ===== */
import CampaignListPage from './pages/CampaignList';
import CampaignDetailPage from './pages/CampaignDetail';
import NotificationPage from './pages/Notification';
import DonationPage from './pages/DonationPage';
import ProfileEditPage from './pages/ProfileEdit';
import ProfileDashboardPage from './pages/ProfileDashboard';

/* ===== Registrations ===== */
import CharityRegistrationPage from './pages/CharityRegistration';
import DaoRegistrationPage from './pages/DaoRegistration';

/* ===== Admin ===== */
import { default as NewsManagement } from './pages/Admin/NewsManagement';
import CharityPending from './pages/CharityPending';
import CharityPendingDetail from './pages/CharityPending/Detail';
import CampaignPendingDetail from './pages/CampaignPendingDetail';
import Users from './pages/Users';

/* ===== Charity Dashboard ===== */
import CharityDashboard from './pages/CharityDashboard';
import CreateCampaignForm from './pages/CharityDashboard/CreateCampaignForm';
import EditCampaignForm from './pages/CharityDashboard/EditCampaignForm';

/* ===== DAO ===== */
import DaoDashboard from './pages/DaoDashboard';
import DaoPendingCampaigns from './pages/DaoPendingCampaigns';
import DaoCampaignVote from './pages/DaoCampaignVote';
import DaoMyVotes from './pages/DaoMyVotes';

// Optional 404
// import NotFoundPage from './pages/NotFound';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* === Auth (no layout) === */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* === Admin (use AdminLayout) === */}
        <Route
          path="/admin/news"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <NewsManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <Users />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/charities/pending"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <CharityPending />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/campaigns/pending"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <CharityPending />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/campaigns/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <CampaignPendingDetail />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Giữ alias route cũ nếu đang dùng */}
        <Route
          path="/charity-pending"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <CharityPending />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/charity-pending/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <CharityPendingDetail />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* === App routes with main Layout === */}
        <Route path="/" element={<Layout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="campaigns" element={<CampaignListPage />} />
          <Route path="campaign/:id" element={<CampaignDetailPage />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="donationinfor" element={<DonationPage />} />

          {/* Registrations */}
          <Route
            path="charity-registration"
            element={
              <ProtectedRoute>
                <CharityRegistrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dao-registration"
            element={
              <ProtectedRoute>
                <DaoRegistrationPage />
              </ProtectedRoute>
            }
          />

          {/* Charity Dashboard */}
          <Route
            path="charity-dashboard"
            element={
              <ProtectedRoute requiredRole="charity">
                <CharityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="charity-dashboard/create"
            element={
              <ProtectedRoute requiredRole="charity">
                <CreateCampaignForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="charity-dashboard/campaigns/:id/edit"
            element={
              <ProtectedRoute requiredRole="charity">
                <EditCampaignForm />
              </ProtectedRoute>
            }
          />

          {/* DAO */}
          <Route
            path="dao-dashboard"
            element={
              <ProtectedRoute requiredRole="dao_member">
                <DaoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dao-dashboard/pending"
            element={
              <ProtectedRoute requiredRole="dao_member">
                <DaoPendingCampaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="dao-dashboard/campaigns/:id"
            element={
              <ProtectedRoute requiredRole="dao_member">
                <DaoCampaignVote />
              </ProtectedRoute>
            }
          />
          <Route
            path="dao-dashboard/my-votes"
            element={
              <ProtectedRoute requiredRole="dao_member">
                <DaoMyVotes />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfileDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 (optional) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
