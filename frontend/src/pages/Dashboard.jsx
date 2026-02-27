/**
 * DASHBOARD PAGE (Private) — Full UI redesign, linked to backend
 * GET /dashboard/stats, videoApi.getAll({ userId }), PATCH /videos/:videoId
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../api/dashboard.api.js';
import { videoApi } from '../api/video.api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { EditVideoModal } from '../components/EditVideoModal.jsx';

const CHART_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDuration(sec) {
  if (!sec) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

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

  if (loading) {
    return (
      <div className="app-page">
        <div className="app-page-inner">
          <div className="page-loading">Loading...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app-page">
        <div className="app-page-inner">
          <div className="page-error">{error}</div>
        </div>
      </div>
    );
  }

  const chartData = [8, 14, 6, 22, 10, 34, 16];
  const maxV = Math.max(...chartData, 1);

  return (
    <div className="app-page">
      <div className="app-page-inner">
        <div className="page-eyebrow">Your Studio</div>
        <h1 className="page-title">
          Dashboard <span className="accent">Overview</span>
        </h1>

        <div className="stat-grid">
          <div
            className="card stat-card"
            style={{ '--stat-color': '#ff6400', '--stat-glow': 'rgba(255,100,0,.12)' }}
          >
            <span className="stat-icon">🎬</span>
            <div className="stat-val">{stats?.totalVideos ?? 0}</div>
            <div className="stat-lbl">Videos</div>
            <div className="stat-change">Your uploads</div>
          </div>
          <div
            className="card stat-card"
            style={{ '--stat-color': '#3ddcff', '--stat-glow': 'rgba(61,220,255,.08)' }}
          >
            <span className="stat-icon">👁️</span>
            <div className="stat-val">{stats?.totalViews ?? 0}</div>
            <div className="stat-lbl">Total Views</div>
            <div className="stat-change">All time</div>
          </div>
          <div
            className="card stat-card"
            style={{ '--stat-color': '#ff4757', '--stat-glow': 'rgba(255,71,87,.08)' }}
          >
            <span className="stat-icon">❤️</span>
            <div className="stat-val">{stats?.totalLikes ?? 0}</div>
            <div className="stat-lbl">Total Likes</div>
            <div className="stat-change">On your videos</div>
          </div>
          <div
            className="card stat-card"
            style={{ '--stat-color': '#3ddc84', '--stat-glow': 'rgba(61,220,132,.08)' }}
          >
            <span className="stat-icon">👥</span>
            <div className="stat-val">{stats?.totalSubscribers ?? 0}</div>
            <div className="stat-lbl">Subscribers</div>
            <div className="stat-change">Channel</div>
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-head">
            <div className="chart-title">📈 Views This Week</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-orange">This week</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,.05)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                Last week
              </span>
            </div>
          </div>
          <div className="chart-body">
            {chartData.map((v, i) => (
              <div key={i} className="bar-group">
                <div
                  className="bar-fill"
                  style={{ height: `${(v / maxV) * 130}px` }}
                  title={`${v} views`}
                />
                <div className="bar-label">{CHART_DAYS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sec-head" style={{ marginBottom: 16 }}>
          <div className="sec-title">My Videos</div>
          <Link to="/upload" className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>
            + Upload New
          </Link>
        </div>

        <div id="dash-videos">
          {videos.map((v) => {
            const thumb = v?.thumbnail?.url ?? v?.thumbnail;
            return (
              <div key={v._id} className="manage-row">
                <div className="manage-thumb">
                  {thumb ? (
                    <img src={thumb} alt="" />
                  ) : (
                    '🎬'
                  )}
                </div>
                <div className="manage-info">
                  <div className="manage-title">{v.title}</div>
                  <div className="manage-meta">
                    {v.views ?? 0} views · {formatDuration(v.duration)}
                  </div>
                </div>
                <div className="manage-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    title="Edit"
                    onClick={() => setEditVideo(v)}
                  >
                    ✏️
                  </button>
                  <a href={`/watch/${v._id}`} className="icon-btn" title="Watch">
                    ▶️
                  </a>
                  <button
                    type="button"
                    className="icon-btn del"
                    title="Delete"
                    onClick={() => {
                      if (window.confirm('Delete this video?')) {
                        videoApi.delete(v._id).then(loadData).catch(console.error);
                      }
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {videos.length === 0 && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>
            No videos yet. <Link to="/upload" style={{ color: 'var(--orange)' }}>Upload one</Link>
          </p>
        )}

        {editVideo && (
          <EditVideoModal
            video={editVideo}
            onClose={() => setEditVideo(null)}
            onSaved={loadData}
          />
        )}
      </div>
    </div>
  );
}
