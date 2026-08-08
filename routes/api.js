const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Contact = require('../models/Contact');

const router = express.Router();

const DATA_DIR = path.join(__dirname, '..', 'data');
const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));

// ---- Read endpoints ----
router.get('/profile', (req, res) => res.json(readJSON('profile.json')));
router.get('/projects', (req, res) => res.json(readJSON('projects.json')));
router.get('/certificates', (req, res) => res.json(readJSON('certificates.json')));
router.get('/resumes', (req, res) => res.json(readJSON('resumes.json')));

// ---- Contact form ----
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are all required.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    const saved = await Contact.create({ name, email, message });
    res.status(201).json({ ok: true, id: saved._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save your message right now. Please try again shortly.' });
  }
});

// ---- File uploads (for adding certificates/resumes/project images) ----
// Simple local-disk storage. Files land in /uploads/<kind>/ and are served statically.
// This is a lightweight way for YOU (the owner) to drop in new files — there's no
// public upload form on the live site, so it's safe to leave enabled.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const kind = req.params.kind;
    const allowed = ['projects', 'certificates', 'resumes'];
    if (!allowed.includes(kind)) return cb(new Error('Invalid upload category'));
    cb(null, path.join(__dirname, '..', 'uploads', kind));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload/:kind', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received.' });
  res.status(201).json({ ok: true, path: `/uploads/${req.params.kind}/${req.file.filename}` });
});

module.exports = router;
