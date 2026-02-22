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
import { videoApi, commentApi, likeApi, subscriptionApi } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';

export function Watch() {
  const { videoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const commentListRef = useRef(null);

  const loadVideo = () => {
    videoApi
      .getById(videoId)
      .then((res) => {
        const v = res?.data ?? res;
        setVideo(v);
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Video not found'));
  };

  const loadComments = () => {
    commentApi
      .getByVideoId(videoId)
      .then((res) => {
        const c = res?.data ?? res;
        setComments(Array.isArray(c) ? c : []);
      })
      .catch(() => setComments([]));
  };

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
        setComments(Array.isArray(c) ? c : []);
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [videoId]);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await likeApi.toggleVideo(videoId);
      const d = res?.data ?? res;
      setLiked(d?.liked ?? !liked);
    } catch {}
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated || !video?.owner?._id) return;
    try {
      await subscriptionApi.toggle(video.owner._id);
      loadVideo();
    } catch {}
  };

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
    finally {
      setSubmittingComment(false);
    }
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
  if (error) return <div className="page-error">{error}</div>;
  if (!video) return null;

  const owner = video.owner;
  const videoUrl = video.videoFile?.url ?? video.videoFile;

  return (
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
              <button onClick={handleSubscribe} className="btn-subscribe">
                Subscribe
              </button>
            )}
          </div>
          {isAuthenticated && (
            <button onClick={handleLike} className={`btn-like ${liked ? 'liked' : ''}`}>
              {liked ? 'Liked' : 'Like'}
            </button>
          )}
        </div>
        <div className="watch-description">
          <p>{video.description}</p>
        </div>
      </div>

      <aside className="watch-comments">
        <h2>Comments</h2>
        {isAuthenticated && (
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
        )}
        <ul className="comment-list" ref={commentListRef}>
          {comments.map((c) => (
            <li
              key={c._id}
              className={`comment-item comment-main ${newlyAddedId === c._id ? 'comment-highlight' : ''}`}
            >
              <img src={c.owner?.avatar} alt="" className="comment-avatar" />
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
                        <button onClick={() => startEdit(c)} className="btn-comment-edit">Edit</button>
                        <button onClick={() => handleDeleteComment(c._id)} className="btn-comment-delete">Delete</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
        {comments.length === 0 && <p>No comments yet.</p>}
      </aside>
    </div>
  );
}
