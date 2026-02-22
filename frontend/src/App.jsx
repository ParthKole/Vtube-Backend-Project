/**
 * APP - Main router
 * Defines all routes. ProtectedRoute wraps private pages.
 */

import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Watch } from './pages/Watch.jsx';
import { Upload } from './pages/Upload.jsx';
import { Profile } from './pages/Profile.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Tweets } from './pages/Tweets.jsx';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/watch/:videoId" element={<Watch />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/tweets" element={<Tweets />} />

        {/* Protected routes - require JWT */}
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
