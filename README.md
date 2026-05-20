## Project name: 🚀 DevPulse – Issue & Feature Tracker API

# A backend system for managing software issues (bugs & feature requests) with role-based access control, built using Node.js, TypeScript, Express, and PostgreSQL (raw SQL).

## 📌 Live Links
🔗 Backend API: https://your-deployment-url.com
🔗 GitHub Repository: https://github.com/yourusername/devpulse
🎥 Interview Video: https://your-video-link.com
 ## 🛠️ Tech Stack
Node.js (LTS)
TypeScript
Express.js
PostgreSQL (pg driver only)
Raw SQL (no ORM / query builder)
bcrypt (password hashing)
jsonwebtoken (JWT authentication)
## ✨ Features
👤 Authentication
User registration (signup)
User login with JWT
Password hashing with bcrypt
Role-based access (contributor, maintainer)
## 🔐 Security
JWT protected routes
Role-based authorization
Secure password storage
Input validation

## 🔑 Authentication Flow
User logs in
Server returns JWT token
Client sends token in header:
Authorization: <JWT_TOKEN>
Server verifies token before protected routes


