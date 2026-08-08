# Paplesh Jadhav — Portfolio

Single-page portfolio built with **Node.js + Express** on the backend, **HTML/CSS/JavaScript**
on the frontend, and **MongoDB** for storing contact-form messages. No framework, no build step —
run it and it works.

Sections: hero, about, skills, projects (live link + GitHub + image + 2-line description),
certificates (click to view full-size), per-role resumes, hobbies & languages, and a contact form.

---

## 1. Run it locally

```bash
cd portfolio
npm install
cp .env.example .env      # then fill in MONGODB_URI (see step 2)
npm run dev                # or: npm start
```

Open **http://localhost:5000**.

## 2. Set up the database (free)

The site works without a database — it just won't save contact-form messages until you connect one.

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Add a database user and allow network access from anywhere (0.0.0.0/0) for now.
3. Copy the connection string into `MONGODB_URI` in your `.env` file.

## 3. Add your real content

You don't need to touch any code to update the site — everything lives in plain files.

**Projects, certificates, resumes, and your profile info** are in `/data/*.json`.
Open each file and replace the placeholder values:

- `data/profile.json` — your bio, email, phone, location, GitHub/LinkedIn links, hobbies, languages, skills
- `data/projects.json` — one object per project: `name`, `description` (keep it to ~2 lines), `image`, `liveLink`, `githubLink`, `tags`
- `data/certificates.json` — one object per certificate: `title`, `issuer`, `image`, `date`
- `data/resumes.json` — already has all 11 of your role-tailored resumes listed; just point `file` at the right PDF

**The actual files** (resume PDFs, certificate images, project screenshots) go in:

```
uploads/projects/       ← project screenshots (.png/.jpg)
uploads/certificates/   ← certificate images (.png/.jpg)
uploads/resumes/        ← resume PDFs
```

Drop a file in the matching folder, then reference its path in the JSON, e.g.
`"image": "/uploads/projects/ai-legal-assistant.png"`.

If you'd rather upload through the browser instead of copying files manually, there's also an
upload endpoint (handy from Postman or a quick `curl`):

```bash
curl -F "file=@/path/to/resume.pdf" http://localhost:5000/api/upload/resumes
# → { "ok": true, "path": "/uploads/resumes/172xxxx-resume.pdf" }
```

Paste the returned `path` into the matching JSON entry.

## 4. Deploy it live

Any Node host works since this isn't tied to Firebase/AWS. Two easy free options:

### Option A — Render (simplest)
1. Push this folder to a GitHub repo.
2. On [render.com](https://render.com) → **New Web Service** → connect the repo.
3. Build command: `npm install` · Start command: `npm start`
4. Add environment variables `MONGODB_URI` (and `PORT` is set automatically by Render).
5. Deploy — you'll get a live `https://your-app.onrender.com` URL.

### Option B — Railway
1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Add the `MONGODB_URI` environment variable.
3. Railway auto-detects Node and runs `npm start`. You get a live URL immediately.

### Option C — Your own VPS
```bash
npm install --production
npm install -g pm2
pm2 start server.js --name portfolio
pm2 save
```
Put Nginx in front for HTTPS and a custom domain.

## 5. Project structure

```
portfolio/
├── server.js              # Express app entry point
├── config/db.js           # MongoDB connection
├── models/Contact.js      # Contact-form schema
├── routes/api.js          # /api/profile, /projects, /certificates, /resumes, /contact, /upload
├── data/*.json            # Your editable content — no code changes needed
├── uploads/                # Your actual images/PDFs, served statically
└── public/                 # Frontend: index.html, css/style.css, js/main.js
```

## Notes

- Contact form messages are validated server-side and rate-limited (30 requests / 15 min) to
  block spam.
- The `/api/upload/:kind` endpoint has no auth on it in this starter — fine for local use, but if
  you deploy publicly and don't want strangers uploading files, add a simple API-key check before
  going live (ask me and I'll add it).
- All images lazy-load and the layout is responsive down to mobile.
