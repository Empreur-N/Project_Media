import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ArticleDetail from './pages/ArticleDetail';
import JournalistSpace from './pages/JournalistSpace';
import EditorSpace from './pages/EditorSpace';
import Search from './pages/Search';
import CommentModeration from './pages/CommentModeration';
import Podcasts from './pages/Podcasts';
import LiveStream from './pages/LiveStream';
import ManagePodcasts from './pages/ManagePodcasts';
import ManageLives from './pages/ManageLives';
import ManageAds from './pages/ManageAds';
import ManageUsers from './pages/ManageUsers';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import AudioPlayer from './components/AudioPlayer';
import Footer from './components/Footer';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import FloatingLivePlayer from './components/FloatingLivePlayer';
import BreakingNewsBanner from './components/BreakingNewsBanner';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { DataSaverProvider } from './contexts/DataSaverContext';
import { TimezoneProvider } from './contexts/TimezoneContext';

// Composant pour protéger les routes selon l'authentification et les rôles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Chargement du profil...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (user.role === 'USER') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <DataSaverProvider>
        <TimezoneProvider>
          <AudioPlayerProvider>
            <AuthProvider>
              <Router>
          <div className="app-container">
            <BreakingNewsBanner />
            <Navbar />
            <main className="main-content">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/articles/:id" element={<ArticleDetail />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/podcasts" element={<Podcasts />} />
                  <Route path="/live" element={<LiveStream />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/log" element={<Login />} />
                  <Route path="/staff" element={<Login />} />
                  <Route path="/admin/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/aide" element={<Help />} />
                  <Route path="/faq" element={<Help />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/journalist" 
                    element={
                      <ProtectedRoute allowedRoles={['JOURNALIST', 'ADMIN', 'SUPER_ADMIN']}>
                        <JournalistSpace />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/editor" 
                    element={
                      <ProtectedRoute allowedRoles={['EDITOR', 'ADMIN', 'SUPER_ADMIN']}>
                        <EditorSpace />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/comments" 
                    element={
                      <ProtectedRoute allowedRoles={['EDITOR', 'ADMIN', 'SUPER_ADMIN']}>
                        <CommentModeration />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/podcasts" 
                    element={
                      <ProtectedRoute allowedRoles={['JOURNALIST', 'EDITOR', 'ADMIN', 'SUPER_ADMIN', 'SUPERVISOR']}>
                        <ManagePodcasts />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/lives" 
                    element={
                      <ProtectedRoute allowedRoles={['JOURNALIST', 'EDITOR', 'ADMIN', 'SUPER_ADMIN', 'SUPERVISOR']}>
                        <ManageLives />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/ads" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'SUPERVISOR']}>
                        <ManageAds />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/users" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                        <ManageUsers />
                      </ProtectedRoute>
                    } 
                  />
                   <Route path="*" element={<NotFound />} />
                 </Routes>
               </ErrorBoundary>
            </main>
            <Footer />
            <AudioPlayer />
            <FloatingLivePlayer />
          </div>
        </Router>
      </AuthProvider>
    </AudioPlayerProvider>
  </TimezoneProvider>
</DataSaverProvider>
</ToastProvider>
  );
}

export default App;
