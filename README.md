# Smartphone Fundus Camera & AI-Ready Teleophthalmology Platform

A production-ready React Native (TypeScript) application designed for a smartphone-attached fundus camera (ophthalmoscope). The system provides offline-first patient registration, advanced clinic camera workflows (with precise zoom and flash adjustments), secure local image metadata persistence, and an Express/PostgreSQL/Prisma backend architecture for future cloud synchronization.

---

## 🏗️ Architecture & Features

### 1. Mobile Application (React Native + TypeScript)
- **Offline-First Patient Management**: Local database storage to register and keep patient details securely.
- **Advanced Camera Controls**: Fully integrated custom controls for `react-native-vision-camera`, allowing clinical operators to adjust **Zoom (1x to 5x)** and **Flash settings (On / Off / Auto)** to capture high-definition fundus images.
- **Eye-Side Labeling**: Explicit, automated, or manual labeling of captured fundus images as Left Eye (OS) or Right Eye (OD).
- **Zustand State Store**: High-performance lightweight client state manager.

### 2. Synchronization Backend (Express + TypeScript + Prisma + PostgreSQL)
- **Automatic Migration**: Leverages Prisma ORM to auto-model the PostgreSQL schemas.
- **RESTful Synchronization**: Synchronizes patient metadata, test sessions, and captured images securely.
- **AI Hook Preparation**: Clean endpoints and hook templates designed to easily integrate future cloud-based or local AI engines for deblurring, quality-score estimation, and contrast optimization.

---

## 📁 Repository Directory Structure

```text
├── src/                    # React Native Mobile App Frontend
│   ├── components/         # Reusable UI controls (Buttons, Overlays, etc.)
│   ├── screens/            # Application Screens (Camera, Session, Patient, Settings)
│   ├── navigation/         # React Navigation stacks (AppNavigator)
│   ├── database/           # SQLite native database adapters & schema
│   ├── services/           # File storage and API network synchronizer
│   └── store/              # Zustand global state management
├── backend/                # Backend API Service
│   ├── prisma/             # Schema definitions and migrations (PostgreSQL)
│   ├── src/                # Express controllers and endpoint routes
│   └── Dockerfile          # Multi-stage production container image config
├── App.tsx                 # App entry point
├── package.json            # Frontend dependency specifications
├── docker-compose.yml      # Orchestration file for Backend + PostgreSQL Database
└── README.md               # You are here!
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for backend containerization)
- [React Native CLI Environment](https://reactnative.dev/docs/environment-setup) (Xcode for iOS / Android Studio for Android)

---

## 🐳 Running the Backend (via Docker Compose)

The easiest way to run the entire backend server along with a clean PostgreSQL instance is via Docker Compose:

1. **Start the containers:**
   From the repository root directory, run:
   ```bash
   docker compose up --build
   ```

2. **What this does:**
   - Starts a PostgreSQL database instance mapping port `5432`.
   - Starts the Node/Express backend at `http://localhost:3000`.
   - Automatically builds the TypeScript files.
   - Applies the database schema to your PostgreSQL database using `prisma db push`.

3. **Stop the containers:**
   ```bash
   docker compose down
   ```

---

## ⚙️ Running the Backend Locally (Without Docker)

If you prefer to run the Node/Express backend directly on your host machine:

1. **Setup your environment:**
   Create a `.env` file in the `backend/` folder (refer to `backend/.env.example`):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fundus_db?schema=public"
   PORT=3000
   ```

2. **Install dependencies & build:**
   ```bash
   cd backend
   npm install
   ```

3. **Sync your database schema & start the dev server:**
   ```bash
   npx prisma db push
   npm run dev
   ```

---

## 📱 Running the Mobile App

1. **Install root dependencies:**
   From the root folder, run:
   ```bash
   npm install
   ```

2. **iOS Setup (macOS only):**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Start the bundler:**
   ```bash
   npm start
   ```

4. **Launch the simulator/emulator:**
   * **Android:** Run `npm run android`
   * **iOS:** Run `npm run ios`

---

## 💾 Syncing Mobile Captures to Backend

The mobile client is designed to persist images locally inside the application directory. When an active network connection is detected or when the user triggers the "Sync" action:
1. The app iterates through pending local captures.
2. Calls `POST /api/sync/patient`, `POST /api/sync/session`, and `POST /api/sync/capture` to send metadata to the Express service.
3. Successfully replicates clinical data securely into your PostgreSQL database.
