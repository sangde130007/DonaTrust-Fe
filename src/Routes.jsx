import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import AdminLayout from './components/common/AdminLayout';
import CharityDashboard from './pages/CharityDashboard'; // Đảm bảo đường dẫn đúng
import CreateCampaignForm from './pages/CharityDashboard/CreateCampaignForm';
import EditCampaignForm from './pages/CharityDashboard/EditCampaignForm';
import AdminCharityApprovals from './pages/admin/AdminCharityApprovals';

// Import page components
import HomePage from './pages/Home';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import CharityRegistrationPage from './pages/CharityRegistration';
import CampaignDetailPage from './pages/CampaignDetail';
import DaoRegistrationPage from './pages/DaoRegistration';
import CampaignListPage from './pages/CampaignList';
import ProfileEditPage from './pages/ProfileEdit';
import ProfileDashboardPage from './pages/ProfileDashboard';
import VerifyEmailPage from './pages/VerifyEmail';
import { default as NewsManagement } from './pages/Admin/NewsManagement';
import CharityPendingPage from './pages/CharityPending';
import { CampaignDetail } from './pages/CharityPending';
import Users from './pages/Users';
import DaoDashboard from './pages/DaoDashboard';
import DaoPendingCampaigns from './pages/DaoPendingCampaigns';
import DaoMyVotes from './pages/DaoMyVotes';
import DaoCampaignVote from './pages/DaoCampaignVote';
import NotificationPage from './pages/Notification';
import DonationPage from './pages/DonationPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* Pending Charity Campaigns */}
        <Route
          path="/charity-pending"
          element={
            <Layout>
              <CharityPendingPage />
            </Layout>
          }
          requiredRole="admin"
        />
        <Route
          path="/dao-dashboard"
          element={
            <Layout>
              <DaoDashboard />
            </Layout>
          }
          requiredRole="dao_member"
        />
        <Route
          path="/dao/campaigns/pending"
          element={
            <Layout>
              <DaoPendingCampaigns />
            </Layout>
          }
          requiredRole="dao_member"
        />
        <Route
          path="/dao/my-votes"
          element={
            <Layout>
              <DaoMyVotes />
            </Layout>
          }
          requiredRole="dao_member"
        />
        <Route
          path="/dao/campaigns/:id"
          element={
            <Layout>
              <DaoCampaignVote />
            </Layout>
          }
          requiredRole="dao_member"
        />
        <Route
          path="/charity-pending/:id"
          element={
            <Layout>
              <CampaignDetail />
            </Layout>
          }
          requiredRole="admin"
        />

        {/* Routes with layout */}
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="campaigns" element={<CampaignListPage />} />
          <Route path="campaign/:id" element={<CampaignDetailPage />} />
          <Route path="notification" element={<NotificationPage />} />
          <Route path="donation/:id" element={<DonationPage />} />

          
          {/* Protected routes - require authentication */}
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
          <Route
            path="profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfileDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin routes */}
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
          path="/charity-dashboard/*"
          element={
            <ProtectedRoute requiredRole="charity">
              <Layout>
                <CharityDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/charity-dashboard/create"
          element={
            <ProtectedRoute requiredRole="charity">
              <Layout>
                <CreateCampaignForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Layout />}>
 
  <Route
    path="charity-dashboard/campaigns/:id/edit"
    element={
      <ProtectedRoute requiredRole="charity">
        <EditCampaignForm />
      </ProtectedRoute>
    }
  />
  <Route path="/admin/charities/pending" element={<AdminCharityApprovals />} />

</Route>

      </Routes>

    </Router>

  );
};

export default AppRoutes;
