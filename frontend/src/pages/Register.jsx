/**
 * REGISTER PAGE
 * POST /user/register with FormData
 * Fields: fullName, email, username, password, avatar (file), coverImage (file, optional)
 * Backend requires avatar. coverImage is optional.
 */

import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
    background-image:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(255,90,0,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(255,60,0,0.05) 0%, transparent 60%);
    padding: 2rem 1rem;
    font-family: 'DM Sans', sans-serif;
  }

  .auth-form {
    width: 100%;
    max-width: 480px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .auth-form h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 8vw, 4.5rem);
    letter-spacing: 0.04em;
    color: #fff;
    margin: 0 0 2rem 0;
    line-height: 1;
  }

  .auth-error {
    background: rgba(255, 60, 60, 0.12);
    border: 1px solid rgba(255, 60, 60, 0.35);
    color: #ff6b6b;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .auth-form input[type="text"],
  .auth-form input[type="email"],
  .auth-form input[type="password"] {
    width: 100%;
    padding: 0.9rem 1.1rem;
    background: #161616;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .auth-form input[type="text"]::placeholder,
  .auth-form input[type="email"]::placeholder,
  .auth-form input[type="password"]::placeholder {
    color: #555;
  }

  .auth-form input[type="text"]:focus,
  .auth-form input[type="email"]:focus,
  .auth-form input[type="password"]:focus {
    border-color: #ff6a00;
    background: #1a1512;
    box-shadow: 0 0 0 3px rgba(255, 106, 0, 0.1);
  }

  /* ── Upload Cards ─────────────────────────────── */
  .upload-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .upload-card {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    border: 1.5px dashed #2e2e2e;
    background: #111;
    transition: border-color 0.2s, background 0.2s;
    aspect-ratio: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .upload-card:hover {
    border-color: #ff6a00;
    background: #161210;
  }

  .upload-card.has-file {
    border-style: solid;
    border-color: #ff6a00;
  }

  .upload-card input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .upload-preview {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }

  .upload-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: 12px;
  }

  .upload-card.has-file:hover .upload-overlay {
    opacity: 1;
  }

  .upload-icon {
    width: 36px;
    height: 36px;
    color: #ff6a00;
    transition: transform 0.2s;
  }

  .upload-card:hover .upload-icon {
    transform: translateY(-2px);
  }

  .upload-label-text {
    font-size: 0.78rem;
    font-weight: 500;
    color: #888;
    text-align: center;
    line-height: 1.3;
    padding: 0 0.5rem;
    pointer-events: none;
    transition: color 0.2s;
  }

  .upload-card:hover .upload-label-text {
    color: #bbb;
  }

  .upload-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #ff6a00;
    color: #fff;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 7px;
    border-radius: 20px;
    letter-spacing: 0.03em;
    pointer-events: none;
    text-transform: uppercase;
  }

  .upload-filename {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.75);
    backdrop-filter: blur(4px);
    padding: 0.35rem 0.5rem;
    font-size: 0.7rem;
    color: #ccc;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
    pointer-events: none;
  }

  .upload-check {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 20px;
    height: 20px;
    background: #ff6a00;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .upload-check svg {
    width: 11px;
    height: 11px;
    color: #fff;
  }

  /* ── Submit Button ────────────────────────────── */
  .auth-submit {
    margin-top: 0.5rem;
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%);
    color: #fff;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.25rem;
    letter-spacing: 0.1em;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 24px rgba(255, 106, 0, 0.25);
  }

  .auth-submit:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 6px 30px rgba(255, 106, 0, 0.35);
  }

  .auth-submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .auth-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .auth-form > p {
    text-align: center;
    color: #555;
    font-size: 0.875rem;
    margin-top: 1.25rem;
  }

  .auth-form > p a {
    color: #ff6a00;
    text-decoration: none;
    font-weight: 500;
  }

  .auth-form > p a:hover {
    text-decoration: underline;
  }

  .divider {
    height: 1px;
    background: #1e1e1e;
    margin: 0.25rem 0 1rem;
  }

  .upload-section-label {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #444;
    margin-bottom: 0.5rem;
  }
`;

function UploadIcon() {
  return (
    <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function UploadCard({ label, badge, file, onChange, required, accept = "image/*" }) {
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className={`upload-card ${file ? 'has-file' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        required={required}
      />

      {previewUrl ? (
        <>
          <img src={previewUrl} alt="preview" className="upload-preview" />
          <div className="upload-overlay">
            <UploadIcon />
            <span className="upload-label-text">Change</span>
          </div>
          <div className="upload-check"><CheckIcon /></div>
          <div className="upload-filename">{file.name}</div>
        </>
      ) : (
        <>
          <UploadIcon />
          <span className="upload-label-text">{label}</span>
        </>
      )}

      <span className="upload-badge">{badge}</span>
    </div>
  );
}

export function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!avatar) {
      setError('Avatar is required');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('fullName', form.fullName);
      fd.append('email', form.email);
      fd.append('username', form.username);
      fd.append('password', form.password);
      fd.append('avatar', avatar);
      if (coverImage) fd.append('coverImage', coverImage);

      await register(fd);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <form onSubmit={handleSubmit} className="auth-form">
          <h1>Register</h1>

          {error && <div className="auth-error">{error}</div>}

          <div className="field-group">
            <input
              name="fullName"
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="divider" />
          <p className="upload-section-label">Profile Images</p>

          <div className="upload-section">
            <UploadCard
              label="Upload Avatar"
              badge="Required"
              file={avatar}
              onChange={setAvatar}
              required
            />
            <UploadCard
              label="Cover Image"
              badge="Optional"
              file={coverImage}
              onChange={setCoverImage}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Registering...' : 'Register'}
          </button>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </>
  );
}