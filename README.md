# 🛡️ Agent Identity Manager (AIM)
> Enterprise-grade Machine Identity & Access Management (IAM) for Autonomous AI Agents.

## 📌 Problem Statement & Context
When a human joins a company, they receive a managed identity: a user account, role, access scope, and review cadence. When an AI agent is deployed, it typically receives a permanent, over-privileged API key with no role, no scope, no review, and no expiry.

**AIM solves this by treating Machine Identities with the same zero-trust rigor as human accounts.**

## 🌟 Key Features & Architecture
- **JWT (OIDC-Compliant) Credentials:** Cryptographically signed tokens using `jsonwebtoken` with `sub`, `exp`, and `scopes` claims.
- **Role-Based Scope Enforcement:** Zero-trust authorization middleware (`POST /api/simulator/execute`). Read-only tokens return `403 Forbidden` on write attempts.
- **Active Threat Mitigation (Anomaly Detection):** Automatically suspends agents and revokes credentials if >= 5 unauthorized scope attempts occur in 10 seconds (`423 Locked`).
- **Automated Key Rotation:** Instant revocation of old tokens upon issuing new time-bounded credentials.
- **Quarterly Access Review & Stale Detection:** Flags active agents with >= 30 days of inactivity.
- **Embedded AI Support Agent:** A Groq-powered (Llama 3.3 70B) personalized support chatbot embedded across the platform.
- **Dev-Clock Time Travel:** Simulates +35-day time jumps (`POST /api/dev-clock/advance`) to test auto-expiry and stale detection in real-time.

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
- **Backend:** Node.js, Express, TypeScript, `better-sqlite3`, `jsonwebtoken`, `helmet`, `express-rate-limit`, `groq-sdk`.
- **Database:** Persistent SQLite (`./data/aim-database.sqlite`).

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Running Locally
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd Agent_IAM
   ```

2. Install dependencies:
   ```bash
   npm install
   cd aim-backend && npm install
   cd ../aim-frontend && npm install
   cd ..
   ```

3. Configure Environment Variables:
   Create an `.env` file in the `aim-backend` directory with the following variables:
   ```env
   PORT=4000
   DB_PATH=./data/aim-database.sqlite
   NODE_ENV=development
   GROQ_API_KEY=your_groq_api_key_here
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. Start the Application:
   Run the following command from the root directory to concurrently start the backend and frontend dev servers:
   ```bash
   npm run dev
   ```

### Production Build & Deployment
To create a single-artifact production build where the Express backend serves the statically compiled Vite frontend, simply run:
```bash
npm run start
```
The application will be compiled and available at `http://localhost:4000`.
