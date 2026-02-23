/**
 * AUTH API
 * Endpoints: /api/v1/user
 * - Login, Register: return { user, accessToken, refreshToken }
 * - Current user: returns user object
 * Token is stored in localStorage by the caller (AuthContext).
 */

import { axiosInstance, setToken, removeToken } from './axios.js';

const AUTH_BASE = '/user';

export const authApi = {
  /**
   * POST /user/login
   * Body: { username or email, password }
   * Returns: { user, accessToken, refreshToken }
   */
  login: (credentials) =>
    axiosInstance.post(`${AUTH_BASE}/login`, credentials).then((res) => res.data),

  /**
   * POST /user/register
   * FormData: fullName, email, username, password, avatar (file), coverImage (file, optional)
   * Note: Registration does not return a token - user must log in after.
   */
  register: (formData) =>
    axiosInstance.post(`${AUTH_BASE}/register`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),

  /**
   * POST /user/logout (private)
   * Clears refresh token on server. Frontend clears localStorage token.
   */
  logout: () =>
    axiosInstance.post(`${AUTH_BASE}/logout`).then((res) => {
      removeToken();
      return res.data;
    }),

  /**
   * GET /user/current-user (private)
   * Returns the authenticated user object.
   */
  getCurrentUser: () =>
    axiosInstance.get(`${AUTH_BASE}/current-user`).then((res) => res.data),

  /**
   * GET /user/c/:username (public)
   * Channel profile with subscriber count, etc.
   */
  getChannelProfile: (username) =>
    axiosInstance.get(`${AUTH_BASE}/c/${username}`).then((res) => res.data),

  /**
   * GET /user/history (private)
   * Returns watch history videos (with owner populated).
   */
  getWatchHistory: () =>
    axiosInstance.get(`${AUTH_BASE}/history`).then((res) => res.data),

  /**
   * PATCH /user/update-account (private)
   * Body: { fullName, email }
   */
  updateAccount: (fullName, email) =>
    axiosInstance.patch(`${AUTH_BASE}/update-account`, { fullName, email }).then((res) => res.data),

  /**
   * PATCH /user/avatar (private)
   * FormData: avatar (file)
   */
  updateAvatar: (formData) =>
    axiosInstance.patch(`${AUTH_BASE}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),

  /**
   * PATCH /user/cover-image (private)
   * FormData: coverImage (file)
   */
  updateCoverImage: (formData) =>
    axiosInstance.patch(`${AUTH_BASE}/cover-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),
};
