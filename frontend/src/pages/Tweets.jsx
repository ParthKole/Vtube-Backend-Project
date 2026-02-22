import { useEffect, useState } from 'react';
import { tweetApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';

export function Tweets() {
  const { user, isAuthenticated } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadTweets = async () => {
    setLoading(true);
    try {
      const res = await tweetApi.getAll({ page: 1, limit: 20 });

      // because your backend returns:
      // { data: { tweets, totalTweets, totalPages, currentPage } }
      const t = res?.data?.tweets ?? [];
      setTweets(Array.isArray(t) ? t : []);
    } catch (error) {
      console.error("Failed to load tweets", error);
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTweets();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;

    setSubmitting(true);
    try {
      await tweetApi.create(content.trim());
      setContent('');
      loadTweets(); // reload all tweets
    } catch {}
    finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tweetId) => {
    try {
      await tweetApi.delete(tweetId);
      loadTweets();
    } catch {}
  };

  return (
    <div className="tweets-page">
      <h1>All Tweets</h1>

      {isAuthenticated && (
        <form onSubmit={handleCreate} className="tweet-form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
          />
          <button type="submit" disabled={submitting}>
            Post
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="tweet-list">
          {tweets.map((t) => (
            <li key={t._id} className="tweet-item">
              <p>{t.content}</p>
              <small>
                {t.owner?.fullname} (@{t.owner?.username})
              </small>
              <br />
              <small>
                {new Date(t.createdAt).toLocaleString()}
              </small>

              {isAuthenticated && t.owner?._id === user?._id && (
                <div>
                  <button onClick={() => handleDelete(t._id)}>
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {!loading && tweets.length === 0 && <p>No tweets yet.</p>}
    </div>
  );
}