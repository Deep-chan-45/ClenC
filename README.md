# ClenC · Kanpur Nagar Nigam Civic Waste Management & SWM 2026 Platform

ClenC is an urban sanitation and grievance management platform designed for Kanpur Nagar Nigam (KNN) adhering to India's Solid Waste Management (SWM) Rules 2026.

## 🚀 Deploying to Vercel from GitHub

When you push this repository to GitHub and import it into Vercel, the application is configured out of the box with **Vercel Serverless Functions** for all AI features.

### 1. Vercel Project Settings
- **Framework Preset**: `Vite`
- **Build Command**: `vite build` (or `npm run build`)
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2. Environment Variables
In your Vercel Project Dashboard, navigate to **Settings** → **Environment Variables** and add:

| Key | Value | Description |
|---|---|---|
| `GEMINI_API_KEY` | `your_gemini_api_key_here` | Required for Gemini Vision photo inspector and AI bin classifier. Obtain from [Google AI Studio](https://aistudio.google.com). |

*(Optional)* You can also set `VITE_GEMINI_API_KEY` to the same value.

### 3. Serverless AI Architecture on Vercel
The repository includes production Vercel Serverless functions inside the `/api` directory:
- `POST /api/classify-waste-item`: Evaluates any searched waste item, identifies dustbin color (Green, Blue, Red, Amber/Black, Brown), material composition, and statutory SWM 2026 disposal instructions.
- `POST /api/validate-waste-report-image`: Server-side Gemini Vision Civic Inspector that verifies citizen grievance photos for authentic waste issues and detects categories or unrelated files.
- `POST /api/classify-waste-image`: Directly classifies uploaded waste photos into the 4 statutory streams (Wet, Dry, Sanitary, Special Care).
- `vercel.json`: Pre-configured to route API requests directly to `/api/*` serverless functions and handle client-side SPA navigation.
- **Fail-safe Municipal Rule Engine**: If the API key is not configured or network latency occurs, the client seamlessly falls back to Kanpur Nagar Nigam's official SWM 2026 municipal bylaws so users never experience crashes or blank states.

## 💻 Local Development
```bash
npm install
npm run dev
```
Runs the Express backend with Vite integration on `http://localhost:3000`.
