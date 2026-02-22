/**
 * DASHBOARD PAGE (Private)
 * GET /dashboard/stats - channel stats
 * My videos via dashboardApi.getMyVideos(userId)
 * Edit video via PATCH /videos/:videoId
 */

import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboard.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { VideoCard } from '../components/VideoCard.jsx';
import { EditVideoModal } from '../components/EditVideoModal.jsx';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editVideo, setEditVideo] = useState(null);

  const loadData = () => {
    if (!user?._id) return;
    setLoading(true);
    Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getMyVideos(user._id),
    ])
      .then(([statsRes, videosRes]) => {
        const s = statsRes?.data ?? statsRes;
        const v = videosRes?.data ?? videosRes;
        setStats(s);
        setVideos(Array.isArray(v) ? v : []);
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user?._id]);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      {stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.totalVideos ?? 0}</span>
            <span className="stat-label">Videos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalViews ?? 0}</span>
            <span className="stat-label">Views</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalLikes ?? 0}</span>
            <span className="stat-label">Likes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalSubscribers ?? 0}</span>
            <span className="stat-label">Subscribers</span>
          </div>
        </div>
      )}
      <h2>My Videos</h2>
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} showEdit onEdit={setEditVideo} />
        ))}
      </div>
      {videos.length === 0 && <p>No videos yet. <a href="/upload">Upload one</a></p>}
      {editVideo && (
        <EditVideoModal
          video={editVideo}
          onClose={() => setEditVideo(null)}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
