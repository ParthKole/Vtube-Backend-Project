/**
 * HOME PAGE - Video Feed
 * Fetches videos from GET /videos (public feed)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videoApi } from '../api/video.api.js';
import { VideoCard } from '../components/VideoCard.jsx';

export function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // API call: GET /videos - fetches published videos
    // Note: Backend may require JWT for video routes. If 401, prompt login.
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

  if (loading) return <div className="page-loading">Loading videos...</div>;
  if (error) return <div className="page-error">{error} <Link to="/login">Log in</Link></div>;

  return (
    <div className="page-home">
      <h1>Discover</h1>
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>
      {videos.length === 0 && <p>No videos yet. Be the first to upload!</p>}
    </div>
  );
}
