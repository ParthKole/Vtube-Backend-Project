# Vtube Frontend

React frontend for the Vtube social video platform. Connects to the backend API at `http://localhost:8000/api/v1`.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Ensure your backend is running on port **8000** (or update `src/api/axios.js` base URL).

## Project Structure

```
src/
├── api/           # API layer - all backend calls
│   ├── axios.js   # Axios instance, JWT interceptor, token helpers
│   ├── auth.api.js
│   ├── video.api.js
│   ├── comment.api.js
│   ├── like.api.js
│   ├── subscription.api.js
│   ├── tweet.api.js
│   ├── dashboard.api.js
│   └── index.js
├── components/    # Reusable UI
├── context/       # AuthContext (user, login, logout)
├── pages/         # Route pages
├── routes/        # ProtectedRoute wrapper
├── App.jsx
└── main.jsx
```

## How It Connects to the Backend

### 1. Base URL & Axios Instance

`src/api/axios.js` creates an Axios instance with base URL `http://localhost:8000/api/v1`. All API calls use this instance.

### 2. Authorization Header

- **Token storage**: JWT is stored in `localStorage` under key `vtube_access_token`.
- **Request interceptor**: Before every request, the token is read and added to headers:
  ```
  Authorization: Bearer <token>
  ```
- **401 handling**: If the backend returns 401, the token is cleared and `auth:logout` is fired so AuthContext updates.

### 3. Public vs Private Routes

- **Public**: Home, Login, Register, Watch, Profile, Tweets (view). No token required for viewing.
- **Private**: Upload, Dashboard, Profile (for editing). Wrapped in `ProtectedRoute`, which redirects to `/login` if not authenticated.

### 4. Video Upload (FormData)

Video upload uses `multipart/form-data` because the backend uses Multer and uploads to Cloudinary. Example:

```javascript
const formData = new FormData();
formData.append('title', title);
formData.append('description', description);
formData.append('videoFile', videoFile);  // File object
formData.append('thumbnail', thumbnail);  // File object

await videoApi.create(formData);
```

The API sets `Content-Type: multipart/form-data` for this request (Axios sets boundary automatically).

## API Endpoints Used

| Feature     | Method | Endpoint                         | Auth  |
|------------|--------|----------------------------------|-------|
| Login      | POST   | /user/login                      | No    |
| Register   | POST   | /user/register                   | No    |
| Logout     | POST   | /user/logout                     | Yes   |
| Current    | GET    | /user/current-user               | Yes   |
| Channel    | GET    | /user/c/:username                | No    |
| Videos     | GET    | /videos                          | Yes*  |
| Video      | GET    | /videos/:id                      | Yes*  |
| Upload     | POST   | /videos                          | Yes   |
| Comments   | GET    | /comments/v/:videoId             | No    |
| Comment    | POST   | /comments/v/:videoId             | Yes   |
| Likes      | POST   | /likes/toggle/v/:videoId         | Yes   |
| Subs       | POST   | /subscriptions/c/:channelId      | Yes   |
| Tweets     | GET    | /tweets/user/:userId             | No    |
| Tweet      | POST   | /tweets                          | Yes   |
| Dashboard  | GET    | /dashboard/stats                 | Yes   |

\* Your backend applies `verifyJWT` to all video routes. If you want GET /videos to be public, consider making it optional in the backend.
