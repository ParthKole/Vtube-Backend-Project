/**
 * TWEET API
 * Endpoints: /api/v1/tweets
 * - POST /: private
 * - GET /user/:userId: public
 * - PATCH /:tweetId, DELETE /:tweetId: private
 */

import { axiosInstance } from './axios.js';

const TWEET_BASE = '/tweets';

export const tweetApi = {
  create: (content) =>
    axiosInstance.post(TWEET_BASE, { content }).then((res) => res.data),

  getAll: (params = {}) =>
    axiosInstance.get(TWEET_BASE, { params }).then((res) => res.data),

  getByUserId: (userId, params = {}) =>
    axiosInstance.get(`${TWEET_BASE}/user/${userId}`, { params }).then((res) => res.data),

  update: (tweetId, content) =>
    axiosInstance.patch(`${TWEET_BASE}/${tweetId}`, { content }).then((res) => res.data),

  delete: (tweetId) =>
    axiosInstance.delete(`${TWEET_BASE}/${tweetId}`).then((res) => res.data),
};
