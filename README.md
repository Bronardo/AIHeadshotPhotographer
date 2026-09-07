# AI Headshot Photographer 📸

A full-stack web application that transforms casual selfies into generic, studio-quality executive headshots using Google's Gemini models.

---

## 🌟 Overview

The **AI Headshot Photographer** enables users to upload or capture a casual smartphone selfie, select a studio portrait style, customize wardrobe and lighting details, and instantly generate high-resolution professional headshots. The app features an interactive before-and-after split slider to compare the original casual photo with the developed studio portrait.

---

## ✨ Features

- **Flexible Photo Ingestion**:
  - **Drag & Drop / File Browser**: Upload existing portrait photos (`.jpg`, `.png`, `.webp`).
  - **Live Webcam Studio**: In-browser camera capture with facial framing oval, 3-2-1 countdown shutter, and retake controls.
  - **1-Click Sample Selfies**: Pre-loaded casual portraits to test-drive styles immediately.

- **Curated Professional Styles**:
  - **Corporate Grey Backdrop**: Executive standard with classic studio grey texture, tailored dark navy/charcoal blazer, crisp white shirt, and three-point softbox lighting.
  - **Modern Tech Office**: Contemporary Silicon Valley aesthetic with architectural glass, soft daylight, and modern minimalist knitwear.
  - **Outdoor Natural Light**: Golden hour environmental portrait with warm sun rays and shallow depth-of-field greenery bokeh.
  - **Executive Boardroom**: Panoramic high-rise skyline, hand-tailored suit, and commanding presence.
  - **Creative Studio Monochrome**: High-contrast black-and-white portrait inspired by vintage Hasselblad studio master photography.
  - **Warm Architectural Coworking**: Loft-style design agency setting with exposed brick and cozy ambient warmth.
  - **Sleek Dark Editorial**: Minimalist dark slate backdrop with precision rim lighting for keynote speakers and authors.

- **Customization Studio**:
  - **Wardrobe Tuning**: Choose between style defaults, formal suit & tie/blazer, smart casual, tech minimalist crewneck, or crisp oxford button-down.
  - **Facial Expression**: Select warm & approachable smile, confident & poised, or authoritative executive composure.
  - **Aspect Ratio**: Standard `1:1 Square` (LinkedIn / profile avatars) or `3:4 Portrait` (resumes, press releases, company websites).
  - **Photographer Notes**: Add custom styling cues (e.g., "keep my glasses", "soft sunset glow").

- **Interactive Proofing & Export**:
  - **Before & After Split Slider**: Smooth drag slider to swipe between the source selfie and the developed studio portrait.
  - **Multiple View Modes**: Comparison Slider, Side-by-Side proofing, and Headshot-only view.
  - **High-Res Export**: 1-click PNG download and clipboard copy.
  - **Session Portfolio Strip**: Review, compare, and download all headshots generated during the session.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Build Tool**: [Vite](https://vitejs.dev/) with `@vitejs/plugin-react` and `@tailwindcss/vite`
- **Backend**: [Express](https://expressjs.com/) server integrated with Vite middleware
- **AI & Vision**: [@google/genai](https://www.npmjs.com/package/@google/genai) TypeScript SDK
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Google Gemini API Key

### Installation

1. Clone or download the repository:
   ```bash
   git clone <repository-url>
   cd ai-headshot-photographer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and provide your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

- `npm run dev`: Boots the full-stack development server with Vite middleware on port 3000.
- `npm run build`: Bundles the client with Vite and compiles the backend TypeScript server with `esbuild`.
- `npm start`: Runs the production bundled server from `dist/server.cjs`.
- `npm run lint`: Runs TypeScript validation (`tsc --noEmit`).
- `npm run clean`: Cleans the build output directory.

---

## 🔒 Security & Architecture

- **Server-Side API Calls**: All Gemini API calls and model requests occur exclusively on the Express backend (`server.ts`).
- **Private Secrets**: `GEMINI_API_KEY` is never exposed to the client or browser bundle.
- **Identity Preservation**: Generative prompts instruct the model to maintain facial geometry, ethnicity, and recognizable likeness while updating environment, wardrobe, and studio lighting.

---

## 📄 License

Apache-2.0
