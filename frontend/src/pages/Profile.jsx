/**
 * PROFILE PAGE
 * GET /user/c/:username - channel profile (public)
 * Edit profile when viewing own channel (updateAccountDetails, updateUserAvatar, updateUserCoverImage)
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authApi, likeApi, subscriptionApi, videoApi } from '../api/index.js';
import { VideoCard } from '../components/VideoCard.jsx';
import { EditVideoModal } from '../components/EditVideoModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

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
      const d = res?.data ?? res; // { isSubscribed }
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

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!channel) return null;

  const isSubscribed = !!channel?.isSubscribed;
  const subscribersCount = Number(channel?.subscribersCount ?? 0) || 0;

  return (
    <div className="profile-page">
      <div className="profile-header" style={{ backgroundImage: channel.coverImage ? `url(${channel.coverImage})` : undefined }}>
        {channel.coverImage && <div className="profile-cover-overlay" />}
        <div className="profile-header-content">
          <img src={channel.avatar} alt="" className="profile-avatar" />
          <div>
            <h1>{channel.fullname ?? channel.fullName ?? channel.username}</h1>
            <p>@{channel.username}</p>
            <p>{subscribersCount} subscribers</p>
            {isOwnProfile && (
              <button onClick={() => setShowEdit(!showEdit)} className="btn-edit-profile">
                {showEdit ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
            {!isOwnProfile && isAuthenticated && (
              <div className="subscribe-wrap" style={{ marginTop: '0.75rem' }}>
                <button onClick={handleSubscribe} className={`btn-subscribe ${isSubscribed ? 'subscribed' : ''}`}>
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
                <span className="btn-count">{subscribersCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && isOwnProfile && (
        <form onSubmit={handleEditSubmit} className="profile-edit-form">
          <h3>Edit Profile</h3>
          {editError && <div className="form-error">{editError}</div>}
          <label>
            Full Name
            <input
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
          </label>
          <label className="file-label">
            New Avatar
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            />
            {avatarFile && <span className="file-hint">{avatarFile.name}</span>}
          </label>
          <label className="file-label">
            New Cover Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            />
            {coverFile && <span className="file-hint">{coverFile.name}</span>}
          </label>
          <button type="submit" disabled={editSubmitting} className="btn-upload">
            {editSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      <h2>Videos</h2>
      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} showEdit={isOwnProfile} onEdit={isOwnProfile ? setEditVideo : undefined} />
        ))}
      </div>
      {videos.length === 0 && <p>No videos yet.</p>}

      {isOwnProfile && (
        <>
          <h2 style={{ marginTop: '2rem' }}>Watch History</h2>
          {privateError && <div className="form-error">{privateError}</div>}
          <div className="video-grid">
            {watchHistory.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
          {watchHistory.length === 0 && <p>No watch history yet.</p>}

          <h2 style={{ marginTop: '2rem' }}>Liked Videos</h2>
          <div className="video-grid">
            {likedVideos.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
          {likedVideos.length === 0 && <p>No liked videos yet.</p>}
        </>
      )}

      {editVideo && (
        <EditVideoModal video={editVideo} onClose={() => setEditVideo(null)} onSaved={loadProfile} />
      )}
    </div>
  );
}
