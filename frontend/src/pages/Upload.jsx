/**
 * UPLOAD PAGE (Private)
 * POST /videos with FormData
 * FormData: title, description, videoFile (file), thumbnail (file)
 * This is how video upload works: multipart/form-data for Cloudinary upload.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoApi } from '../api/video.api.js';

export function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!videoFile || !thumbnail) {
      setError('Video and thumbnail are required');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnail);

      await videoApi.create(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="upload-page">
      <form onSubmit={handleSubmit} className="upload-form">
        <h1>Upload Video</h1>
        {error && <div className="form-error">{error}</div>}
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </label>
        <label className="file-label">
          Video File
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            required
          />
        </label>
        <label className="file-label">
          Thumbnail
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
            required
          />
        </label>
        <button type="submit" disabled={submitting} className="btn-upload">
          {submitting ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}
