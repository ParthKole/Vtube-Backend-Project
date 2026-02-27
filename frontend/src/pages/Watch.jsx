/**
 * VIDEO WATCH PAGE
 * GET /videos/:videoId - fetches single video
 * GET /comments/v/:videoId - fetches comments
 * POST /comments/v/:videoId - add comment (private)
 * PATCH /comments/:commentId - update comment (private)
 * DELETE /comments/:commentId - delete comment (private)
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi, videoApi, commentApi, likeApi, subscriptionApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';

// ── Helpers ────────────────────────────────────────────────────────────────
function formatCount(n) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(num);
}

// ── Inline styles injected once ────────────────────────────────────────────
const watchStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&display=swap');

  /* ── Channel action row ── */
  .watch-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem 0;
  }

  .watch-channel {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-wrap: wrap;
  }

  /* ── Subscribe pill ── */
  .subscribe-wrap {
    display: flex;
    align-items: center;
    gap: 0;
    border-radius: 999px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.35);
  }

  .btn-subscribe {
    padding: 0.5rem 1.1rem;
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.15s;
    background: #ff6a00;
    color: #fff;
    border-radius: 999px 0 0 999px;
    white-space: nowrap;
  }

  .btn-subscribe.subscribed {
    background: #232323;
    color: #aaa;
  }

  .btn-subscribe:hover:not(.subscribed) {
    background: #ff8533;
  }

  .btn-subscribe.subscribed:hover {
    background: #2e2e2e;
    color: #ccc;
  }

  /* subscriber count badge */
  .sub-count-badge {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.5rem 0.9rem 0.5rem 0.65rem;
    background: #1a1a1a;
    border-radius: 0 999px 999px 0;
    border-left: 1px solid #2a2a2a;
  }

  .sub-count-badge .sub-icon {
    width: 13px;
    height: 13px;
    color: #ff6a00;
    opacity: 0.8;
    flex-shrink: 0;
  }

  .sub-count-badge .sub-num {
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: #e0e0e0;
    letter-spacing: 0.02em;
    line-height: 1;
  }

  .sub-count-badge .sub-label {
    font-size: 0.58rem;
    color: #555;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    align-self: flex-end;
    margin-bottom: 1px;
  }

  /* ── Like button ── */
  .btn-like {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.48rem 1rem 0.48rem 0.8rem;
    border: 1.5px solid #2e2e2e;
    background: transparent;
    border-radius: 999px;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #888;
    transition: border-color 0.2s, color 0.2s, background 0.2s, box-shadow 0.2s;
  }

  .btn-like:hover {
    border-color: #ff6a00;
    color: #ff6a00;
    background: rgba(255,106,0,0.06);
  }

  .btn-like.liked {
    border-color: #ff6a00;
    background: rgba(255,106,0,0.12);
    color: #ff6a00;
    box-shadow: 0 0 0 3px rgba(255,106,0,0.08);
  }

  .btn-like .like-icon {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    transition: transform 0.2s;
  }

  .btn-like.liked .like-icon {
    transform: scale(1.2);
  }

  .like-count-num {
    min-width: 1ch;
  }
