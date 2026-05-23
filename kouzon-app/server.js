const express = require('express');
const multer  = require('multer');
const fetch   = require('node-fetch');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CONFIG (set these as Render env vars) ──
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || 'YOUR_JSONBIN_API_KEY';
const JSONBIN_BIN_ID  = process.env.JSONBIN_BIN_ID  || 'YOUR_JSONBIN_BIN_ID';
const ADMIN_PASSWORD  = process.env.ADMIN_PASSWORD  || 'kouzon2026';

// ── MIDDLEWARE ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ── FILE UPLOAD (memory, base64 encode) ──
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ── JSONBIN HELPERS ──
async function readBin() {
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    const data = await res.json();
    return data.record || { applicants: [] };
  } catch(e) {
    return { applicants: [] };
  }
}

async function writeBin(record) {
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
      body: JSON.stringify(record)
    });
  } catch(e) {
    console.error('JSONBin write error:', e.message);
  }
}

// ── ROUTES ──

// Save applicant
app.post('/api/apply', upload.single('cvFile'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, residence, position, paymentStatus } = req.body;
    const applicant = {
      id: `KZN_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      firstName: firstName || '',
      lastName:  lastName  || '',
      email:     email     || '',
      phone:     phone     || '',
      residence: residence || '',
      position:  position  || '',
      paymentStatus: paymentStatus || 'pending',
      cvFile: req.file
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
        : null
    };
    const record = await readBin();
    if (!record.applicants) record.applicants = [];
    record.applicants.push(applicant);
    await writeBin(record);
    res.json({ success: true, id: applicant.id });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save' });
  }
});

// Admin — list applicants
app.post('/api/admin/applicants', async (req, res) => {
  const { password } = req.body;
  if(password !== ADMIN_PASSWORD) return res.status(401).json({ success: false, error: 'Wrong password' });
  const record = await readBin();
  // Strip CV binary from list view
  const list = (record.applicants || []).reverse().map(a => ({ ...a, cvFile: a.cvFile ? 'HAS_CV' : null }));
  res.json({ success: true, applicants: list });
});

// Admin — download CV
app.post('/api/admin/cv', async (req, res) => {
  const { password, id } = req.body;
  if(password !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  const record = await readBin();
  const applicant = (record.applicants || []).find(a => a.id === id);
  if(!applicant || !applicant.cvFile) return res.status(404).json({ error: 'No CV found' });
  res.json({ success: true, cvFile: applicant.cvFile, name: `${applicant.firstName}_${applicant.lastName}` });
});

// Catch-all → index
// Catch-all → index (don't override /admin)
app.get('*', (req, res) => {
  if(req.path === '/admin') {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});
app.listen(PORT, () => console.log(`Kouzon running on port ${PORT}`));
