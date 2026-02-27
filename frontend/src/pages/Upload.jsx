/**
 * UPLOAD PAGE (Private) — Full UI redesign with step bar, linked to backend
 * POST /videos with FormData: title, description, videoFile, thumbnail
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoApi } from '../api/video.api.js';

const TAGS = ['Tutorial', 'Vlog', 'Music', 'Gaming', 'Tech', 'Art', 'Education', 'Comedy'];

export function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [videoDrag, setVideoDrag] = useState(false);
  const [thumbDrag, setThumbDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoChosen, setVideoChosen] = useState(false);

  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const navigate = useNavigate();

  const handleVideoChange = (file) => {
    if (!file) return;
    setVideoFile(file);
    setVideoChosen(true);
  };

  const handleThumbChange = (file) => {
    if (!file) return;
    setThumbnail(file);
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!videoFile || !thumbnail) {
      setError('Video and thumbnail are required');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnail);

      await videoApi.create(formData, {
        onUploadProgress: (ev) => {
          if (ev.total) setProgress(Math.round((ev.loaded / ev.total) * 100));
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Upload failed');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const charLeft = 500 - description.length;
  const step1Done = videoChosen;
  const step2Active = step1Done;
  const step3Active = uploading;

  return (
    <div className="app-page">
      <div className="app-page-inner">
        <div className="page-eyebrow">Creator Studio</div>
        <h1 className="page-title">
          Upload Your <span className="accent">Video</span>
        </h1>

        <div className="upload-layout">
          <div className="upload-step-bar">
            <div className={`upload-step ${step1Done ? 'done' : 'active'}`}>
              <div className="step-num">1</div>
              <span className="step-label">Select File</span>
            </div>
            <div className={`upload-step ${step2Active ? 'active' : ''} ${uploading ? 'done' : ''}`}>
              <div className="step-num">2</div>
              <span className="step-label">Details</span>
            </div>
            <div className={`upload-step ${step3Active ? 'active' : ''} ${progress >= 100 ? 'done' : ''}`}>
              <div className="step-num">3</div>
              <span className="step-label">Publish</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="vt-form-error">{error}</div>}

            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              <div className="section-label">Video File</div>
              <div className="divider" />
              <div
                className={`drop-zone ${videoDrag ? 'drag' : ''}`}
                onClick={() => videoInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setVideoDrag(true); }}
                onDragLeave={() => setVideoDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setVideoDrag(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file?.type.startsWith('video/')) handleVideoChange(file);
                }}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoChange(e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
                <div className="drop-icon-wrap">🎬</div>
                <div className="drop-title">Drag & Drop your video</div>
                <div className="drop-sub">or <strong>click to browse</strong> your files</div>
                <div className="drop-formats">
                  <span className="fmt-badge">MP4</span>
                  <span className="fmt-badge">MOV</span>
                  <span className="fmt-badge">AVI</span>
                  <span className="fmt-badge">WEBM</span>
                  <span className="fmt-badge">Up to 2GB</span>
                </div>
                {videoFile && (
                  <div style={{ marginTop: 14, color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>
                    ✓ {videoFile.name}
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 28, marginBottom: 20 }}>
              <div className="section-label">Video Details</div>
              <div className="divider" />

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  className="vt-input"
                  type="text"
                  placeholder="Give your video a compelling title…"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="vt-input"
                  placeholder="Tell viewers what your video is about…"
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="char-hint" style={{ color: charLeft < 60 ? 'var(--orange)' : 'var(--muted2)' }}>
                  {charLeft} chars left
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category Tags</label>
                <div className="tag-chips">
                  {TAGS.map((t) => (
                    <span
                      key={t}
                      role="button"
                      tabIndex={0}
                      className={`chip ${selectedTags.includes(t) ? 'on' : ''}`}
                      onClick={() => toggleTag(t)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleTag(t)}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">Thumbnail *</label>
                  <div
                    className={`drop-zone ${thumbDrag ? 'drag' : ''}`}
                    style={{ padding: '24px 16px' }}
                    onClick={() => thumbInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setThumbDrag(true); }}
                    onDragLeave={() => setThumbDrag(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setThumbDrag(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file?.type.startsWith('image/')) handleThumbChange(file);
                    }}
                  >
                    <input
                      ref={thumbInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleThumbChange(e.target.files?.[0])}
                      style={{ display: 'none' }}
                    />
                    <div className="drop-icon-wrap" style={{ width: 48, height: 48, fontSize: 20, borderRadius: 12 }}>
                      🖼️
                    </div>
                    <div className="drop-title" style={{ fontSize: 14 }}>Drop thumbnail</div>
                    <div className="drop-sub">JPG · PNG · WEBP · 16:9</div>
                    {thumbnail && (
                      <div style={{ marginTop: 10, color: 'var(--green)', fontSize: 12, fontWeight: 600 }}>
                        ✓ {thumbnail.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Visibility</label>
                  <select className="vt-input" style={{ cursor: 'pointer' }} disabled>
                    <option>🌍 Public</option>
                    <option>🔒 Private</option>
                    <option>🔗 Unlisted</option>
                  </select>
                  <label className="form-label" style={{ marginTop: 12 }}>Language</label>
                  <select className="vt-input" style={{ cursor: 'pointer' }} disabled>
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>

              {uploading && (
                <div style={{ marginTop: 20 }}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Uploading…</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }} id="upPct">{progress}%</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={uploading || !title.trim() || !videoFile || !thumbnail}
            >
              🚀 &nbsp; Publish Video
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
