/**
 * DASHBOARD API
 * Endpoints: /api/v1/dashboard
 * All require JWT. Returns stats for current user's channel.
 * Dashboard videos: use videoApi.getAll({ userId }) for "my videos".
 */

import { axiosInstance } from './axios.js';
import { videoApi } from './video.api.js';

const DASHBOARD_BASE = '/dashboard';

export const dashboardApi = {
  getStats: () =>
    axiosInstance.get(`${DASHBOARD_BASE}/stats`).then((res) => res.data),

  /**
   * My channel videos: uses videoApi with userId filter.
   */
  getMyVideos: (userId, params = {}) =>
    videoApi.getAll({ ...params, userId }),
};
