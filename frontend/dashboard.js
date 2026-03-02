// ================================================
// dashboard.js — KampusKu v2
// Firebase Firestore CRUD: Profil, Matkul,
// Jadwal, Agenda, CashFlow
// ================================================

/* ===== WAIT FOR FIREBASE INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof firebase === 'undefined') {
    console.error('Firebase not loaded');
    return;
  }
  initApp();
});

let currentUser = null;
const auth = firebase.auth();
const db   = firebase.firestore();

/* ===== QUOTES DATA ===== */
const QUOTES = [
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "The important thing is not to stop questioning.", author: "Albert Einstein" },
  { text: "Science is not only a disciple of reason but also one of romance and passion.", author: "Stephen Hawking" },
  { text: "We are just an advanced breed of monkeys, but we can understand the Universe.", author: "Stephen Hawking" },
  { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  { text: "If you cannot explain it simply, you do not understand it well enough.", author: "Richard Feynman" },
  { text: "The measure of intelligence is the ability to change.", author: "Charles Darwin" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Pendidikan adalah senjata paling kuat untuk mengubah dunia.", author: "Nelson Mandela" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "In science we must be interested in things, not in persons.", author: "Marie Curie" },
];
let quoteIdx = 0;
const WEATHER_KEY = "c541195dc7184d3c4b5d5833998f2820"; // ← ganti dgn API key kamu (gratis di openweathermap.org)

/* ===== INIT ===== */
function initApp() {
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    currentUser = user;
    setupApp();
  });
}

function setupApp() {
  startClock();
  shuffleQuotes();
  showQuote();
  loadWeather();
  loadProfil();
  loadAkademik();
  loadJadwal();
  loadAgenda();
  loadCashFlow();
  // Set today's date on date inputs
  const today = new Date().toISOString().split('T')[0];
  const kTgl = document.getElementById('kTgl');
  if (kTgl) kTgl.value = today;
}

/* ===== CLOCK ===== */
function startClock() {
  function tick() {
    const now = new Date();
    const days = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    document.getElementById('topClock').textContent =
      `${days[now.getDay()]} ${now.toLocaleTimeString('id-ID')}`;
  }
  tick(); setInterval(tick, 1000);
}

/* ===== NAVIGATION ===== */
const PAGE_TITLES = {
  home: 'Beranda', profil: 'Profil', data: 'Akademik',
  jadwal: 'Jadwal Kuliah', agenda: 'Agenda', cashflow: 'Arus Kas',
  absensi: 'Presensi', aboutme: 'Tentang Saya', pengaturan: 'Pengaturan'
};

window.openTab = function(id, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(s => s.classList.remove('active'));
  const tab = document.getElementById(id);
  if (tab) tab.classList.add('active');
  if (el) el.classList.add('active');
  else {
    const navEl = document.querySelector(`[data-tab="${id}"]`);
    if (navEl) navEl.classList.add('active');
  }
  document.getElementById('topbarTitle').textContent = PAGE_TITLES[id] || id;
  closeSidebar();
};

window.toggleSidebar = function() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sbOverlay');
  sb.classList.toggle('open');
  ov.classList.toggle('show');
};
window.closeSidebar = function() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sbOverlay').classList.remove('show');
};

/* Open first tab on load */
const firstItem = document.querySelector('[data-tab="home"]');
if (firstItem) openTab('home', firstItem);

/* ===== MODAL ===== */
window.bukaModal = function(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
};
window.tutupModal = function(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
};

/* ===== DARK MODE ===== */
window.toggleDark = function() {
  document.body.classList.toggle('light');
};

/* ===== QUOTES ===== */
function shuffleQuotes() {
  for (let i = QUOTES.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [QUOTES[i], QUOTES[j]] = [QUOTES[j], QUOTES[i]];
  }
}
function showQuote() {
  const q = QUOTES[quoteIdx % QUOTES.length];
  document.getElementById('quoteText').textContent = q.text;
  document.getElementById('quoteAuthor').textContent = '— ' + q.author;
}
window.nextQuote = function() { quoteIdx++; showQuote(); };
setInterval(() => { quoteIdx++; showQuote(); }, 30000);

