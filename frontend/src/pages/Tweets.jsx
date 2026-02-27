/**
 * TWEETS PAGE — Full UI redesign, linked to backend
 * tweetApi.getAll, tweetApi.create, tweetApi.delete
 */

import { useEffect, useState } from 'react';
import { tweetApi } from '../api/tweet.api.js';
import { useAuth } from '../context/AuthContext.jsx';

const TWEET_MAX = 280;

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
      const t = res?.data?.tweets ?? res?.tweets ?? [];
      setTweets(Array.isArray(t) ? t : []);
    } catch (err) {
      console.error('Failed to load tweets', err);
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
      loadTweets();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (tweetId, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      await tweetApi.delete(tweetId);
      loadTweets();
    } catch (err) {
      console.error(err);
    }
  };

  const charLeft = TWEET_MAX - content.length;
  const charColor = charLeft < 40 ? 'var(--red)' : charLeft < 80 ? 'var(--orange)' : 'var(--muted)';

  return (
    <div className="app-page">
      <div className="app-page-inner">
        <div className="page-eyebrow">Community</div>
        <h1 className="page-title">
          All <span className="accent">Tweets</span>
        </h1>

        <div className="tweets-layout">
          <div>
            {isAuthenticated && (
              <div className="card compose-card">
                <form onSubmit={handleCreate}>
                  <div className="compose-top">
                    <div className="compose-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" />
                      ) : (
                        (user?.username?.[0] ?? '?').toUpperCase()
                      )}
                    </div>
                    <textarea
                      className="compose-input"
                      placeholder="What's on your mind?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      maxLength={TWEET_MAX}
                      rows={3}
                    />
                  </div>
                  <div className="compose-bottom">
                    <div className="compose-tools">
                      <span className="compose-tool" title="Image">🖼️</span>
                      <span className="compose-tool" title="GIF">GIF</span>
                      <span className="compose-tool" title="Emoji">😊</span>
                      <span className="compose-tool" title="Link">🔗</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="char-ring" style={{ color: charColor }}>
                        {charLeft}
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={submitting || !content.trim()}>
                        Post
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="page-loading">Loading tweets...</div>
            ) : (
              <div id="tweets-feed">
                {tweets.map((t) => (
                  <div key={t._id} className="card tweet-card">
                    <div className="tweet-header">
                      <div className="tweet-avatar">
                        {t.owner?.avatar ? (
                          <img src={t.owner.avatar} alt="" />
                        ) : (
                          (t.owner?.username?.[0] ?? t.owner?.fullName?.[0] ?? '?').toUpperCase()
                        )}
                      </div>
                      <div className="tweet-user">
                        <div className="tweet-name">
                          {t.owner?.fullName ?? t.owner?.fullname ?? t.owner?.username ?? 'Unknown'}
                        </div>
                        <div className="tweet-handle">@{t.owner?.username ?? 'unknown'}</div>
                      </div>
                      <div className="tweet-time">
                        {t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <div className="tweet-body">{t.content}</div>
                    <div className="tweet-actions">
                      <span className="tweet-action">💬 0</span>
                      <span className="tweet-action">🔁 Retweet</span>
                      <span className="tweet-action">🤍 0</span>
                      {isAuthenticated && user?._id === t.owner?._id && (
                        <button
                          type="button"
                          className="tweet-action"
                          onClick={(e) => handleDelete(t._id, e)}
                          style={{ color: 'var(--red)' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && tweets.length === 0 && (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>
                No tweets yet.
              </p>
            )}
          </div>

          <div>
            <div className="card trend-card">
              <div className="trend-title">🔥 Trending</div>
              <div className="trend-item">
                <span className="trend-tag">#VtubeCreators</span>
                <span className="trend-count">12.4K</span>
              </div>
              <div className="trend-item">
                <span className="trend-tag">#Tutorial2026</span>
                <span className="trend-count">8.1K</span>
              </div>
              <div className="trend-item">
                <span className="trend-tag">#NightOwl</span>
                <span className="trend-count">5.6K</span>
              </div>
              <div className="trend-item">
                <span className="trend-tag">#LoFiBeats</span>
                <span className="trend-count">3.9K</span>
              </div>
              <div className="trend-item">
                <span className="trend-tag">#CodeLife</span>
                <span className="trend-count">2.2K</span>
              </div>
            </div>
            <div className="spacer" />
            <div className="card" style={{ padding: '20px 22px' }}>
              <div className="trend-title">💡 Who to Follow</div>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                Suggestions based on your activity will appear here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
