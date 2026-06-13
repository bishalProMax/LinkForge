# 🔗 LinkForge

<div align="center">

<img src="https://res.cloudinary.com/bishal101/image/upload/v1780194540/LinkForge_jwecgh.png" width="220" alt="LinkForge Logo"/>

### A Production-Ready URL Management Platform

Built with high-performance Node.js, TypeScript, Redis, BullMQ and modern security best practices.

<p align="center">
  <a href="https://github.com/bishalProMax/LinkForge/issues">
    <img src="https://img.shields.io/github/issues/bishalProMax/LinkForge?style=for-the-badge&color=blue" alt="Issues" />
  </a>
  <a href="https://github.com/bishalProMax/LinkForge/pulls">
    <img src="https://img.shields.io/github/issues-pr/bishalProMax/LinkForge?style=for-the-badge&color=green" alt="Pull Requests" />
  </a>
  <a href="https://github.com/bishalProMax/LinkForge/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/bishalProMax/LinkForge?style=for-the-badge&color=orange" alt="License" />
  </a>
</p>

</div>

---

## 🚀 Overview

LinkForge is a production-ready URL shortening and management platform built with TypeScript, Express.js, MongoDB, Redis, and BullMQ. Users can create short URLs, generate QR codes, and monitor link activity through a modern dashboard.

---

## ✨ Features

- **🔗 URL Shortening & Management**: Create, organize and manage short URLs through a centralized dashboard.
- **📱 QR Code Generation**: Generate QR codes instantly, download them as PNG files, and share them directly from the browser.
- **📊 URL Analytics**: Track clicks and monitor link activity with IP logging from your dashboard.
- **🔐 Secure Authentication**: JWT-based authentication with protected routes and persistent login sessions.
- **🌐 Google OAuth Login**: Sign in seamlessly using Google accounts.
- **📧 Email Verification**: Verify accounts securely through email-based confirmation links.
- **🔑 Password Recovery**: OTP-based password reset flow with secure verification and session handling.
- **🛡️ Advanced Security Controls**: Redis-backed rate limiting, login throttling, OTP limits, cooldowns and abuse prevention.
- **🤖 Bot Protection**: Cloudflare Turnstile integration to prevent automated attacks and spam registrations.
- **⚡ Background Job Processing**: Email delivery and maintenance tasks powered by BullMQ and Redis workers.
- **🎨 Responsive UI**: Clean, mobile-friendly interface built with EJS and Vanilla JavaScript.
- **🏗️ Scalable Architecture**: Layered architecture using Controllers, Services, Repositories and Background Workers for maintainability and future growth.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Runtime** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) |
| **Framework** | ![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white) |
| **Database** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat) |
| **Cache & Queue** | ![Redis](https://img.shields.io/badge/Redis-DD0031?style=flat&logo=redis&logoColor=white) ![BullMQ](https://img.shields.io/badge/BullMQ-orange?style=flat) |
| **Authentication** | ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=jsonwebtokens) ![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat&logo=google&logoColor=white) |
| **Frontend** | ![EJS](https://img.shields.io/badge/EJS-B4CA65?style=flat) |
| **Cloud & Storage** | ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white) |
| **Security** | ![Helmet](https://img.shields.io/badge/Helmet-000000?style=flat) ![Cloudflare Turnstile](https://img.shields.io/badge/Turnstile-F38020?style=flat&logo=cloudflare&logoColor=white) |

---

## 🏗️ System Architecture

LinkForge is split into four focused architecture views. Each one covers a different layer of the system.

---

### 🗺️ System Overview

```mermaid
graph LR
    User([👤 User])
    Landing[Landing Page]
    Auth[Login / Signup]
    Dashboard[Dashboard]

    User --> Landing
    Landing --> Auth
    Auth --> Dashboard

    Dashboard --> URL[Shorten URL]
    Dashboard --> QR[Generate QR Code]
    Dashboard --> Analytics[View Analytics]

    URL --> Redirect[Short URL Redirect]
    Redirect --> Destination[Original Website]
```

---

### 🔐 Authentication & Security

```mermaid
graph LR
    User([👤 User])

    User --> Signup[Signup]
    User --> Login[Login]

    Signup --> Turnstile[Cloudflare Turnstile]
    Login  --> Validate

    Turnstile --> Validate[Input Validation\nZod Middleware]
    Validate  --> Controllers[Controllers]

    Controllers --> Services[Services]
    Controllers --> JWT[JWT Token]

    Services --> Redis[(Redis)]

    Redis --> RateLimit[Rate Limiting]
    Redis --> LoginThrottle[Login Throttle]
    Redis --> OTP[OTP]

    JWT --> Protected[Protected Routes]
```

---

### ⚙️ Backend Layer

```mermaid
graph LR
    Request[Incoming Request]

    Request --> Routes[Routes]
    Routes  --> Middleware[Middleware\nAuth · Validation · Helmet]

    Middleware --> Controllers[Controllers]
    Controllers --> Services[Services]
    Services --> Repositories[Repositories]

    Repositories --> MongoDB[(MongoDB)]
    Services     --> Redis[(Redis)]
```

---

### 📧 Background Jobs & Email Queue

```mermaid
graph LR
    Trigger[User Action\ne.g. Signup · Password Reset]
    Server[Server Startup]

    Trigger --> EmailQueue[Email Queue]
    Server  --> CleanupQueue[Cleanup Queue]

    EmailQueue   --> BullMQ[BullMQ]
    CleanupQueue --> BullMQ

    BullMQ --> Redis[(Redis)]

    BullMQ --> EmailWorker[Email Worker]
    BullMQ --> CleanupWorker[Cleanup Worker]

    EmailWorker   --> SMTP[SMTP / Nodemailer]
    CleanupWorker --> MongoDB[(MongoDB)]
```

---

## 📁 Project Structure

```text
LinkForge/
├── src/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── public/
│   ├── queues/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── templates/
│   ├── types/
│   ├── utils/
│   ├── views/
│   ├── workers/
│   ├── app.ts
│   └── server.ts
└── package.json
```

---

## 🔑 Environment Variables

| Variable | Purpose |
| :--- | :--- |
| `PORT` | Application Port |
| `MONGODB_URI` | MongoDB Database |
| `JWT_SECRET` | JWT Authentication |
| `JWT_EXPIRES` | Token Expiration |
| `NODE_ENV` | Environment Mode |
| `BASE_URL` | Application URL |
| `REDIS_URI` | Redis Connection |
| `EMAIL_USER` | SMTP Username |
| `EMAIL_PASS` | SMTP Password |
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GOOGLE_CALLBACK_URL` | OAuth Callback |
| `TURNSTILE_SITE_KEY` | Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile |

---

## 🚀 Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/bishalProMax/LinkForge.git
cd LinkForge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file and configure all required environment variables.

### 4. Start Development Server

```bash
npm run dev
```

### 5. Production Build

```bash
npm run build
npm run start
```

### Useful Scripts

```bash
npm run dev        # Development mode
npm run build      # Compile TypeScript
npm run start      # Run production build
npm run prod       # Build and start
npm run lint       # Check code quality
npm run lint-fix   # Automatically fix lint issues
```

---

## 📄 License

Distributed under the MIT License.

---

<div align="center">
Developed by <a href="https://github.com/bishalProMax">Bishal Nandi </a> with ❤️
</div>
