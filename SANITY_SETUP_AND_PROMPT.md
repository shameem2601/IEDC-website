# IEDC MTM — Sanity Studio & Antigravity Setup Guide

This document contains everything you need to run **Sanity Studio** in a separate folder on your computer, connect it to your GitHub/website, or run it through **Antigravity**.

---

## 1. Why No Public CMS Button?
The public CMS button has been completely removed from both the Navigation Bar and the Footer. Regular visitors to your live website **cannot see or access** any CMS buttons.

### Private Admin Access (Only For You):
If you ever want to quickly update content directly on the website without opening a terminal, you can privately trigger the dashboard using any of these 3 hidden methods:
1. **Keyboard Shortcut:** Press **`Ctrl + Shift + A`** (or **`Cmd + Shift + A`** on Mac) anywhere on the page.
2. **URL Hash:** Append **`#admin`** or **`?admin=true`** to the website URL (e.g. `https://your-site.com/#admin`).
3. **Secret Triple-Click:** Triple-click on the footer text **`Made by IEDC MTM <3`**.

---

## 2. Setting Up Sanity Studio On Your Computer (Folder `studio-iedc`)

You can create a standalone folder on your local computer that runs the official Sanity Studio interface.

### Step 1: Open your terminal
Run this command from the parent folder (one level above your app folder):
```bash
npm create sanity@latest -- --project s4nzdr3x --dataset production --template clean --typescript --output-path studio-iedc
```

### Step 2: Start the Sanity Studio
```bash
cd studio-iedc
npm run dev
```
Sanity Studio will open at `http://localhost:3333`. Anything you publish there connects directly to dataset `production` under project `s4nzdr3x`.

---

## 3. The Exact Prompt To Paste Into Antigravity

Copy and paste the prompt below into Antigravity to define all schemas and configure your standalone studio:

```text
Set up Sanity Studio schemas and integration for IEDC MTM College.

Context:
- Project ID: s4nzdr3x
- Dataset: production
- Studio Folder: studio-iedc (standalone folder next to the app folder)

Requirements:
1. Create the following 3 Sanity schemas inside `studio-iedc/schemaTypes/`:

   a) `event.ts` (Event Schema):
      - `title` (string, required)
      - `slug` (slug, current)
      - `dateBadge` (string, e.g. "12 OCT 2026")
      - `category` (string, options: "36-HOUR SPRINT", "WORKSHOP", "FOUNDER CLINIC", "PANEL", "CONFERENCE")
      - `icon` (string, material icon name, e.g. "bolt", "terminal", "school")
      - `shortDescription` (text, max 160 characters)
      - `fullDescription` (text / blockContent)
      - `coverImage` (image with hotspot: true - uploaded separately as main 16:9 banner)
      - `galleryImages` (array of images - allows bulk uploading 8-9 photos at once)
      - `location` (string)
      - `attendeeCount` (number)
      - `registrationOpen` (boolean)

   b) `teamMember.ts` (Team Member Schema):
      - `name` (string, required)
      - `initials` (string, 2 letters e.g. "FR")
      - `role` (string, required, e.g. "Chief Executive Officer", "Faculty Nodal Officer")
      - `hierarchy` (string, options: [
          { title: "Faculty Leadership & Nodal Officer (2-3 per line)", value: "nodal" },
          { title: "Executive Council (4 per line)", value: "executive" },
          { title: "Domain Leads & Innovators (5 per line)", value: "member" }
        ], required)
      - `photo` (image with hotspot: true)
      - `badgeIcon` (string, material icon name e.g. "verified", "flag", "code")
      - `linkedin` (url)
      - `instagram` (url)
      - `order` (number, for sorting)

   c) `siteStats.ts` (Site Metrics Singleton Schema):
      - `eventsHosted` (number, default: 50)
      - `studentsEngaged` (number, default: 500)
      - `startupsIncubated` (number, default: 10)
      - `industryPartners` (number, default: 15)

2. Register all schemas in `schemaTypes/index.ts`.
3. Provide CORS origin authorization command for Sanity:
   `npx sanity cors add http://localhost:3000 --credentials`
   `npx sanity cors add https://your-deployed-domain.com --credentials`
4. Keep the Studio standalone in `studio-iedc` so non-technical team members can log into https://s4nzdr3x.sanity.studio/ or run it locally to manage events, bulk upload photos, and update team members safely without touching code.
```

---

## 4. How Content Automatically Updates on the Website
Your website is already pre-configured with `@sanity/client` and `@sanity/image-url` in `src/lib/sanity.ts` referencing:
- `projectId: 's4nzdr3x'`
- `dataset: 'production'`

Whenever you publish an event, add photos, or edit members in Sanity Studio, the live queries in `src/lib/sanity.ts` immediately fetch the updated documents without rebuilding the site!
