/**
 * LIKE API
 * Endpoints: /api/v1/likes
 * All routes require JWT.
 */

import { axiosInstance } from './axios.js';

const LIKE_BASE = '/likes';

export const likeApi = {
  toggleVideo: (videoId) =>
    axiosInstance.post(`${LIKE_BASE}/toggle/v/${videoId}`).then((res) => res.data),

  toggleComment: (commentId) =>
    axiosInstance.post(`${LIKE_BASE}/toggle/c/${commentId}`).then((res) => res.data),

  toggleTweet: (tweetId) =>
    axiosInstance.post(`${LIKE_BASE}/toggle/t/${tweetId}`).then((res) => res.data),

  getLikedVideos: () =>
    axiosInstance.get(`${LIKE_BASE}/videos`).then((res) => res.data),
};
