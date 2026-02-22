/**
 * SUBSCRIPTION API
 * Endpoints: /api/v1/subscriptions
 * - POST /c/:channelId: toggle subscribe (private)
 * - GET /me: my subscribed channels (private)
 * - GET /c/:channelId/subscribers: public
 */

import { axiosInstance } from './axios.js';

const SUB_BASE = '/subscriptions';

export const subscriptionApi = {
  toggle: (channelId) =>
    axiosInstance.post(`${SUB_BASE}/c/${channelId}`).then((res) => res.data),

  getMySubscriptions: () =>
    axiosInstance.get(`${SUB_BASE}/me`).then((res) => res.data),

  getSubscribers: (channelId, params = {}) =>
    axiosInstance.get(`${SUB_BASE}/c/${channelId}/subscribers`, { params }).then((res) => res.data),
};
