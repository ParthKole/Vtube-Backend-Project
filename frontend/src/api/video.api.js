/**
 * VIDEO API
 * Endpoints: /api/v1/videos
 * Note: Backend applies verifyJWT to all video routes.
 * GET /videos and GET /videos/:videoId still need token for watch history.
 * For public usage, ensure backend allows optional auth for GET if desired.
 */

import { axiosInstance } from './axios.js';

const VIDEO_BASE = '/videos';

export const videoApi = {
  /**
   * GET /videos
   * Query: page, limit, query (search), sortBy, sortType (asc|desc), userId (filter by owner)
   */
  getAll: (params = {}) =>
    axiosInstance.get(VIDEO_BASE, { params }).then((res) => res.data),

  /**
   * GET /videos/:videoId
   * Single video by ID, increments views.
   */
  getById: (videoId) =>
    axiosInstance.get(`${VIDEO_BASE}/${videoId}`).then((res) => res.data),

  /**
   * POST /videos (private)
   * FormData: title, description, videoFile (file), thumbnail (file)
   * VIDEO UPLOAD - Uses multipart/form-data for file upload to Cloudinary.
   * Optional config: { onUploadProgress } for progress bar.
   */
  create: (formData, config = {}) =>
    axiosInstance.post(VIDEO_BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...config,
    }).then((res) => res.data),

  /**
   * PATCH /videos/:videoId (private)
   * FormData: title?, description?, thumbnail? (file)
   */
  update: (videoId, formData) =>
    axiosInstance.patch(`${VIDEO_BASE}/${videoId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),

  /**
   * DELETE /videos/:videoId (private)
   */
  delete: (videoId) =>
    axiosInstance.delete(`${VIDEO_BASE}/${videoId}`).then((res) => res.data),
};
