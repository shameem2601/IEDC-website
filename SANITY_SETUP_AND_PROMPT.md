# IEDC MTM — Sanity Studio & Antigravity Setup Guide

This document explains everything you need to manage content using **Sanity Studio** or the built-in website admin tools.

---

## 1. Project Credentials
- **Sanity Project ID:** `s4nzdr3x`
- **Sanity Dataset:** `production`
- **Studio Directory:** `studio-iedc` (located next to your website folder)

---

## 2. Dynamic Features Configured

### A. Live Counters & Claims (Students Engaged, Mission & Vision)
In Sanity Studio under **Site Settings**:
- **Students Engaged:** Editable number (e.g. `500+`). Change it anytime new students join.
- **Events Hosted:** Live counter (e.g. `50+`).
- **Startups Incubated:** Live counter (e.g. `10+`).
- **Industry Partners:** Live counter (e.g. `15+`).
- **Mission & Vision Section Text:**
  - Mission Headline
  - Mission Description
  - Mission Subtext / KSUM Partnership narrative
- **Footer Contact & Socials:**
  - Email, phone, Instagram, LinkedIn, X, YouTube, and website links.

Any change published in Sanity Studio reflects on the live website immediately without redeploying!

---

### B. Events Calendar — Automatic Date Detection & Manual Override
Each event in Sanity Studio (`schemaTypes/event.ts`) has:
1. **Cover Image:** Separate 16:9 banner image with focal hotspot.
2. **Gallery Images:** Array of photos — supports bulk uploading multiple photos at once.
3. **Date & Time:** Real date (`eventDate`) and display text badge (`dateBadge`).
4. **Calendar Past vs. Future Detection:**
   - **⚡ Automatic (Default):** The website knows today's real-world date and time. When an event's date has passed, it automatically shifts from the **Upcoming** tab to the **Past & Archive** tab!
   - **🟢 Force Upcoming:** Manually keep an event in the Upcoming section if needed.
   - **⚪ Force Past (Completed / Archived):** Manually move an event to the Past archive even before the date passes.
5. **Interactive Website Tabs:**
   - `All Events (X)`
   - `Upcoming (Y)` (with glowing green active pulse indicator)
   - `Past & Archive (Z)` (with completed badge and recap mode)
6. **Lightbox Modal:**
   - For upcoming events: Displays RSVP registration button with confetti confirmation.
   - For past events: Displays "Concluded & Archived" status, recap gallery, attendee metrics, and mentor highlights.

---

### C. Team Members — One-by-One and Bulk Upload
You have 3 flexible ways to manage team members:

#### 1. In Sanity Studio (One-by-One)
Go to **Team Members** in Sanity Studio:
- Add member name, role, hierarchy tier (Faculty Nodal Officer, Executive Council, Domain Lead/Member).
- Upload high-resolution photo with hotspot cropping (or initials auto-display if no photo).
- Add LinkedIn, Instagram, GitHub, and display order.

#### 2. Bulk Upload via Photos (Built-in Website Admin)
Press **`Ctrl + Shift + A`** anywhere on the website (or visit `#admin`):
- Go to **Team Members & Bulk Upload**.
- Click **Upload 20 Photos (Bulk)**.
- Select up to 25 member photos from your computer at once. Profiles are auto-created with initials and names derived from filenames.

#### 3. Bulk CSV / Spreadsheet Import for Sanity
A converter script is included in `studio-iedc/scripts/convert-csv-to-ndjson.mjs`:
1. Place your spreadsheet as `members.csv` (or use `studio-iedc/scripts/sample-members.csv`).
2. Run:
   ```bash
   node scripts/convert-csv-to-ndjson.mjs sample-members.csv members.ndjson
   ```
3. Import to Sanity:
   ```bash
   npx sanity dataset import members.ndjson production
   ```

---

## 3. How to Start Sanity Studio Locally
Open your terminal and navigate to `studio-iedc`:
```bash
cd studio-iedc
npm run dev
```
Open `http://localhost:3333` in your browser.

---

## 4. CORS Authorization
If running locally on port 3000 or deploying to Vercel/Netlify:
```bash
npx sanity cors add http://localhost:3000 --credentials
npx sanity cors add http://localhost:5173 --credentials
npx sanity cors add https://your-domain.vercel.app --credentials
```

---

## 5. Secret Website Admin Shortcut
To manage content directly on the website without opening a terminal:
- Press **`Ctrl + Shift + A`** on keyboard.
- Or open your website with **`#admin`** at the end of the URL.
