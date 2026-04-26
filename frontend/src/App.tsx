import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import NewPatientPage from './pages/NewPatientPage';
import NewVisitPage from './pages/NewVisitPage';
import VisitDetailPage from './pages/VisitDetailPage';
import PatientDashboard from './pages/PatientDashboard';
import { Spinner } from 'react-bootstrap';

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles?: ('doctor' | 'patient')[];
}

function Protected({ children, allowedRoles }: ProtectedProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'doctor' ? '/dashboard' : '/patient-dashboard'} replace />;
  }

  return <Layout>{children}</Layout>;
}

// Redirect if already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to={user.role === 'doctor' ? '/dashboard' : '/patient-dashboard'} replace />;
  
  return <>{children}</>;
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Doctor Routes */}
        <Route
          path="/dashboard"
          element={
            <Protected allowedRoles={['doctor']}>
              <DashboardPage />
            </Protected>
          }
        />
        <Route
          path="/patients"
          element={
            <Protected allowedRoles={['doctor']}>
              <PatientsPage />
            </Protected>
          }
        />
        <Route
          path="/patients/new"
          element={
            <Protected allowedRoles={['doctor']}>
              <NewPatientPage />
            </Protected>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <Protected allowedRoles={['doctor']}>
              <PatientDetailPage />
            </Protected>
          }
        />
        <Route
          path="/patients/:patientId/visits/new"
          element={
            <Protected allowedRoles={['doctor']}>
              <NewVisitPage />
            </Protected>
          }
        />
        <Route
          path="/visits/:visitId"
          element={
            <Protected>
              <VisitDetailPage />
            </Protected>
          }
        />

        {/* Patient Routes */}
        <Route
          path="/patient-dashboard"
          element={
            <Protected allowedRoles={['patient']}>
              <PatientDashboard />
            </Protected>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
