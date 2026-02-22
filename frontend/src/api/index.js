/**
 * API exports - single entry point for all API calls.
 * Usage: import { authApi, videoApi } from '@/api';
 */

export { authApi } from './auth.api.js';
export { videoApi } from './video.api.js';
export { commentApi } from './comment.api.js';
export { likeApi } from './like.api.js';
export { subscriptionApi } from './subscription.api.js';
export { tweetApi } from './tweet.api.js';
export { dashboardApi } from './dashboard.api.js';
export { axiosInstance, getToken, setToken, removeToken } from './axios.js';
