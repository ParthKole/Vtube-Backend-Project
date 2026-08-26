# 🚀 TweetXTube — Full-Stack Social Video Platform

TweetXTube is a **full-stack social video platform** that combines video-sharing capabilities inspired by YouTube with social interaction features inspired by Twitter.

The project focuses heavily on **backend architecture, RESTful API development, authentication, database relationships, media handling, and frontend-backend integration**, with an additional **Generative AI integration for AI-powered video summaries**.

---

## 🌐 Overview

TweetXTube allows users to:

* Create and manage their accounts
* Upload and publish videos
* Watch and interact with videos
* Like and unlike videos
* Subscribe and unsubscribe from channels
* Add, edit, and delete comments
* Maintain watch history
* View liked videos
* Create and interact with tweets
* View channel profiles and creator statistics
* Track video views and engagement
* Generate **AI-powered summaries of videos**

The application follows a **REST API-based architecture**, with React handling the frontend and Node.js/Express handling the backend.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Access token and refresh token mechanism
* Protected routes
* Secure user authorization
* User profile management
* Authentication state management using React Context API

### 🎥 Video Management

* Video upload
* Thumbnail upload
* Video publishing/unpublishing
* Video editing
* Video deletion
* Video streaming
* Automatic view tracking
* Creator-specific video listing

### ❤️ Social Interactions

* Like / Unlike videos
* Subscribe / Unsubscribe from channels
* Dynamic like counts
* Dynamic subscriber counts
* User-specific liked videos
* Channel statistics

### 💬 Comments

* Add comments
* Edit comments
* Delete comments
* Display comment authors and avatars
* User-specific comment authorization

### 📺 Watch History

* Automatically records watched videos
* Prevents duplicate history entries
* Displays personalized watch history

### 👤 Channel Profiles

Each creator has a dedicated channel profile containing:

* Profile information
* Avatar
* Cover image
* Uploaded videos
* Total views
* Total likes
* Subscriber count
* Subscription status
* Creator statistics

### 📊 Creator Dashboard

The dashboard provides channel-level analytics including:

* Total videos
* Total views
* Total likes
* Total subscribers
* Uploaded video management
* Video editing and deletion

MongoDB aggregation pipelines are used to calculate creator statistics efficiently.

### 🐦 Social / Tweet Features

Users can create and interact with short-form social content, bringing a Twitter-style experience into the video platform.

### 🤖 AI-Powered Video Summaries

TweetXTube integrates **Generative AI using the Gemini API** to generate concise summaries of video content.

The AI feature uses:

* Gemini API
* LLM-based text generation
* Prompt engineering
* REST API integration
* Structured JSON responses

The goal is to help users quickly understand video content without going through the entire video.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React.js        │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Node.js +         │
                    │    Express.js        │
                    │      Backend         │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐     ┌───────────┐    ┌────────────┐
        │ MongoDB  │     │Cloudinary │    │ Gemini API │
        │ Database │     │   Media   │    │    AI      │
        └──────────┘     │  Storage  │    └────────────┘
                         └───────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Context API
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* REST APIs

### AI

* Google Gemini API
* Generative AI
* Prompt Engineering
* LLM Integration

### Media & Storage

* Multer
* Cloudinary

### Development & Testing

* Git
* GitHub
* Postman
* VS Code

---

## 🗄️ Database Design

MongoDB is used as the primary database with Mongoose for schema modeling.

Major collections include:

```text
Users
Videos
Likes
Subscriptions
Comments
Tweets
```

Relationships between collections are handled using MongoDB references and aggregation pipelines.

For example:

```text
User
 │
 ├── Videos
 │    ├── Likes
 │    └── Comments
 │
 ├── Subscribers
 │
 ├── Subscriptions
 │
 ├── Watch History
 │
 └── Tweets
```

---

## 🔌 REST API Architecture

The backend is structured around multiple RESTful API modules.

Major API categories include:

```text
/auth
/users
/videos
/likes
/subscriptions
/comments
/tweets
/dashboard
```

The backend contains **20+ RESTful API endpoints** covering authentication, video management, social interactions, analytics, and user management.

---

## 🔑 Authentication Flow

TweetXTube uses JWT-based authentication.

