import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import JobApplications from '@/pages/JobApplications';
import Profile from '@/pages/Profile';
import Layout from '@/components/Layout';
import AddApplication from '@/pages/AddApplication';
import { authClient } from '@/lib/auth-client.ts';

function App() {
  const { data: userData, error, isPending } = authClient.useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleLogin = () => {};

  const handleLogout = () => {
    localStorage.removeItem('authToken');
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              userData ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/register"
            element={
              userData ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register onRegister={handleLogin} />
              )
            }
          />
          <Route
            path="/"
            element={
              userData ? (
                <Layout onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="applications" element={<JobApplications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="applications/add" element={<AddApplication />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
