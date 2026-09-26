<div align="center">
  <h1>IEDC MTM College — Official Web Platform</h1>
  <p>Where student ideas transform into collegiate ventures, backed by Kerala Startup Mission (KSUM).</p>
</div>

---

## 🚀 Overview

The official digital platform for the **Innovation and Entrepreneurship Development Cell (IEDC)** at MTM College. Built with high-performance modern web standards, featuring full dynamic integration with **Sanity CMS** for live content management without rebuilding the website.

---

## ⚡ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion
- **CMS:** Sanity Studio v3 (`@sanity/client`, `@sanity/image-url`)
- **Design System:** Optimus sharp minimalist aesthetic, Instrument Sans & Space Mono typography
- **Live Sync:** Real-time Groq listeners (`sanityClient.listen(...)`) for zero-downtime updates

---

## 🎯 Key Features

1. **Dynamic Metrics & Claims:**
   - Live editable counters: Students Engaged (`500+`), Events Hosted (`50+`), Startups Incubated (`10+`), Industry Partners (`15+`).
   - Mission & Vision headlines and narratives managed via Sanity CMS `siteSettings`.

2. **Smart Events Calendar & Archive:**
   - **Automatic Date Detection:** The website detects the real-world date and automatically shifts concluded events from **Upcoming** to **Past & Archive**.
   - **Manual Status Override:** Force any event to `Upcoming` or `Past` directly in Sanity Studio.
   - **Rich Media:** 16:9 dedicated cover banner + multi-image bulk photo gallery with interactive lightbox modal.

3. **Team Members & Bulk Uploading:**
   - Hierarchical team tiers: Faculty Nodal Officers, Executive Council, and Domain Leads/Innovators.
   - **Bulk Photo Profile Creator:** Press `Ctrl + Shift + A` on the website to bulk-upload photos and auto-create member profiles.
   - **Spreadsheet/CSV Importer:** Convert CSV rosters to Sanity NDJSON using `studio-iedc/scripts/convert-csv-to-ndjson.mjs`.

---

## 🛠️ Getting Started

### 1. Website Frontend

```bash
# Install dependencies
npm install

# Run local development server (port 3000)
npm run dev

# Production build
npm run build
```

### 2. Sanity Studio (Content Management)

```bash
# Navigate to the studio folder
cd studio-iedc

# Install studio dependencies
npm install

# Run Sanity Studio locally (port 3333)
npm run dev
```

---

## 🔐 Credentials & CMS Configuration

- **Project ID:** `s4nzdr3x`
- **Dataset:** `production`
- **Hosted Studio:** [https://s4nzdr3x.sanity.studio](https://s4nzdr3x.sanity.studio)

### CORS Authorization
```bash
npx sanity cors add http://localhost:3000 --credentials
npx sanity cors add https://your-production-domain.com --credentials
```

---

## 📜 License
Apache-2.0