```text
User Login
    ↓
Credentials Validation
    ↓
JWT Access Token + Refresh Token
    ↓
Authenticated Request
    ↓
Authentication Middleware
    ↓
Protected Controller
    ↓
Database Operation
```

Protected operations include:

* Uploading videos
* Editing videos
* Deleting videos
* Liking videos
* Subscribing to channels
* Managing comments
* Creating tweets
* Updating profiles

---

## 🤖 AI Video Summary Flow

```text
User Requests Summary
        ↓
Backend API
        ↓
Video / Transcript Data
        ↓
Prompt Construction
        ↓
Gemini API
        ↓
AI Generated Summary
        ↓
Backend Response
        ↓
React UI
```

The AI integration demonstrates how an existing full-stack application can be extended with **LLM-powered functionality** through external APIs.

---

## 📂 Project Structure

```text
TweetXTube/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   ├── db/
│   ├── app.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── context/
│   │   └── App.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/ParthKole/TweetXTube-Backend-Project.git
cd TweetXTube-Backend-Project
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend directory.

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the backend

```bash
npm run dev
```

### 5. Start the frontend

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The application will then be available through the local Vite development server.

---

## 🧪 API Testing

Postman was used extensively for:

* Authentication testing
* REST API validation
* Request/response testing
* Protected route testing
* Video API testing
* Like/subscribe workflows
* Comment APIs
* Dashboard statistics
* Error handling and debugging

---

## 🧠 Key Learning Outcomes

This project helped strengthen my understanding of:

* Designing scalable RESTful APIs
* Backend architecture with Node.js and Express
* MongoDB schema design and relationships
* MongoDB aggregation pipelines
* JWT authentication and authorization
* Middleware design
* File uploads using Multer
* Cloud media storage using Cloudinary
* React frontend architecture
* Context API and state management
* Frontend-backend synchronization
* API testing using Postman
* Debugging full-stack applications
* Integrating external APIs
* Generative AI and LLM integration
* Prompt engineering
* Building AI-powered features into existing applications

---

## 🚧 Challenges Solved

During development, several real-world full-stack problems were handled, including:

* Synchronizing like and subscription states between frontend and backend
* Maintaining accurate dynamic engagement counts
* Managing authenticated and unauthenticated API requests
* Handling media uploads and cloud storage
* Designing MongoDB aggregation pipelines for channel analytics
* Managing relationships between users, videos, likes, comments, and subscriptions
* Maintaining consistent frontend state after API mutations
* Debugging REST API responses and authentication flows
* Integrating Generative AI into an existing backend architecture

These challenges provided practical experience beyond simply implementing CRUD functionality.

---

## 🔮 Future Improvements

Potential improvements include:

* AI-based video recommendations
* Personalized content feed
* AI-powered content moderation
* Video transcript generation
* Semantic video search
* AI-based hashtag generation
* Creator analytics with interactive charts
* Notification system
* Real-time chat
* Docker-based deployment
* CI/CD pipeline
* Production monitoring and logging

---

## 📌 Project Highlights

| Category       | Implementation                   |
| -------------- | -------------------------------- |
| Architecture   | Full-Stack REST API Architecture |
| Frontend       | React.js + Vite                  |
| Backend        | Node.js + Express.js             |
| Database       | MongoDB + Mongoose               |
| Authentication | JWT                              |
| Media Upload   | Multer                           |
| Cloud Storage  | Cloudinary                       |
| AI             | Gemini API                       |
| API Testing    | Postman                          |
| API Count      | 20+ RESTful APIs                 |

---

## 👨‍💻 Author

**Parth Pradeep Kole**

B.Tech Information Technology
Pune Institute of Computer Technology (PICT), Pune

* LinkedIn: [Parth Kole](https://www.linkedin.com/in/parth-kole)
* GitHub: [ParthKole](https://github.com/ParthKole)

---

## ⭐ Acknowledgement

A special mention to **Hitesh Choudhary's "Chai aur JavaScript Backend"** YouTube series, which was an important learning resource for understanding backend architecture, Node.js, Express.js, MongoDB, authentication, and real-world backend development patterns while building this project.

---

## 📄 License

This project is developed for educational and portfolio purposes.
