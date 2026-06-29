# 🏛️ CivicPulse: Bangalore Municipal Ward Infrastructure Ledger

## 📖 Solution Overview
CivicPulse is an advanced, full-stack collaborative civic platform designed to empower citizens and municipal ward inspectors in Bangalore by making public hazard logging transparent, gamified, and highly automated. By pairing a high-fidelity, responsive React frontend with an Express.js backend and a suite of server-side Gemini AI agents, the platform captures, cleans, classifies, and verifies public safety reports (such as potholes, malfunctioning streetlights, overflowing garbage, and broken utility pipes) in real time. It resolves standard friction in civic tracking by transforming messy raw user descriptions, photos, and voice transcripts into structured, priority-scored municipal work tickets with predicted SLA windows and automated verification workflows.

## 🚀 Key Features
*   **Geographic Ward Integration**: An interactive neighborhood-mapped dashboard scaled to Bangalore’s key zones (Koramangala, Indiranagar, Whitefield, HSR Layout), supporting manual map plotting, automated ward identification, and fallback coordinate alignments.
*   **AI-Powered Vision Classification**: Instantly analyzes submitted photos to identify public infrastructure hazards, filter out invalid/unrelated uploads (e.g., food, selfies), score priority levels (1–5), and generate SLA windows automatically.
*   **Cleansed Speech-to-Text Reporting**: Integrates a conversational voice-cleanup system that processes rough, transcribed audio inputs and parses them into concise titles and grammatically structured descriptions.
*   **Dual-Image Resolution Verification**: Empowers inspectors and wardens to submit "after" photos, which are compared side-by-side with original "before" photos using Gemini Vision models to programmatically confirm resolution before tickets are closed.
*   **Gamification & Civic Reputation**: Boosts citizen participation via an interactive Warden Leveling System, awarding contribution points (+50 for valid filings, +120 for verifying resolutions) and unlocking progressive civic advocacy badges.
*   **Automated BBMP Escalation**: Generates formal, structured escalation letters addressed to the Bruhat Bengaluru Mahanagara Palike (BBMP) Municipal Commissioner if critical municipal issues remain unaddressed beyond their calculated SLA deadlines.
*   **Real-Time Data Ledger**: Backed by a live Firestore persistence database that keeps all active complaints, user leaderboard ranks, and municipal resolution queues synchronized in real time across all active sessions.

## 🛠️ Technologies Used
*   **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, MapLibre GL
*   **Backend**: Node.js, Express.js (configured for standard container port binding `3000`), `tsx`
*   **Database**: Firebase Firestore (real-time, persistent NoSQL)
*   **Authentication**: Firebase Auth (Anonymous & Email credentials)
*   **AI Engine**: `@google/genai` SDK (leveraging `gemini-3.5-flash` model templates)
*   **Bundling & Build**: `esbuild` (bundling TypeScript into standalone, CJS-formatted output under `dist/`)

## 🔒 Security Specifications & Data Invariance
CivicPulse incorporates a zero-trust model:
1.  **User Records**: Hardened Firebase Security Rules guarantee a citizen can only modify their own `/users/{userId}` record, preventing identity or leaderboard point spoofing.
2.  **Issue Security**: `/issues/{issueId}` writes are validated; creators must match `request.auth.uid` to prevent identity spoofing, and title characters are limited to avoid wallet exhaustion attacks.
3.  **Protected API Keys**: All external API key transactions (Gemini API, Google Maps Static Key, database credentials) are executed exclusively on the Express backend, keeping client bundles pristine and secure.

## 🏁 Getting Started & Setup

### 1. Configure Secrets
Create a `.env` file in the root directory and define the following variables:
```env
# Server Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"

# Client Firebase Configuration
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"

# Google Maps Static Maps API Key (Optional)
VITE_GOOGLE_MAPS_API_KEY="your-maps-api-key"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
This boots up the Vite middleware integrated within the Express backend on Port `3000`:
```bash
npm run dev
```

### 4. Build and Compile for Production
Generates optimized static frontend assets and bundles the Node backend using `esbuild` to CJS format inside `dist/`:
```bash
npm run build
```

### 5. Start Production Server
```bash
npm run start
```

## 📋 Directory Structure
*   `server.ts` — Main Express entry point & AI Agent proxy handlers.
*   `firestore.rules` — Hardened security protocols.
*   `/src/pages` — Core interface views (Map, Report, Dashboard, Insights).
*   `/src/components` — Shared UI elements (Navbar, Error boundaries).
*   `/src/agents` — Orchestrator schedulers & analytical modules.
*   `/src/contexts` — Firebase Auth & User context management.
*   `/src/utils` — Scoring systems & helper functions.
