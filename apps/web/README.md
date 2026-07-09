# SHEild AI 🛡️
### Empowering Women's Safety with Intelligence

SHEild AI is a premium, hackathon-ready safety platform designed specifically for women. It leverages AI, real-time community insights, and secure storage to provide a comprehensive safety companion for everyday life and emergency situations.

## 🚀 Core Features

- **AI Safety Predictor**: Real-time safety scores for any destination based on historical data, live reports, and environmental factors.
- **Community Safety Map**: Interactive map with heatzones for danger spots, reported by users and verified by the community.
- **SOS Central**: One-tap emergency alerts, voice-activated SOS triggers, and fake call simulation for uneasy situations.
- **Evidence Vault**: Secure, timestamped storage for photos and audio recordings, providing an immutable record when it matters most.
- **AI Safety Assistant**: 24/7 intelligent guide for safety advice, travel tips, and emergency protocols.
- **Night Guard Mode**: Automatic high-visibility UI and enhanced security sensitivity during nighttime hours.

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Design**: Premium Glassmorphism, Responsive UI, Dark Mode Optimized
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: Custom Auth System (Google & Email/Password)
- **AI Engine**: Google Gemini 2.5 Pro
- **Maps**: Google Maps Platform (@vis.gl/react-google-maps)
- **Storage**: Secure Asset Uploads

## 📂 Project Structure

- `/apps/web/src/app`: Application routes and backend APIs.
- `/apps/web/src/components`: Reusable UI components.
- `/apps/web/src/utils`: Authentication and data hooks.
- `/apps/web/src/api/utils`: SQL and Upload utilities.

## 🛡️ Safety First
SHEild AI is built with a mobile-first approach, ensuring that critical safety features are always just a tap away.

## Vercel deployment

Import the repository in Vercel and set the project Root Directory to
`apps/web`. The included `vercel.json` uses the React Router adapter and
handles dependency installation and production builds.

Set these variables for the Production, Preview, and Development environments:

- `GEMINI_API_KEY` — server-only Google AI Studio key used by the assistant and
  safety scoring.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — browser-restricted Maps key with Maps
  JavaScript, Places, and Directions enabled.

The safe-route page still produces a local, time-aware score and links to
directions if the Maps key is missing.
