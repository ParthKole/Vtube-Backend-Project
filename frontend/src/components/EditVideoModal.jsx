/**
 * EDIT VIDEO MODAL
 * PATCH /videos/:videoId - title, description, thumbnail
 */

import { useState, useEffect } from 'react';
import { videoApi } from '../api/video.api.js';

export function EditVideoModal({ video, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const v = video?.data ?? video;

  useEffect(() => {
    if (v) {
      setTitle(v.title ?? '');
      setDescription(v.description ?? '');
    }
  }, [v]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!v?._id) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      if (thumbnail) formData.append('thumbnail', thumbnail);
      await videoApi.update(v._id, formData);
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!v) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Video</h2>
        <form onSubmit={handleSubmit} className="upload-form">
          {error && <div className="form-error">{error}</div>}
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </label>
          <label className="file-label">
            New Thumbnail (optional)
            <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)} />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-upload">
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
