document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Mobile nav ----------
const navToggle = document.getElementById('navToggle');
const siteNav = document.querySelector('.site-nav');
navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});
siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  siteNav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', false);
}));

// ---------- Scroll reveal ----------
const revealTargets = document.querySelectorAll('.section, .hero');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
}, { threshold: 0.12 });
revealTargets.forEach(el => io.observe(el));

// ---------- Helpers ----------
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

// ---------- Profile ----------
async function loadProfile() {
  try {
    const p = await fetchJSON('/api/profile');
    document.getElementById('heroName').textContent = p.name;
    document.getElementById('heroTagline').textContent = p.tagline;
    if (p.photo) {
      const photo = document.getElementById('heroPhoto');
      photo.src = p.photo;
      photo.alt = p.name;
      photo.hidden = false;
      photo.onerror = () => { photo.hidden = true; }; // hides cleanly if the file isn't uploaded yet
    }
    document.getElementById('heroAbout').textContent = p.about;
    document.getElementById('aboutText').textContent = p.about;

    const meta = document.getElementById('aboutMeta');
    meta.innerHTML = '';
    if (p.location) meta.appendChild(el('li', null, `📍 ${p.location}`));
    if (p.email) meta.appendChild(el('li', null, `✉️ ${p.email}`));
    meta.appendChild(el('li', null, `🧭 open to new roles`));

    const skills = document.getElementById('skillsList');
    skills.innerHTML = '';
    (p.skills || []).forEach(s => skills.appendChild(el('li', null, s)));

    const hobbies = document.getElementById('hobbiesList');
    hobbies.innerHTML = '';
    (p.hobbies || []).forEach(h => hobbies.appendChild(el('li', null, h)));

    const langs = document.getElementById('languagesList');
    langs.innerHTML = '';
    (p.languagesKnown || []).forEach(l => {
      const li = el('li', null, `<span>${l.name}</span><span class="lang-level">${l.level}</span>`);
      langs.appendChild(li);
    });

    document.getElementById('contactEmail').textContent = `email — ${p.email}`;
    document.getElementById('contactPhone').textContent = `phone — ${p.phone}`;
    document.getElementById('contactLocation').textContent = `based in — ${p.location}`;

    const socials = document.getElementById('socialsList');
    socials.innerHTML = '';
    Object.entries(p.socials || {}).forEach(([name, url]) => {
      if (!url) return;
      const a = el('a', null, name);
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      socials.appendChild(a);
    });
  } catch (err) {
    console.error(err);
  }
}

// ---------- Projects ----------
async function loadProjects() {
  const grid = document.getElementById('projectGrid');
  try {
    const projects = await fetchJSON('/api/projects');
    grid.innerHTML = '';
    if (!projects.length) {
      grid.appendChild(el('p', 'loading-note', 'No projects added yet.'));
      return;
    }
    projects.forEach(p => {
      const card = el('article', 'project-card');
      card.innerHTML = `
        <div class="terminal-bar">
          <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
          <span class="terminal-path">~/projects/${p.id}</span>
        </div>
        <img class="project-thumb" src="${p.image}" alt="${p.name} screenshot" loading="lazy"
             onerror="this.style.display='none'">
        <div class="project-body">
          <h3 class="project-name">${p.name}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-tags">${(p.tags || []).map(t => `<span>${t}</span>`).join('')}</div>
          <div class="project-links">
            ${p.liveLink ? `<a href="${p.liveLink}" target="_blank" rel="noopener noreferrer">↗ live</a>` : ''}
            ${p.githubLink ? `<a href="${p.githubLink}" target="_blank" rel="noopener noreferrer">↗ github</a>` : ''}
          </div>
        </div>`;
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '';
    grid.appendChild(el('p', 'loading-note', 'Could not load projects right now.'));
  }
}

// ---------- Certificates ----------
async function loadCertificates() {
  const grid = document.getElementById('certGrid');
  try {
    const certs = await fetchJSON('/api/certificates');
    grid.innerHTML = '';
    if (!certs.length) {
      grid.appendChild(el('p', 'loading-note', 'No certificates added yet.'));
      return;
    }
    certs.forEach(c => {
      const filePath = c.file || c.image; // supports older entries that still use "image"
      const isPdf = /\.pdf$/i.test(filePath);
      const btn = el('button', 'cert-card');
      const thumbHTML = isPdf
        ? `<div class="cert-thumb cert-thumb-pdf"><span class="pdf-badge">PDF</span></div>`
        : `<img class="cert-thumb" src="${filePath}" alt="${c.title}" loading="lazy">`;
      btn.innerHTML = `
        ${thumbHTML}
        <div class="cert-meta">
          <p class="cert-title">${c.title}</p>
          <p class="cert-issuer">${c.issuer}${c.date ? ' · ' + c.date : ''}</p>
        </div>`;
      btn.addEventListener('click', () => {
        if (isPdf) {
          window.open(filePath, '_blank', 'noopener,noreferrer');
        } else {
          openLightbox(filePath, `${c.title} — ${c.issuer}`);
        }
      });
      grid.appendChild(btn);
    });
  } catch (err) {
    grid.innerHTML = '';
    grid.appendChild(el('p', 'loading-note', 'Could not load certificates right now.'));
  }
}

// ---------- Resumes ----------
async function loadResumes() {
  const list = document.getElementById('resumeList');
  try {
    const resumes = await fetchJSON('/api/resumes');
    list.innerHTML = '';
    resumes.forEach(r => {
      const row = el('div', 'resume-row');
      row.innerHTML = `
        <span class="resume-role">${r.role}</span>
        <a href="${r.file}" target="_blank" rel="noopener noreferrer" download>download ↓</a>`;
      list.appendChild(row);
    });
  } catch (err) {
    list.innerHTML = '';
    list.appendChild(el('p', 'loading-note', 'Could not load resumes right now.'));
  }
}

// ---------- Lightbox ----------
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption;
  lightboxCaption.textContent = caption;
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
  document.body.style.overflow = '';
}
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

// ---------- Contact form ----------
const contactForm = document.getElementById('contactForm');
const cfStatus = document.getElementById('cfStatus');
const cfSubmit = document.getElementById('cfSubmit');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  cfStatus.textContent = '';
  cfStatus.className = 'form-status';
  const payload = {
    name: document.getElementById('cf-name').value.trim(),
    email: document.getElementById('cf-email').value.trim(),
    message: document.getElementById('cf-message').value.trim()
  };
  cfSubmit.disabled = true;
  cfSubmit.textContent = 'sending…';
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    cfStatus.textContent = 'Message sent — thanks! I\'ll get back to you soon.';
    cfStatus.classList.add('ok');
    contactForm.reset();
  } catch (err) {
    cfStatus.textContent = err.message;
    cfStatus.classList.add('err');
  } finally {
    cfSubmit.disabled = false;
    cfSubmit.textContent = 'send message';
  }
});

// ---------- Init ----------
loadProfile();
loadProjects();
loadCertificates();
loadResumes();