`;

function StyleInjector() {
  return <style>{watchStyles}</style>;
}

// ── Sub count badge ────────────────────────────────────────────────────────
function SubCountBadge({ count }) {
  return (
    <div className="sub-count-badge">
      <svg className="sub-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
      <span className="sub-num">{formatCount(count)}</span>
      <span className="sub-label">subs</span>
    </div>
  );
}

// ── Like button ────────────────────────────────────────────────────────────
function LikeButton({ liked, likeCount, onClick }) {
  return (
    <button onClick={onClick} className={`btn-like ${liked ? 'liked' : ''}`}>
      {liked ? (
        <svg className="like-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ) : (
        <svg className="like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      )}
      <span className="like-count-num">{formatCount(likeCount)}</span>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function Watch() {
  const { videoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [channelProfile, setChannelProfile] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const commentListRef = useRef(null);

  // ── Load video + comments ────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      videoApi.getById(videoId),
      commentApi.getByVideoId(videoId),
    ])
      .then(([videoRes, commentRes]) => {
        const v = videoRes?.data ?? videoRes;
        const c = commentRes?.data ?? commentRes;
        setVideo(v);
        setLikeCount(Number(v?.totalLikes ?? 0));
        setLiked(!!v?.isLiked);
        setComments(Array.isArray(c) ? c : []);
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [videoId]);

  // ── Load channel profile ─────────────────────────────────────────────────
  // isAuthenticated in deps → re-fetches with credentials once auth resolves
  useEffect(() => {
    if (!video?.owner?.username) return;
    authApi
      .getChannelProfile(video.owner.username)
      .then((res) => setChannelProfile(res?.data ?? res))
      .catch(() => setChannelProfile(null));
  }, [video?.owner?.username, isAuthenticated]);

  const loadComments = () => {
    commentApi
      .getByVideoId(videoId)
      .then((res) => {
        const c = res?.data ?? res;
        setComments(Array.isArray(c) ? c : []);
      })
      .catch(() => setComments([]));
  };

  // ── Like handler — clean optimistic update ───────────────────────────────
  const handleLike = async () => {
    if (!isAuthenticated) return;
    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    try {
      const res = await likeApi.toggleVideo(videoId);
      const d = res?.data ?? res;
      if (typeof d?.liked === 'boolean' && d.liked !== nextLiked) {
        setLiked(d.liked);
        setLikeCount((c) => Math.max(0, c + (d.liked ? 1 : -1)));
      }
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  // ── Subscribe handler ────────────────────────────────────────────────────
  const handleSubscribe = async () => {
    if (!isAuthenticated || !video?.owner?._id) return;
    try {
      const res = await subscriptionApi.toggle(video.owner._id);
      const d = res?.data ?? res;
      setChannelProfile((prev) => {
        const prevCount = Number(prev?.subscribersCount ?? 0) || 0;
        const nextSubscribed = !!d?.isSubscribed;
        const prevSubscribed = !!prev?.isSubscribed;
        const delta = nextSubscribed === prevSubscribed ? 0 : nextSubscribed ? 1 : -1;
        return {
          ...(prev ?? {}),
          isSubscribed: nextSubscribed,
          subscribersCount: Math.max(0, prevCount + delta),
        };
      });
    } catch {}
  };

  // ── Comment handlers ─────────────────────────────────────────────────────
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    setSubmittingComment(true);
    try {
      const res = await commentApi.add(videoId, commentText.trim());
      const created = res?.data ?? res;
      setCommentText('');
      loadComments();
      if (created?._id) {
        setNewlyAddedId(created._id);
        setTimeout(() => setNewlyAddedId(null), 3000);
      }
    } catch {}
    finally { setSubmittingComment(false); }
  };

  const handleUpdateComment = async (commentId, content) => {
    try {
      await commentApi.update(commentId, content);
      loadComments();
      setEditingCommentId(null);
      setEditContent('');
    } catch {}
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.delete(commentId);
      loadComments();
      setEditingCommentId(null);
    } catch {}
  };

  const startEdit = (c) => {
    setEditingCommentId(c._id);
    setEditContent(c.content);
  };

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error)   return <div className="page-error">{error}</div>;
  if (!video)  return null;

  const owner = video.owner;
  const videoUrl = video.videoFile?.url ?? video.videoFile;
  const isSubscribed = !!channelProfile?.isSubscribed;
  const subscribersCount = Number(channelProfile?.subscribersCount ?? 0) || 0;

  return (
    <>
      <StyleInjector />
      <div className="watch-page-wrap">
        <div className="watch-page-inner">
          <div className="watch-page">
            <div className="watch-main">
              <div className="watch-player">
                <video controls src={videoUrl} poster={video.thumbnail?.url ?? video.thumbnail} />
              </div>
              <h1 className="watch-title">{video.title}</h1>
              <div className="watch-meta">
                <span>{video.views ?? 0} views</span>
              </div>

              <div className="watch-actions">
                <div className="watch-channel">
                  <Link to={`/profile/${owner?.username}`} className="channel-link">
                    <img src={owner?.avatar} alt="" className="channel-avatar" />
                    <div>
                      <strong>{owner?.username ?? owner?.fullName}</strong>
                    </div>
                  </Link>

                  {isAuthenticated && user?._id !== owner?._id && (
                    <div className="subscribe-wrap">
                      <button
                        onClick={handleSubscribe}
                        className={`btn-subscribe ${isSubscribed ? 'subscribed' : ''}`}
                      >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </button>
                      <SubCountBadge count={subscribersCount} />
                    </div>
                  )}
                </div>

                {isAuthenticated && (
                  <LikeButton liked={liked} likeCount={likeCount} onClick={handleLike} />
                )}
              </div>

              <div className="watch-description">
                <p>{video.description}</p>
              </div>
            </div>

            <aside className="watch-comments">
              <h2>Comments</h2>
              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="comment-form">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                  />
                  <button type="submit" disabled={submittingComment}>
                    Post
                  </button>
                </form>
              ) : (
                <p className="comment-list-empty">Log in to leave a comment.</p>
              )}
              <ul className="comment-list" ref={commentListRef}>
                {comments.map((c) => (
                  <li
                    key={c._id}
                    className={`comment-item comment-main ${newlyAddedId === c._id ? 'comment-highlight' : ''}`}
                  >
                    {c.owner?.avatar ? (
                      <img src={c.owner.avatar?.url ?? c.owner.avatar} alt="" className="comment-avatar" />
                    ) : (
                      <div className="comment-avatar" style={{ background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--muted)' }}>
                        {(c.owner?.username?.[0] ?? '?').toUpperCase()}
                      </div>
                    )}
                    <div className="comment-body">
                      {editingCommentId === c._id ? (
                        <div className="comment-edit-form">
                          <input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateComment(c._id, editContent.trim());
                              if (e.key === 'Escape') setEditingCommentId(null);
                            }}
                          />
                          <div className="comment-edit-actions">
                            <button onClick={() => handleUpdateComment(c._id, editContent.trim())}>Save</button>
                            <button onClick={() => setEditingCommentId(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="comment-content">{c.content}</p>
                          <span className="comment-channel">@{c.owner?.username ?? 'Unknown'}</span>
                          {isAuthenticated && user?._id === c.owner?._id && (
                            <div className="comment-actions">
                              <button type="button" onClick={() => startEdit(c)} className="btn-comment-edit">Edit</button>
                              <button type="button" onClick={() => handleDeleteComment(c._id)} className="btn-comment-delete">Delete</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {comments.length === 0 && isAuthenticated && (
                <p className="comment-list-empty">No comments yet.</p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}