# Healthcare PWA

A Progressive Web App for traveling doctors to manage patient records offline. Works without internet. Syncs to server when online. Sensitive medical fields are AES-encrypted before storage.

## Features

*   **Offline-First:** All CRUD operations work offline using IndexedDB (`idb`).
*   **Background Sync:** Automatic syncing of queued operations when the network connection is restored.
*   **AES-GCM Encryption:** Symptoms, diagnosis, treatment, and notes are encrypted client-side using a PBKDF2 derived key from the user's Firebase UID.
*   **PWA:** Installable, responsive, mobile-first design using Tailwind CSS.
*   **Authentication:** Firebase email/password authentication.
*   **Backend:** Node.js + Express backend with MongoDB Atlas.

## Tech Stack

**Frontend:**
*   React 18
*   TypeScript
*   Vite
*   Tailwind CSS v3
*   Vite PWA plugin (Workbox)
*   IndexedDB (idb)
*   Web Crypto API (AES-GCM, 256-bit)
*   Firebase Authentication

**Backend:**
*   Node.js
*   Express
*   TypeScript
*   MongoDB Atlas (Mongoose)
*   Firebase Admin SDK

## Project Setup

### 1. Prerequisites

*   Node.js (v18+)
*   MongoDB Atlas cluster
*   Firebase Project (Web app + Authentication enabled)

### 2. Environment Variables

**Frontend (`frontend/.env`)**
Create a `.env` file in the `frontend/` directory using `.env.example` as a template and fill in your Firebase project details.
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:3001
```

**Backend (`backend/.env`)**
Create a `.env` file in the `backend/` directory using `.env.example` as a template and fill in your MongoDB URI and Firebase Admin credentials.
```env
MONGODB_URI=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=3001
```

### 3. Installation & Running

**Start Backend Server:**
```bash
cd backend
npm install
npm run dev
```

**Start Frontend Server:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.
The backend will be available at `http://localhost:3001`.

## Encryption Details
*   Encryption key is derived from the Firebase UID using PBKDF2 (100,000 iterations).
*   Key is stored in `sessionStorage` as an exported JWK and cleared on logout.
*   Encrypted fields are stored in the database in the format `iv_base64:ciphertext_base64`.

## Offline Sync
*   Reads prioritize the network. If the API request fails (or if offline), data is fetched from IndexedDB.
*   Writes are always saved locally first. If the API request fails, the action is queued in the `syncQueue` IndexedDB store.
*   When the network status changes to online, the queued actions are processed sequentially.
