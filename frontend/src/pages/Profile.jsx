/**
 * PROFILE PAGE — Full UI redesign, linked to backend
 * GET /user/c/:username, videoApi, watch history, liked, subscription, edit
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authApi, likeApi, subscriptionApi, videoApi } from '../api/index.js';
import { VideoCard } from '../components/VideoCard.jsx';
import { EditVideoModal } from '../components/EditVideoModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TABS = [
  { id: 'videos', label: 'Videos' },
  { id: 'history', label: 'Watch History' },
  { id: 'liked', label: 'Liked' },
  { id: 'about', label: 'About' },
];

export function Profile() {
  const { username } = useParams();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [privateError, setPrivateError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [showEdit, setShowEdit] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editVideo, setEditVideo] = useState(null);

  const isOwnProfile = isAuthenticated && user?.username?.toLowerCase() === username?.toLowerCase();

  const loadProfile = () => {
    if (!username) return Promise.resolve();
    return authApi
      .getChannelProfile(username)
      .then((res) => {
        const c = res?.data ?? res;
        setChannel(c);
        setEditFullName(c?.fullName ?? c?.fullname ?? '');
        setEditEmail(c?.email ?? '');
        
        return c?._id ? videoApi.getAll({ userId: c._id }) : Promise.resolve({ data: [] });
      })
      .then((videoRes) => {
        const v = videoRes?.data ?? videoRes;
        setVideos(Array.isArray(v) ? v : []);
      })
      .catch((err) => setError(err.response?.data?.message ?? 'Profile not found'));
  };

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    loadProfile().finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!isOwnProfile || !isAuthenticated) {
      setWatchHistory([]);
      setLikedVideos([]);
      setPrivateError('');
      return;
    }
    setPrivateError('');
    Promise.all([authApi.getWatchHistory(), likeApi.getLikedVideos()])
      .then(([historyRes, likedRes]) => {
        const h = historyRes?.data ?? historyRes;
        const l = likedRes?.data ?? likedRes;
        setWatchHistory(Array.isArray(h) ? h : []);
        setLikedVideos(Array.isArray(l) ? l : []);
      })
      .catch((err) => setPrivateError(err.response?.data?.message ?? 'Failed to load private data'));
  }, [isOwnProfile, isAuthenticated, channel?._id]);

  useEffect(() => {
    if (showEdit && channel) {
      setEditFullName(channel.fullName ?? channel.fullname ?? '');
      setEditEmail(channel.email ?? '');
    }
  }, [showEdit, channel]);

  const handleSubscribe = async () => {
    if (!isAuthenticated || isOwnProfile || !channel?._id) return;
    try {
      const res = await subscriptionApi.toggle(channel._id);
      const d = res?.data ?? res;
      setChannel((prev) => {
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    try {
      if (editFullName && editEmail) {
        const res = await authApi.updateAccount(editFullName.trim(), editEmail.trim());
        const updated = res?.data ?? res;
        if (updated) setChannel((prev) => ({ ...prev, ...updated }));
        await refreshUser();
      }
      if (avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        const res = await authApi.updateAvatar(fd);
        const updated = res?.data ?? res;
        if (updated) setChannel((prev) => ({ ...prev, avatar: updated.avatar }));
        await refreshUser();
        setAvatarFile(null);
      }
      if (coverFile) {
        const fd = new FormData();
        fd.append('coverImage', coverFile);
        const res = await authApi.updateCoverImage(fd);
        const updated = res?.data ?? res;
        if (updated) setChannel((prev) => ({ ...prev, coverImage: updated.coverImage }));
        await refreshUser();
        setCoverFile(null);
      }
      if (editFullName && editEmail) setShowEdit(false);
    } catch (err) {
      setEditError(err.response?.data?.message ?? 'Update failed');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) return <div className="app-page"><div className="app-page-inner"><div className="page-loading">Loading...</div></div></div>;
  if (error) return <div className="app-page"><div className="app-page-inner"><div className="page-error">{error}</div></div></div>;
  if (!channel) return null;

  const isSubscribed = !!channel?.isSubscribed;
  const subscribersCount = Number(channel?.subscribersCount ?? 0) || 0;
  const videoCount = videos.length;

  return (
    <div className="app-page">
      <div className="app-page-inner">
        <div className="profile-banner" style={channel.coverImage ? { backgroundImage: `url(${channel.coverImage?.url ?? channel.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          <div className="profile-banner-inner" />
        </div>

        <div className="profile-header">
          <div className="profile-pic-wrap">
            <div className="profile-pic">
              {channel.avatar ? (
                <img src={channel.avatar?.url ?? channel.avatar} alt="" />
              ) : (
                (channel.username?.[0] ?? '?').toUpperCase()
              )}
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-name">
              {channel.fullName ?? channel.fullname ?? channel.username}
            </div>
            <div className="profile-handle">
              @{channel.username} · Joined {channel.createdAt ? new Date(channel.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
            </div>
            <div className="profile-stats">
              <div className="pstat">
                <div className="pstat-val">{videoCount}</div>
                <div className="pstat-lbl">Videos</div>
              </div>
              <div className="pstat">
                <div className="pstat-val">{channel.totalViews ?? 0}</div>
                <div className="pstat-lbl">Views</div>
              </div>
              <div className="pstat">
                <div className="pstat-val">{subscribersCount}</div>
                <div className="pstat-lbl">Subscribers</div>
              </div>
              <div className="pstat">
                <div className="pstat-val">{channel.totalLikes ?? 0}</div>
                <div className="pstat-lbl">Likes</div>
              </div>
            </div>
          </div>
          {isOwnProfile && (
            <button type="button" className="btn btn-ghost" style={{ flexShrink: 0 }} onClick={() => setShowEdit(!showEdit)}>
              ✏️ Edit Profile
            </button>
          )}
          {!isOwnProfile && isAuthenticated && (
            <button
              type="button"
              className={`btn ${isSubscribed ? 'btn-ghost' : 'btn-primary'}`}
              style={{ flexShrink: 0 }}
              onClick={handleSubscribe}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>

        {showEdit && isOwnProfile && (
          <div className="card" style={{ padding: 32, marginBottom: 28 }}>
            <div className="section-label">Edit Profile</div>
            <div className="divider" />
            <form onSubmit={handleEditSubmit} className="edit-layout">
              <div>
                <div className="card avatar-upload-zone">
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    <div className="avatar-big">
                      {channel.avatar ? (
                        <img src={channel.avatar?.url ?? channel.avatar} alt="" />
                      ) : (
                        (channel.username?.[0] ?? '?').toUpperCase()
                      )}
                      <div className="avatar-overlay">📷</div>
                    </div>
                    <div className="avatar-hint">Click to change photo · JPG, PNG · Max 5MB</div>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <div style={{ fontFamily: 'var(--font-disp)', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{channel.username}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                @{channel.username}
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <span className="badge badge-green">✅ Verified Creator</span>
                  </div>
                </div>
                <div className="spacer" />
                <div className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ fontFamily: 'var(--font-disp)', fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Cover Image</div>
                  <label className="drop-zone" style={{ padding: '20px 14px', borderRadius: 12, cursor: 'pointer', display: 'block' }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                    />
                    <div className="drop-icon-wrap" style={{ width: 40, height: 40, fontSize: 18, borderRadius: 10, marginBottom: 8 }}>🏞</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>Click to upload cover · Recommended: 1280×360</div>
                    {coverFile && <div style={{ marginTop: 8, color: 'var(--green)', fontSize: 12 }}>✓ {coverFile.name}</div>}
                  </label>
                </div>
              </div>
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="vt-input" type="text" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input className="vt-input" type="text" value={channel.username} disabled />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="vt-input" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
                </div>
                {editError && <div className="vt-form-error">{editError}</div>}
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="submit" className="btn btn-primary" disabled={editSubmitting}>
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancel</button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="profile-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`p-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'videos' && (
          <div className="video-grid">
            {videos.map((v) => (
              <VideoCard key={v._id} video={v} showEdit={isOwnProfile} onEdit={isOwnProfile ? setEditVideo : undefined} />
            ))}
          </div>
        )}
        {activeTab === 'videos' && videos.length === 0 && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No videos yet.</p>
        )}

        {activeTab === 'history' && isOwnProfile && (
          <>
            {privateError && <div className="vt-form-error">{privateError}</div>}
            <div className="video-grid">
              {watchHistory.map((v) => (
                <VideoCard key={v._id} video={v} />
              ))}
            </div>
            {watchHistory.length === 0 && (
              <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No watch history yet.</p>
            )}
          </>
        )}
        {activeTab === 'history' && !isOwnProfile && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Sign in to view watch history.</p>
        )}

        {activeTab === 'liked' && isOwnProfile && (
          <div className="video-grid">
            {likedVideos.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
            {likedVideos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>❤️</div>
                <div style={{ fontFamily: 'var(--font-disp)', fontSize: 18, color: '#fff', marginBottom: 8 }}>No liked videos yet</div>
                <div>Videos you like will appear here.</div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'liked' && !isOwnProfile && (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Sign in to view liked videos.</p>
        )}

        {activeTab === 'about' && (
          <div className="card" style={{ padding: 28, maxWidth: 560 }}>
            <div style={{ marginBottom: 16 }}>
              <div className="section-label">About</div>
              <div className="divider" />
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, lineHeight: 1.7 }}>
                {channel.username} on Vtube. Thanks for checking out this channel!
              </p>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span className="badge badge-orange">📍 Creator</span>
              <span className="badge badge-green">✅ Active</span>
            </div>
          </div>
        )}

        {editVideo && (
          <EditVideoModal video={editVideo} onClose={() => setEditVideo(null)} onSaved={loadProfile} />
        )}
      </div>
    </div>
  );
}
