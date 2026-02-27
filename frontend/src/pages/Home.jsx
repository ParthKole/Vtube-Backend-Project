/**
 * HOME PAGE — Full UI redesign, linked to backend
 * GET /videos - fetches published videos
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videoApi } from '../api/video.api.js';
import { VideoCard } from '../components/VideoCard.jsx';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tutorial', label: '🎬 Tutorial' },
  { id: 'music', label: '🎵 Music' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'art', label: '🎨 Art' },
  { id: 'education', label: '📚 Education' },
  { id: 'comedy', label: '😂 Comedy' },
];

export function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCat, setActiveCat] = useState('all');

  useEffect(() => {
    videoApi
      .getAll({ limit: 20 })
      .then((res) => {
        const data = res?.data ?? res;
        setVideos(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        const msg = err.response?.data?.message ?? 'Failed to load videos';
        if (err.response?.status === 401) {
          setError('Please log in to browse videos.');
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-page"><div className="app-page-inner"><div className="page-loading">Loading videos...</div></div></div>;
  if (error) {
    return (
      <div className="app-page">
        <div className="app-page-inner">
          <div className="page-error">
            {error} <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="app-page-inner">
        <div className="page-eyebrow">Welcome back</div>
        <h1 className="page-title">
          Discover <span className="accent">Amazing</span> Videos
        </h1>

        <div className="home-hero">
          <div className="hero-label">
            <div className="hero-dot" /> TRENDING NOW
          </div>
          <div className="hero-title">
            What will you create today?
            <br />
            Your audience is waiting.
          </div>
          <div className="hero-sub">
            Upload your first video, explore trending content, and connect with creators worldwide.
          </div>
          <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/upload" className="btn btn-primary">
              🚀 Upload Video
            </Link>
            <button type="button" className="btn btn-ghost">
              🔥 Explore Trending
            </button>
          </div>
        </div>

        <div className="cat-row">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cat-pill ${activeCat === c.id ? 'active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="sec-head">
          <div className="sec-title">Trending Videos</div>
          <div className="sec-more">View all →</div>
        </div>
        <div className="video-grid">
          {videos.map((v, i) => (
            <VideoCard
              key={v._id}
              video={v}
              style={{ animationDelay: `${0.3 + i * 0.05}s` }}
            />
          ))}
        </div>
        {videos.length === 0 && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>
            No videos yet. Be the first to upload!
          </p>
        )}
      </div>
    </div>
  );
}