/* ===== WEATHER ===== */
function loadWeather() {
  if (!navigator.geolocation) { showWeatherError(); return; }
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric&lang=id`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API error');
      const d = await res.json();
      renderWeather(d);
    } catch { showWeatherError(); }
  }, showWeatherError);
}

const WCFG = {
  Clear:        { e:'☀️',  anim:'sun',   bg:'linear-gradient(135deg,#101c36,#2a1510)' },
  Clouds:       { e:'☁️',  anim:'cloud', bg:'linear-gradient(135deg,#141820,#1e2030)' },
  Rain:         { e:'🌧️',  anim:'rain',  bg:'linear-gradient(135deg,#0a1520,#0a1530)' },
  Drizzle:      { e:'🌦️',  anim:'rain',  bg:'linear-gradient(135deg,#0a1520,#0a1530)' },
  Thunderstorm: { e:'⛈️',  anim:'rain',  bg:'linear-gradient(135deg,#08080e,#100820)' },
  Snow:         { e:'❄️',  anim:'snow',  bg:'linear-gradient(135deg,#101830,#181c30)' },
  Mist:         { e:'🌫️',  anim:'cloud', bg:'linear-gradient(135deg,#141618,#1a1e22)' },
  Haze:         { e:'🌫️',  anim:'cloud', bg:'linear-gradient(135deg,#141618,#1a1e22)' },
  default:      { e:'🌤️',  anim:'cloud', bg:'linear-gradient(135deg,#101c36,#1a1030)' },
};

function renderWeather(d) {
  const cond = d.weather[0].main;
  const cfg = WCFG[cond] || WCFG.default;
  document.getElementById('wEmoji').textContent = cfg.e;
  document.getElementById('wLoc').textContent = `${d.name}, ${d.sys.country}`;
  document.getElementById('wTemp').textContent = `${Math.round(d.main.temp)}°C`;
  document.getElementById('wDesc').textContent = d.weather[0].description;
  document.getElementById('wHumid').textContent = d.main.humidity + '%';
  document.getElementById('wWind').textContent = Math.round(d.wind.speed * 3.6) + ' km/h';
  document.getElementById('weatherCard').style.background = cfg.bg;
  buildWeatherAnim(cfg.anim);
}

function showWeatherError() {
  document.getElementById('wLoc').textContent = 'Lokasi tidak tersedia';
  document.getElementById('wTemp').textContent = '--°C';
  document.getElementById('wDesc').textContent = 'Aktifkan izin lokasi / set API key';
}

function buildWeatherAnim(type) {
  const c = document.getElementById('weatherBgAnim');
  c.innerHTML = '';
  if (type === 'rain') {
    for (let i = 0; i < 20; i++) {
      const d = document.createElement('div');
      d.className = 'rain-drop';
      d.style.cssText = `left:${Math.random()*100}%;height:${10+Math.random()*15}px;
        animation-duration:${0.4+Math.random()*0.5}s;animation-delay:${Math.random()}s;top:-20px`;
      c.appendChild(d);
    }
  } else if (type === 'cloud') {
    ['☁️','⛅','🌥️'].forEach((e,i) => {
      const el = document.createElement('div');
      el.className = 'cloud-drift';
      el.textContent = e;
      el.style.cssText = `top:${10+i*25}%;animation-duration:${15+i*8}s;animation-delay:${-i*4}s`;
      c.appendChild(el);
    });
  } else if (type === 'sun') {
    for (let i = 0; i < 8; i++) {
      const r = document.createElement('div');
      r.className = 'sun-ray';
      r.style.cssText = `width:2px;height:${40+Math.random()*30}px;
        left:${40+Math.cos(i*45*Math.PI/180)*30}%;
        top:${20+Math.sin(i*45*Math.PI/180)*20}%;
        transform:rotate(${i*45}deg);
        animation-delay:${i*0.25}s`;
      c.appendChild(r);
    }
  } else if (type === 'snow') {
    for (let i = 0; i < 18; i++) {
      const f = document.createElement('div');
      f.className = 'snow-flake';
      f.textContent = '❄';
      f.style.cssText = `left:${Math.random()*100}%;
        animation-duration:${3+Math.random()*3}s;
        animation-delay:${Math.random()*3}s;
        font-size:${0.6+Math.random()*0.5}rem;
        top:-20px`;
      c.appendChild(f);
    }
  }
}

/* ===== FIRESTORE HELPERS ===== */
function col(name) {
  return db.collection('users').doc(currentUser.uid).collection(name);
}
function ts() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

/* ===== TOAST ===== */
function toast(msg, dur = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

/* ===== PROFIL ===== */
function loadProfil() {
  col('profil').doc('data').onSnapshot(snap => {
    if (!snap.exists) return;
    const d = snap.data();
    setTxt('vNama',   d.nama   || '——');
    setTxt('vNpm',    d.npm    || '——');
    setTxt('vAlamat', d.alamat || '——');
    setTxt('vTgl',    d.tgl    || '——');
    setTxt('vUmur',   d.umur   || '——');
    setTxt('vSmp',    d.smp    || '——');
    setTxt('vSma',    d.sma    || '——');
    setTxt('vEmail',  currentUser.email || '——');
    setTxt('sbNama',  d.nama   || 'Pengguna');
    setTxt('sbNpm',   d.npm    || '');
    setTxt('pNama',   d.nama   || 'Pengguna');
    setTxt('aboutNama', d.nama || 'Pengguna');
    setTxt('aboutNpm',  d.npm  || '');
    if (d.foto) {
      ['avatarUser','sbAvatar','aboutAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = d.foto;
      });
    }
  });
}

window.bukaEditProfil = function() {
  col('profil').doc('data').get().then(snap => {
    const d = snap.exists ? snap.data() : {};
    document.getElementById('eNama').value   = d.nama   || '';
    document.getElementById('eNpm').value    = d.npm    || '';
    document.getElementById('eAlamat').value = d.alamat || '';
    document.getElementById('eTgl').value    = d.tgl    || '';
    document.getElementById('eUmur').value   = d.umur   || '';
    document.getElementById('eSmp').value    = d.smp    || '';
    document.getElementById('eSma').value    = d.sma    || '';
    bukaModal('modalProfil');
  });
};

window.simpanProfil = async function() {
  const data = {
    nama:   val('eNama'),
    npm:    val('eNpm'),
    alamat: val('eAlamat'),
    tgl:    val('eTgl'),
    umur:   val('eUmur'),
    smp:    val('eSmp'),
    sma:    val('eSma'),
    updatedAt: ts()
  };
  try {
    await col('profil').doc('data').set(data, { merge: true });
    tutupModal('modalProfil');
    toast('✅ Profil disimpan!');
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

window.gantiAvatar = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast('❌ File terlalu besar (maks 2MB)'); return; }
  const reader = new FileReader();
  reader.onload = async e => {
    const base64 = e.target.result;
    try {
      await col('profil').doc('data').set({ foto: base64 }, { merge: true });
      ['avatarUser','sbAvatar','aboutAvatar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = base64;
      });
      toast('✅ Foto profil diperbarui!');
    } catch(err) { toast('❌ Gagal simpan foto: ' + err.message); }
  };
  reader.readAsDataURL(file);
};

/* ===== AKADEMIK ===== */
let matkulData = [];
let editMatkulId = null;

function loadAkademik() {
  col('matkul').orderBy('createdAt', 'desc').onSnapshot(snap => {
    matkulData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAkademik();
    updateHomeStats();
  });
}

function renderAkademik() {
  const filter = document.getElementById('filterSemester')?.value || '';
  const filtered = filter ? matkulData.filter(m => m.semester == filter) : matkulData;

  // Update filter options
  const semSet = [...new Set(matkulData.map(m => m.semester))].sort();
  const sel = document.getElementById('filterSemester');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = '<option value="">Semua Semester</option>' +
      semSet.map(s => `<option value="${s}" ${s==cur?'selected':''}>${s}</option>`).join('');
  }

  // Compute IPK
  let totalSks = 0, totalBobot = 0;
  const BOBOT = { 'A':4, 'A-':3.7, 'B+':3.3, 'B':3, 'B-':2.7, 'C+':2.3, 'C':2, 'D':1, 'E':0 };
  matkulData.forEach(m => {
    const sks = Number(m.sks) || 0;
    const bobot = BOBOT[m.nilai] ?? 0;
    totalSks += sks;
    totalBobot += sks * bobot;
  });
  const ipk = totalSks ? (totalBobot / totalSks).toFixed(2) : '0.00';
  setTxt('totalSks', totalSks);
  setTxt('ipk', ipk);
  setTxt('totalMatkul', matkulData.length);
  setTxt('homeIpk', ipk);

  const list = document.getElementById('akadList');
  if (!list) return;
  if (!filtered.length) { list.innerHTML = '<p class="empty-msg">Belum ada mata kuliah. Klik "+ Tambah" untuk mulai.</p>'; return; }

  const gradeClass = n => {
    if (n.startsWith('A')) return 'grade-A';
    if (n.startsWith('B')) return 'grade-B';
    if (n.startsWith('C')) return 'grade-C';
    return 'grade-D';
  };

  list.innerHTML = filtered.map(m => `
    <div class="matkul-card">
      <div class="matkul-grade ${gradeClass(m.nilai)}">${m.nilai}</div>
      <div class="matkul-info">
        <strong>${esc(m.mk)}</strong>
        <small>Semester ${esc(m.semester)} &nbsp;·&nbsp; ${esc(m.dosen)} &nbsp;·&nbsp; ${m.sks} SKS</small>
      </div>
      <div class="card-actions">
        <button class="btn-icon edit" onclick="editMatkul('${m.id}')"><i class="fa fa-pen"></i></button>
        <button class="btn-icon del" onclick="hapusMatkul('${m.id}')"><i class="fa fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

window.simpanMatkul = async function() {
  const mk = val('mk'), semester = val('semester'), dosen = val('dosen'),
        nilai = val('nilai'), sks = val('sks');
  if (!mk || !semester || !dosen || !nilai || !sks) { toast('⚠️ Lengkapi semua field'); return; }
  try {
    const id = document.getElementById('editMatkulId').value;
    const data = { mk, semester, dosen, nilai, sks: Number(sks), updatedAt: ts() };
    if (id) {
      await col('matkul').doc(id).update(data);
      toast('✅ Mata kuliah diperbarui!');
    } else {
      await col('matkul').add({ ...data, createdAt: ts() });
      toast('✅ Mata kuliah ditambahkan!');
    }
    tutupModal('modalMatkul');
    clearForm(['mk','semester','dosen','sks']);
    document.getElementById('nilai').value = 'A';
    document.getElementById('editMatkulId').value = '';
    document.getElementById('matkulModalTitle').textContent = 'Tambah Mata Kuliah';
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

window.editMatkul = function(id) {
  const m = matkulData.find(x => x.id === id);
  if (!m) return;
  document.getElementById('editMatkulId').value = id;
  document.getElementById('mk').value = m.mk;
  document.getElementById('semester').value = m.semester;
  document.getElementById('dosen').value = m.dosen;
  document.getElementById('nilai').value = m.nilai;
  document.getElementById('sks').value = m.sks;
  document.getElementById('matkulModalTitle').textContent = 'Edit Mata Kuliah';
  bukaModal('modalMatkul');
};

window.hapusMatkul = async function(id) {
  if (!confirm('Hapus mata kuliah ini?')) return;
  try {
    await col('matkul').doc(id).delete();
    toast('🗑️ Mata kuliah dihapus');
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

/* ===== JADWAL KULIAH ===== */
let jadwalData = [];
const HARI = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function loadJadwal() {
  col('jadwal').onSnapshot(snap => {
    jadwalData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderJadwal();
    renderTodaySchedule();
    updateHomeStats();
  });
}

function renderJadwal() {
  const wrap = document.getElementById('jadwalWrap');
  if (!wrap) return;
  wrap.innerHTML = HARI.map(hari => {
    const classes = jadwalData.filter(j => j.hari === hari)
      .sort((a,b) => a.mulai.localeCompare(b.mulai));
    return `
      <div class="jadwal-day-block">
        <div class="jadwal-day-header">
          <span>${hari}</span>
          <small style="font-weight:400;color:var(--text2)">${classes.length} kelas</small>
        </div>
        <div class="jadwal-day-classes">
          ${classes.length ? classes.map(c => `
            <div class="jadwal-class-item">
              <span class="jadwal-class-time">${c.mulai} – ${c.selesai}</span>
              <div class="jadwal-class-info">
                <strong>${esc(c.matkul)}</strong>
                <small>${c.ruang ? '🚪 '+esc(c.ruang) : ''} ${c.dosen ? ' · 👩‍🏫 '+esc(c.dosen) : ''}</small>
              </div>
              <div class="card-actions" style="margin-left:auto">
                <button class="btn-icon del" onclick="hapusJadwal('${c.id}')"><i class="fa fa-trash"></i></button>
              </div>
            </div>
          `).join('') : '<p style="color:var(--text3);font-size:.8rem;padding:6px 4px">Tidak ada kelas</p>'}
        </div>
      </div>
    `;
  }).join('');
}

function renderTodaySchedule() {
  const dayIdx = new Date().getDay(); // 0=Sun
  const hariToday = HARI[dayIdx - 1]; // Mon=0 in HARI
  const todayClasses = jadwalData.filter(j => j.hari === hariToday)
    .sort((a,b) => a.mulai.localeCompare(b.mulai));
  const el = document.getElementById('homeTodaySchedule');
  if (!el) return;
  if (!todayClasses.length) {
    el.innerHTML = '<p class="empty-msg">Tidak ada jadwal hari ini 🎉</p>';
    return;
  }
  el.innerHTML = todayClasses.map(c => `
    <div class="today-sched-item">
      <span class="today-sched-time">${c.mulai} – ${c.selesai}</span>
      <div class="today-sched-info">
        <strong>${esc(c.matkul)}</strong>
        <small>${c.ruang ? '🚪 '+esc(c.ruang) : 'Ruang belum diatur'}</small>
      </div>
    </div>
  `).join('');
}

window.simpanJadwal = async function() {
  const matkul = val('jMatkul'), hari = val('jHari'), mulai = val('jMulai'),
        selesai = val('jSelesai'), ruang = val('jRuang'), dosen = val('jDosen');
  if (!matkul || !hari || !mulai || !selesai) { toast('⚠️ Lengkapi field wajib'); return; }
  try {
    await col('jadwal').add({ matkul, hari, mulai, selesai, ruang, dosen, createdAt: ts() });
    tutupModal('modalJadwal');
    clearForm(['jMatkul','jMulai','jSelesai','jRuang','jDosen']);
    toast('✅ Jadwal ditambahkan!');
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

window.hapusJadwal = async function(id) {
  if (!confirm('Hapus jadwal ini?')) return;
  try {
    await col('jadwal').doc(id).delete();
    toast('🗑️ Jadwal dihapus');
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

/* ===== AGENDA ===== */
let agendaData = [];

function loadAgenda() {
  col('agenda').orderBy('datetime').onSnapshot(snap => {
    agendaData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderAgenda();
    renderTodayAgenda();
    updateHomeStats();
  });
}

function renderAgenda() {
  const list = document.getElementById('agendaList');
  if (!list) return;
  if (!agendaData.length) { list.innerHTML = '<p class="empty-msg">Belum ada agenda. Klik "+ Tambah".</p>'; return; }
  list.innerHTML = agendaData.map(a => `
    <div class="agenda-card">
      <div class="agenda-cat-line ${a.kategori || 'lainnya'}"></div>
      <div class="agenda-info">
        <strong>${esc(a.judul)}</strong>
        <small>📅 ${fmtDatetime(a.datetime)}${a.tempat ? ' &nbsp;·&nbsp; 📍 '+esc(a.tempat) : ''}</small>
        ${a.note ? `<div class="agenda-note">📝 ${esc(a.note)}</div>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn-icon del" onclick="hapusAgenda('${a.id}')"><i class="fa fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function renderTodayAgenda() {
  const today = new Date().toISOString().split('T')[0];
  const todayItems = agendaData.filter(a => a.datetime && a.datetime.startsWith(today));
  const el = document.getElementById('homeTodayAgenda');
  if (!el) return;
  setTxt('homeAgenda', todayItems.length);
  if (!todayItems.length) { el.innerHTML = '<p class="empty-msg">Tidak ada agenda hari ini 🎉</p>'; return; }
  el.innerHTML = todayItems.map(a => `
    <div class="today-agenda-item">
      <div class="agenda-dot ${a.kategori || 'lainnya'}"></div>
      <div>
        <strong style="font-size:.88rem">${esc(a.judul)}</strong>
        <small style="color:var(--text2);font-size:.76rem;display:block">${fmtDatetime(a.datetime)}</small>
      </div>
    </div>
  `).join('');
}

window.simpanAgenda = async function() {
  const judul = val('agJudul'), datetime = val('agDatetime'),
        kategori = val('agKat'), tempat = val('agTempat'), note = val('agNote');
  if (!judul || !datetime) { toast('⚠️ Judul dan waktu harus diisi'); return; }
  try {
    await col('agenda').add({ judul, datetime, kategori, tempat, note, createdAt: ts() });
    tutupModal('modalAgenda');
    clearForm(['agJudul','agDatetime','agTempat','agNote']);
    toast('✅ Agenda ditambahkan!');
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

window.hapusAgenda = async function(id) {
  if (!confirm('Hapus agenda ini?')) return;
  try {
    await col('agenda').doc(id).delete();
    toast('🗑️ Agenda dihapus');
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

/* ===== CASH FLOW ===== */
let kasData = [];

function loadCashFlow() {
  col('cashflow').orderBy('createdAt', 'desc').onSnapshot(snap => {
    kasData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCashFlow();
    updateHomeStats();
  });
}

function renderCashFlow() {
  let masuk = 0, keluar = 0;
  kasData.forEach(k => {
    if (k.tipe === 'pemasukan') masuk += Number(k.jumlah);
    else keluar += Number(k.jumlah);
  });
  const saldo = masuk - keluar;
  setTxt('totalPemasukan', rp(masuk));
  setTxt('totalPengeluaran', rp(keluar));
  setTxt('saldo', rp(saldo));
  setTxt('homeSaldo', rp(saldo));

  const list = document.getElementById('kasList');
  if (!list) return;
  if (!kasData.length) { list.innerHTML = '<p class="empty-msg">Belum ada transaksi. Klik "+ Tambah".</p>'; return; }
  list.innerHTML = kasData.map(k => {
    const masukType = k.tipe === 'pemasukan';
    return `
      <div class="kas-card">
        <div class="kas-type-badge ${masukType ? 'masuk' : 'keluar'}">
          <i class="fa fa-${masukType ? 'arrow-down' : 'arrow-up'}"></i>
        </div>
        <div class="kas-info">
          <strong>${esc(k.deskripsi)}</strong>
          <small>${k.tanggal || ''}</small>
        </div>
        <span class="kas-amount ${masukType ? 'masuk' : 'keluar'}">
          ${masukType ? '+' : '-'}${rp(k.jumlah)}
        </span>
        <div class="card-actions">
          <button class="btn-icon del" onclick="hapusKas('${k.id}')"><i class="fa fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

window.simpanKas = async function() {
  const tipe = val('kTipe'), tanggal = val('kTgl'),
        deskripsi = val('kDesk'), jumlah = val('kJml');
  if (!deskripsi || !jumlah || !tanggal) { toast('⚠️ Lengkapi semua field'); return; }
  try {
    await col('cashflow').add({ tipe, tanggal, deskripsi, jumlah: Number(jumlah), createdAt: ts() });
    tutupModal('modalKas');
    clearForm(['kDesk','kJml']);
    toast(`✅ ${tipe === 'pemasukan' ? '💰 Pemasukan' : '💸 Pengeluaran'} ditambahkan!`);
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

window.hapusKas = async function(id) {
  if (!confirm('Hapus transaksi ini?')) return;
  try {
    await col('cashflow').doc(id).delete();
    toast('🗑️ Transaksi dihapus');
  } catch(e) { toast('❌ Gagal: ' + e.message); }
};

/* ===== HOME STATS ===== */
function updateHomeStats() {
  // Jadwal hari ini
  const dayIdx = new Date().getDay();
  const hariToday = HARI[dayIdx - 1];
  const todayJadwal = hariToday ? jadwalData.filter(j => j.hari === hariToday).length : 0;
  setTxt('homeJadwal', todayJadwal + ' kelas');
}

/* ===== LOGOUT ===== */
window.logout = function() {
  if (confirm('Yakin mau logout?')) {
    auth.signOut().then(() => window.location.href = 'index.html');
  }
};

/* ===== UTILS ===== */
function val(id) { return document.getElementById(id)?.value?.trim() || ''; }
function setTxt(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }
function clearForm(ids) { ids.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; }); }
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function rp(num) {
  return 'Rp ' + Math.abs(Number(num)||0).toLocaleString('id-ID');
}
function fmtDatetime(str) {
  if (!str) return '';
  try { return new Date(str).toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
  catch { return str; }
}
