/**
 * COMMENT API
 * Endpoints: /api/v1/comments
 * - GET /v/:videoId: public
 * - POST /v/:videoId: private
 * - PATCH /:commentId: private, body: { updatedContent }
 * - DELETE /:commentId: private
 */

import { axiosInstance } from './axios.js';

const COMMENT_BASE = '/comments';

export const commentApi = {
  getByVideoId: (videoId, params = {}) =>
    axiosInstance.get(`${COMMENT_BASE}/v/${videoId}`, { params }).then((res) => res.data),

  add: (videoId, content) =>
    axiosInstance.post(`${COMMENT_BASE}/v/${videoId}`, { content }).then((res) => res.data),

  update: (commentId, updatedContent) =>
    axiosInstance.patch(`${COMMENT_BASE}/${commentId}`, { updatedContent }).then((res) => res.data),

  delete: (commentId) =>
    axiosInstance.delete(`${COMMENT_BASE}/${commentId}`).then((res) => res.data),
};
