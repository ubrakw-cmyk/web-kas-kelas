/* Kas Kelas — vanilla JS, tanpa library, ringan. */
(() => {
'use strict';
const CFG = window.KAS_CONFIG || {};
const SB = CFG.SUPABASE_URL && CFG.SUPABASE_KEY ? { url: CFG.SUPABASE_URL.replace(/\/+$/, ''), key: CFG.SUPABASE_KEY } : null;
const DEMO = !SB && !CFG.API_URL;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp = n => (n < 0 ? '-' : '') + 'Rp' + Math.abs(Math.round(n || 0)).toLocaleString('id-ID');
const BLN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const BLNF = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};
const pad = n => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const fmtDate = s => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); return `${d} ${BLN[m - 1]} ${y}`; };

/* ---------- ikon (sprite inline, tanpa file) ---------- */
const P = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  up:'<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  down:'<path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/>',
  alert:'<path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z"/><path d="M12 9v4M12 17h.01"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h3M20 17v4"/>',
  send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  sheet:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  settings:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  chev:'<path d="m9 6 6 6-6 6"/>',
  chart:'<path d="M3 3v18h18"/><path d="M7 15v-4M12 15V7M17 15v-7"/>',
  mega:'<path d="m3 11 18-5v12L3 14z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  download:'<path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M12 18h.01"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  wallet:'<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><path d="M16 14h.01"/>',
  pin:'<path d="M12 17v5M5 3h14l-2 7 3 4H4l3-4z"/>',
  calendar:'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  coin:'<circle cx="9" cy="9" r="6"/><path d="M15.5 8.6A6 6 0 1 1 8.6 15.5"/>',
  vote:'<path d="M7 20V10M12 20V4M17 20v-7"/>',
  task:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m9 12 2 2 4-4"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M20 17v4H6.5a2.5 2.5 0 0 1 0-4"/>',
  tin:'<path d="M17 7 7 17M17 17H7V7"/>',
  tout:'<path d="M7 17 17 7M7 7h10v10"/>',
  unlock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'
};
const ic = (n, s = 20) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

/* ---------- logika kas ---------- */
/* Tagihan baru muncul tiap hari SENIN (0=Minggu, 1=Senin ... 6=Sabtu). Mau hari lain? ubah angka ini. */
const HARI_TAGIH = 1;
/* Minggu ke berapa sekarang? Senin pertama bulan = M1, Senin kedua = M2, dst (maks M4:
   kalau bulan punya 5 Senin, Senin ke-5 tidak menambah tagihan baru). Sebelum Senin pertama
   bulan itu, masih dihitung minggu terakhir bulan lalu. */
const nowIdx = (tahun, d = new Date()) => {
  const y = d.getFullYear();
  if (y < tahun) return -1;
  if (y > tahun) return 47;
  const lastMon = d.getDate() - ((d.getDay() - HARI_TAGIH + 7) % 7);   // tanggal hari tagih terakhir (<= hari ini)
  if (lastMon < 1) return d.getMonth() * 4 - 1;                      // belum ada hari tagih di bulan ini
  return d.getMonth() * 4 + Math.min(3, Math.floor((lastMon - 1) / 7));
};
const idxLabel = i => `M${(i % 4) + 1} ${BLN[Math.floor(i / 4)]}`;
const idxDate = (tahun, i) => `${tahun}-${pad(Math.floor(i / 4) + 1)}-${pad(Math.min(28, (i % 4) * 7 + 3))}`;

function stat(s, D = S.data) {
  const st = D.settings, start = (Number(st.mulaiBulan) - 1) * 4, cur = nowIdx(Number(st.tahun));
  const paid = new Set(D.paid[s.id] || []);
  const expected = Math.max(0, cur - start + 1);
  const due = [];
  for (let i = start; i <= cur; i++) if (!paid.has(i)) due.push(i);
  const arrears = due.length;
  const thisPaid = paid.has(cur);
  const paidCount = expected - arrears;
  return { start, cur, paid, expected, due, arrears, thisPaid, paidCount, amount: arrears * Number(st.nominal),
    status: arrears === 0 ? 'lunas' : arrears === 1 ? 'belum' : 'nunggak' };
}
const badge = x => x.status === 'lunas' ? '<span class="badge ok">Lunas</span>'
  : x.status === 'belum' ? '<span class="badge warn">Belum bayar</span>'
  : `<span class="badge bad">Nunggak ${x.arrears} mgg</span>`;
const totals = D => {
  let masuk = 0, keluar = 0;
  D.tx.forEach(t => t.tipe === 'Masuk' ? masuk += Number(t.jumlah) : keluar += Number(t.jumlah));
  const arrearsPeople = D.students.filter(s => stat(s, D).arrears > 0).length;
  const arrearsRp = D.students.reduce((a, s) => a + stat(s, D).amount, 0);
  return { masuk, keluar, saldo: masuk - keluar, arrearsPeople, arrearsRp };
};
const hue = id => [152, 160, 168, 146, 175, 138, 182, 156][id % 8];
const initials = n => n.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
const avatar = (s, cls = '') => s.foto ? `<div class="av ${cls}"><img src="${esc(s.foto)}" alt="" loading="lazy" decoding="async"></div>` : `<div class="av ${cls}" style="background:linear-gradient(135deg,hsl(${hue(s.id)} 60% 38%),hsl(${hue(s.id)} 55% 52%))">${esc(initials(s.nama))}</div>`;

/* ---------- API (server Google Apps Script atau demo lokal) ---------- */
const Demo = {
  key: 'kas-demo-v3',
  load() { let d = ls.get(this.key); if (!d) { d = this.seed(); this.save(d); } return d; },
  save(d) { ls.set(this.key, d); },
  seed() {
    // Mulai dari 0: tidak ada siswa, transaksi, atau pengumuman. Semua diisi admin.
    const settings = { kelas: 'Kelas', tahun: new Date().getFullYear(), mulaiBulan: new Date().getMonth() + 1, nominal: 5000, bendahara: 'Kucay', wa: '', spreadsheetUrl: '', qris: '' };
    return { settings, students: [], paid: {}, tx: [], ann: [], nid: { tx: 1, ann: 1, st: 1 }, pin: '1234', claims: {}, proofs: [], nid2: 1 };
  },
  async call(action, p = {}) {
    await new Promise(r => setTimeout(r, action === 'data' ? 750 : 180));
    const d = this.load();
    const out = x => (this.save(d), { ok: true, data: this.view(d), ...x });
    d.claims = d.claims || {}; d.proofs = d.proofs || []; d.nid2 = d.nid2 || 1;
    const mine = () => d.claims[p.token] || 0;
    const nom0 = Number(d.settings.nominal);
    const state = () => ({ ok: true, data: this.view(d), me: mine(), pending: d.proofs.filter(q => q.status === 'pending').length,
      proofs: d.proofs.filter(q => q.studentId === mine() && !(q.status === 'approved' && q.acked)).map(q => ({ id: q.id, idxs: q.idxs, amount: q.amount, status: q.status, alasan: q.alasan, note: q.note })).reverse() });
    if (action === 'data') return state();
    if (action === 'claim') {
      if (mine()) return { ok: false, error: 'Perangkat ini sudah punya nama. Minta admin melepas klaim dulu.' };
      if (Object.values(d.claims).includes(p.studentId)) return { ok: false, error: 'Nama ini sudah diklaim orang lain' };
      d.claims[p.token] = p.studentId; this.save(d); return state();
    }
    if (action === 'unclaim') { delete d.claims[p.token]; this.save(d); return state(); }
    if (action === 'photo') {
      const s = d.students.find(x => x.id === mine()); if (!s) return { ok: false, error: 'Pilih namamu dulu' };
      s.foto = p.foto || ''; this.save(d); return state();
    }
    if (action === 'txBukti') { const t = d.tx.find(x => x.id === p.id); return { ok: true, bukti: (t && t.bukti) || '' }; }
    if (action === 'proofSubmit') {
      const me = mine(); if (!me) return { ok: false, error: 'Pilih namamu dulu' };
      const ix = [...new Set(p.idxs || [])].sort((a, b) => a - b); if (!ix.length || ix.length > 12) return { ok: false, error: 'Pilih 1–12 minggu' };
      if (ix.some(i => (d.paid[me] || []).includes(i))) return { ok: false, error: 'Ada minggu yang sudah lunas' };
      if (d.proofs.some(q => q.studentId === me && q.status === 'pending' && q.idxs.some(i => ix.includes(i)))) return { ok: false, error: 'Bukti untuk minggu itu masih menunggu verifikasi' };
      d.proofs = d.proofs.filter(q => !(q.studentId === me && q.status === 'rejected' && q.idxs.some(i => ix.includes(i))));
      d.proofs.push({ id: d.nid2++, studentId: me, idxs: ix, amount: nom0 * ix.length, foto: p.foto, note: p.note || '', status: 'pending', alasan: '', acked: false, tgl: todayStr() + ' ' + new Date().toTimeString().slice(0, 5) });
      this.save(d); return state();
    }
    if (action === 'proofAck') { const q = d.proofs.find(x => x.id === p.id && x.studentId === mine() && x.status === 'approved'); if (q) q.acked = true; this.save(d); return state(); }
    if (action === 'login') return p.pin === d.pin ? { ok: true } : { ok: false, error: 'PIN salah' };
    if (p.pin !== d.pin) return { ok: false, error: 'Khusus admin. Masuk dulu.' };
    const nom = Number(d.settings.nominal);
    const plist = () => ({ ok: true, data: this.view(d), list: [...d.proofs].sort((a, b) => (b.status === 'pending') - (a.status === 'pending') || b.id - a.id).map(q => ({ id: q.id, studentId: q.studentId, nama: (d.students.find(x => x.id === q.studentId) || {}).nama || '?', idxs: q.idxs, amount: q.amount, note: q.note, status: q.status, alasan: q.alasan, tgl: q.tgl })) });
    const addPay = (sid, i) => {
      const set = new Set(d.paid[sid] || []); if (set.has(i)) return; set.add(i); d.paid[sid] = [...set];
      const s = d.students.find(x => x.id === sid);
      d.tx.unshift({ id: d.nid.tx++, tgl: todayStr(), tipe: 'Masuk', ket: `Kas ${idxLabel(i)} — ${s.nama}`, jumlah: nom, siswaId: sid, key: sid + '|' + i });
    };
    const delPay = (sid, i) => { d.paid[sid] = (d.paid[sid] || []).filter(x => x !== i); d.tx = d.tx.filter(t => t.key !== sid + '|' + i); };
    switch (action) {
      case 'togglePaid': p.paid ? addPay(p.studentId, p.idx) : delPay(p.studentId, p.idx); return out();
      case 'payMany': p.idxs.forEach(i => addPay(p.studentId, i)); return out();
      case 'addTx': d.tx.unshift({ id: d.nid.tx++, tgl: p.tgl, tipe: p.tipe, ket: p.ket, jumlah: Number(p.jumlah), siswaId: 0, key: '', detail: p.detail || '', bukti: p.bukti || '' }); d.tx.sort((a, b) => b.tgl.localeCompare(a.tgl) || b.id - a.id); return out();
      case 'updateTx': { const t = d.tx.find(x => x.id === p.id); if (t) { Object.assign(t, { tgl: p.tgl, tipe: p.tipe, ket: p.ket, jumlah: Number(p.jumlah) }); if ('detail' in p) t.detail = p.detail || ''; if ('bukti' in p) t.bukti = p.bukti || ''; } d.tx.sort((a, b) => b.tgl.localeCompare(a.tgl) || b.id - a.id); return out(); }
      case 'deleteTx': { const t = d.tx.find(x => x.id === p.id); if (t && t.key) { const [sid, i] = t.key.split('|').map(Number); d.paid[sid] = (d.paid[sid] || []).filter(x => x !== i); } d.tx = d.tx.filter(x => x.id !== p.id); return out(); }
      case 'saveAnn': if (p.id) Object.assign(d.ann.find(a => a.id === p.id) || {}, { judul: p.judul, isi: p.isi, pin: !!p.pin }); else d.ann.unshift({ id: d.nid.ann++, tgl: todayStr(), judul: p.judul, isi: p.isi, pin: !!p.pin }); return out();
      case 'deleteAnn': d.ann = d.ann.filter(a => a.id !== p.id); return out();
      case 'saveSettings': Object.assign(d.settings, p.settings); return out();
      case 'saveQris': d.settings.qris = p.qris; return out();
      case 'saveStudent': Object.assign(d.students.find(s => s.id === p.id) || {}, { nama: p.nama, hp: p.hp || '' }); return out();
      case 'addStudent': { const id = d.nid.st++; d.students.push({ id, no: d.students.length + 1, nama: p.nama, hp: p.hp || '', foto: '' }); d.paid[id] = []; return out(); }
      case 'deleteStudent': { d.students = d.students.filter(x => x.id !== p.id); d.students.forEach((x, i) => x.no = i + 1); delete d.paid[p.id]; d.tx = d.tx.filter(t => t.siswaId !== p.id); return out(); }
      case 'proofList': return plist();
      case 'proofGet': return { ok: true, foto: (d.proofs.find(q => q.id === p.id) || {}).foto || '' };
      case 'proofApprove': { const q = d.proofs.find(x => x.id === p.id && x.status === 'pending'); if (q) { q.idxs.forEach(i => addPay(q.studentId, i)); q.status = 'approved'; } this.save(d); return plist(); }
      case 'proofReject': { const q = d.proofs.find(x => x.id === p.id && x.status === 'pending'); if (q) { q.status = 'rejected'; q.alasan = p.alasan || ''; } this.save(d); return plist(); }
      case 'proofDelete': d.proofs = d.proofs.filter(q => !(q.id === p.id && q.status !== 'pending')); this.save(d); return plist();
      case 'releaseClaim': for (const k in d.claims) if (d.claims[k] === p.id) delete d.claims[k]; return out();
      case 'changePin': d.pin = p.newPin; return out();
    }
    return { ok: false, error: 'Aksi tidak dikenal' };
  },
  view(d) { const c = JSON.parse(JSON.stringify(d)); const taken = new Set(Object.values(d.claims || {})); c.students.forEach(s => s.claimed = taken.has(s.id)); c.tx.forEach(t => { t.hasBukti = !!t.bukti; delete t.bukti; }); delete c.pin; delete c.nid; delete c.claims; delete c.proofs; delete c.nid2; return c; }
};
/* Supabase: semua lewat fungsi RPC (tabel terkunci, hanya admin ber-PIN yang bisa menulis) */
async function rpc(fn, args) {
  const h = { 'Content-Type': 'application/json', apikey: SB.key };
  if (SB.key.startsWith('eyJ')) h.Authorization = 'Bearer ' + SB.key;   // kunci anon lama berbentuk JWT
  const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(SB.url + '/rest/v1/rpc/' + fn, { method: 'POST', headers: h, body: JSON.stringify(args || {}), signal: ctl.signal });
    const j = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: (j && (j.message || j.hint)) ? 'Server: ' + (j.message || j.hint) : 'Server error ' + res.status, net: res.status >= 500 };
    return j;
  } finally { clearTimeout(to); }
}
async function api(action, p = {}) {
  const body = { action, pin: S.pin, token: S.token, ...p };
  if (DEMO) return Demo.call(action, body);
  try {
    if (SB) {
      if (action === 'data') return await rpc('kas_get', { p_token: S.token });
      if (action === 'claim') return await rpc('kas_claim', { p_token: S.token, p_student: p.studentId });
      if (action === 'unclaim') return await rpc('kas_unclaim', { p_token: S.token });
      if (action === 'proofSubmit') return await rpc('kas_proof_submit', { p_token: S.token, p_idxs: p.idxs, p_foto: p.foto, p_note: p.note || '' });
      if (action === 'proofAck') return await rpc('kas_proof_ack', { p_token: S.token, p_id: p.id });
      if (action === 'txBukti') return await rpc('kas_tx_bukti', { p_id: p.id });
      if (action === 'photo') return await rpc('kas_set_photo', { p_token: S.token, p_foto: p.foto || '' });
      if (action === 'login') return await rpc('kas_login', { p_pin: String(p.pin || '') });
      const { action: _a, pin: _p, token: _t, ...rest } = body;
      return await rpc('kas_do', { p_pin: String(S.pin || ''), p_action: action, p: rest });
    }
    const res = action === 'data'
      ? await fetch(CFG.API_URL + (CFG.API_URL.includes('?') ? '&' : '?') + 'action=data', { redirect: 'follow' })
      : await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' });
    return await res.json();
  } catch (e) { return { ok: false, error: 'Tidak bisa terhubung. Cek internet.', net: true }; }
}

/* ---------- state ---------- */
const newToken = () => { const a = new Uint8Array(16); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.random() * 256); return [...a].map(b => b.toString(16).padStart(2, '0')).join(''); };
const S = {
  token: ls.get('kas-token', '') || (() => { const t = newToken(); ls.set('kas-token', t); return t; })(),
  data: null, admin: false, pin: ls.get('kas-pin', '') || '', me: ls.get('kas-me', 0), route: 'beranda',
  loading: true, updated: null, txFilter: 'Masuk', stFilter: 'Semua', q: '', tq: '', sheet: null, payWeeks: null, lim: { st: 16, tx: 14 },
  proofs: [], pending: 0, plist: null, proofFoto: '', txFoto: undefined
};
const KEY = DEMO ? 'kas-cache-demo3' : SB ? 'kas-cache-sb' : 'kas-cache';

/* ---------- util UI ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }
function openSheet(html, ctx) { const w = $('#sheet'); S.sheet = ctx || { type: 'misc' }; w.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`; w.hidden = false; document.body.style.overflow = 'hidden'; }
function closeSheet() { $('#sheet').hidden = true; S.sheet = null; document.body.style.overflow = ''; }
function applyAdmin() { document.body.classList.toggle('is-admin', S.admin); }
const copyText = async t => { try { await navigator.clipboard.writeText(t); toast('Tersalin'); } catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); toast('Tersalin'); } catch {} a.remove(); } };

/* ---------- animasi fade saat scroll (berulang & lembut) ---------- */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); else if (e.intersectionRatio === 0) e.target.classList.remove('in'); });
}, { threshold: [0, 0.08], rootMargin: '0px 0px -4% 0px' }) : null;
function observeFx(root = $('#view')) {
  const els = $$('.fx', root);
  els.forEach((el, i) => { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(i % 6, 5) * 0.05 + 's'); });
  if (io) els.forEach(el => io.observe(el)); else els.forEach(el => el.classList.add('in'));
}

/* ---------- skeleton ---------- */
const skeleton = () => `
  <div class="sk sk-hero"></div>
  <div class="stats"><div class="sk sk-stat"></div><div class="sk sk-stat"></div><div class="sk sk-stat"></div></div>
  <div class="sk sk-line" style="width:40%;height:20px"></div>
  <div class="list">${'<div class="sk sk-row"></div>'.repeat(6)}</div>`;

/* ---------- komponen ---------- */
const header = sub => `
  <header class="top glass fx">
    <div class="brand"><div><b>Kas Kelas</b><small>${esc((sub || (S.data ? S.data.settings.kelas : '')) + (S.admin ? ' · Admin' : ''))}</small></div></div>
    <div class="top-r">
      <button class="ib ${S.loading ? 'spin' : ''}" data-act="refresh" aria-label="Segarkan data">${ic('refresh')}</button>
      <button class="ib" data-act="notif" aria-label="Pengingat">${ic('bell')}</button>
    </div>
  </header>`;
const secH = (t, link) => `<div class="sec-h fx"><h2>${t}</h2>${link || ''}</div>`;
const studentRow = s => { const x = stat(s); return `
  <button class="row lite fx" data-act="openStudent" data-id="${s.id}">
    ${avatar(s)}<div class="grow"><b>${esc(s.nama)}</b><small>${S.me === s.id ? 'Kamu' : 'No. ' + s.no}</small></div>${badge(x)}
  </button>`; };
const txRow = t => `
  <div class="row lite fx" ${t.tipe === 'Keluar' ? `data-act="txDetail" data-id="${t.id}" role="button" tabindex="0"` : ''}>
    <div class="tx-ic ${t.tipe === 'Masuk' ? 'in' : 'out'}">${ic(t.tipe === 'Masuk' ? 'tin' : 'tout', 18)}</div>
    <div class="grow"><b>${esc(t.ket)}</b><small>${fmtDate(t.tgl)}${t.tipe === 'Keluar' && (t.detail || t.hasBukti) ? ' · ' + (t.hasBukti ? '📎 ' : '') + esc((t.detail || 'ada bukti').slice(0, 40)) : ''}</small></div>
    <span class="amt ${t.tipe === 'Masuk' ? 'in' : 'out'}">${t.tipe === 'Masuk' ? '+' : '-'}${rp(t.jumlah)}</span>
    ${S.admin ? `<button class="ib" style="width:34px;height:34px" data-act="editTx" data-id="${t.id}" aria-label="Edit">${ic('edit', 16)}</button>` : ''}
  </div>`;
const weeklyAnn = () => { const st = S.data.settings; return `
  <div class="banner pin glass fx"><div class="tx-ic">${ic('mega')}</div>
    <div class="grow"><b>Kas ${rp(st.nominal)} / minggu</b></div>
    <a class="btn primary sm" href="#/bayar">Bayar</a></div>`; };

/* ---------- halaman ---------- */
const V = {};
V.beranda = () => {
  const D = S.data, T = totals(D), me = D.students.find(s => s.id === S.me), mx = me && stat(me);
  const first = D.students.slice(0, 6);
  return `${header()}
  <section class="hero glass fx">
    <img class="hbill b1" src="img/bill.webp" alt="" aria-hidden="true"><img class="hbill b2" src="img/bill.webp" alt="" aria-hidden="true"><i class="hcoin c1"></i><i class="hcoin c2"></i>
    <small>Total Saldo Kas</small><div class="big">${rp(T.saldo)}</div>
    <div class="meta"><span>${D.students.length} siswa</span><span>${idxLabel(nowIdx(Number(D.settings.tahun)) < 0 ? 0 : nowIdx(Number(D.settings.tahun)))}</span></div>
  </section>
  <div class="stats">
    <div class="stat in glass fx">${ic('up')}<b>${rp(T.masuk)}</b><small>Masuk</small></div>
    <div class="stat out glass fx">${ic('down')}<b>${rp(T.keluar)}</b><small>Keluar</small></div>
    <div class="stat warn glass fx">${ic('alert')}<b>${T.arrearsPeople} Orang</b><small>Tunggakan</small></div>
  </div>
  ${me && mx.arrears > 0 ? `<div class="banner glass fx"><div class="tx-ic">${ic('bell')}</div><div class="grow"><b>Hai ${esc(me.nama.split(' ')[0])}, tunggakanmu ${rp(mx.amount)}</b><small>${mx.arrears} minggu</small></div><a class="btn primary sm" href="#/bayar">Bayar</a></div>` : ''}
  ${S.admin && S.pending ? `<a class="banner pop glass fx" href="#/bayar"><div class="tx-ic wait">${ic('clock')}</div><div class="grow"><b>${S.pending} bukti menunggu verifikasi</b></div>${ic('chev')}</a>` : ''}
  ${me && S.proofs.length ? `<a class="banner pop glass fx" href="#/bayar"><div class="tx-ic ${S.proofs[0].status === 'rejected' ? 'out' : S.proofs[0].status === 'approved' ? 'in' : 'wait'}">${ic(S.proofs[0].status === 'rejected' ? 'x' : S.proofs[0].status === 'approved' ? 'check' : 'clock')}</div><div class="grow"><b>Bukti bayar: ${STAT[S.proofs[0].status][0]}</b></div>${ic('chev')}</a>` : ''}
  ${deferredInstall && !ls.get('kas-noinst') ? `<div class="banner pop glass fx"><div class="tx-ic">${ic('phone')}</div><div class="grow"><b>Pasang sebagai aplikasi</b></div><button class="btn primary sm" data-act="install">Pasang</button><button class="ib" style="width:32px;height:32px" data-act="noInst" aria-label="Tutup">${ic('x', 14)}</button></div>` : ''}
  ${!me ? `<button class="banner glass fx" data-act="pickMe" style="width:100%;text-align:left"><div class="tx-ic">${ic('user')}</div><div class="grow"><b>Pilih namamu</b></div>${ic('chev')}</button>` : ''}
  <div class="cols">
    <div>
      ${weeklyAnn()}
      ${secH('Status Pembayaran', '<a href="#/siswa">Lihat semua</a>')}
      <div class="glass list-wrap"><div class="list">${first.map(studentRow).join('')}</div></div>
    </div>
    <div>
      ${secH('Riwayat Terbaru', '<a href="#/riwayat">Semua</a>')}
      <div class="glass list-wrap"><div class="list">${D.tx.slice(0, 6).map(txRow).join('') || '<div class="empty">Belum ada transaksi</div>'}</div></div>
    </div>
  </div>`;
};

V.siswa = () => {
  const D = S.data, q = S.q.toLowerCase();
  const list = D.students.filter(s => (!q || s.nama.toLowerCase().includes(q)) && (S.stFilter === 'Semua' || ({ Lunas: 'lunas', 'Belum bayar': 'belum', Menunggak: 'nunggak' }[S.stFilter] === stat(s).status)));
  const shown = list.slice(0, S.lim.st);
  return `${header('Daftar siswa & status kas')}
  <label class="search glass fx">${ic('search')}<input id="q" type="search" placeholder="Cari nama siswa…" value="${esc(S.q)}" autocomplete="off"></label>
  <div class="chips fx">${['Semua', 'Lunas', 'Belum bayar', 'Menunggak'].map(c => `<button class="chip ${S.stFilter === c ? 'on' : ''}" data-act="stFilter" data-v="${c}">${c}</button>`).join('')}</div>
  <div class="glass list-wrap"><div class="list" id="stList">${shown.map(studentRow).join('') || '<div class="empty">Tidak ada siswa yang cocok</div>'}</div>${shown.length < list.length ? '<div class="more" id="moreSt"></div>' : ''}</div>
  ${S.admin ? `<div class="btns" style="margin-top:14px"><button class="btn soft" data-act="addStudent">${ic('plus')} Tambah siswa</button></div>` : ''}`;
};

V.pengumuman = () => {
  const D = S.data;
  return `${header('Pengumuman kelas')}
  ${S.admin ? `<button class="btn primary block fx" data-act="editAnn" data-id="0" style="margin-bottom:14px">${ic('plus')} Buat pengumuman</button>` : ''}
  ${weeklyAnn()}
  <div class="list">${D.ann.map(a => `
    <article class="card glass fx"><div style="display:flex;gap:8px;align-items:center;justify-content:space-between"><h3>${a.pin ? ic('pin', 14) + ' ' : ''}${esc(a.judul)}</h3><small>${fmtDate(a.tgl)}</small></div>
      <p style="white-space:pre-wrap;margin-top:6px">${esc(a.isi)}</p>
      ${S.admin ? `<div class="btns" style="margin-top:10px"><button class="btn soft sm" data-act="editAnn" data-id="${a.id}">${ic('edit', 15)} Edit</button><button class="btn danger sm" data-act="delAnn" data-id="${a.id}">${ic('trash', 15)} Hapus</button></div>` : ''}</article>`).join('') || '<div class="empty">Belum ada pengumuman</div>'}</div>`;
};

V.riwayat = () => {
  const D = S.data, q = S.tq.toLowerCase(), tipe = S.txFilter === 'Keluar' ? 'Keluar' : 'Masuk';
  const segFrom = S.segFrom == null ? (tipe === 'Keluar' ? 100 : 0) : S.segFrom; S.segFrom = null;
  const all = D.tx.filter(t => t.tipe === tipe), sum = all.reduce((a, t) => a + Number(t.jumlah), 0);
  const list = all.filter(t => !q || (t.ket + ' ' + (t.detail || '')).toLowerCase().includes(q)), shown = list.slice(0, S.lim.tx);
  return `${header('Riwayat transaksi')}
  <div class="seg fx" role="tablist" data-i="${tipe === 'Keluar' ? 1 : 0}"><i class="seg-b" style="--from:${segFrom}%"></i>
    <button role="tab" class="${tipe === 'Masuk' ? 'on' : ''}" data-act="txFilter" data-v="Masuk">${ic('tin', 17)} Pemasukan</button>
    <button role="tab" class="${tipe === 'Keluar' ? 'on' : ''}" data-act="txFilter" data-v="Keluar">${ic('tout', 17)} Pengeluaran</button></div>
  <section class="sum ${tipe === 'Keluar' ? 'out' : 'in'} fx"><small>${tipe === 'Masuk' ? 'Total pembayaran uang kas' : 'Total pengeluaran uang kas'}</small><b>${rp(sum)}</b><small>${all.length} transaksi</small></section>
  <label class="search glass fx">${ic('search')}<input id="tq" type="search" placeholder="Cari ${tipe === 'Masuk' ? 'pemasukan' : 'pengeluaran'}…" value="${esc(S.tq)}" autocomplete="off"></label>
  <div class="glass list-wrap"><div class="list">${shown.map(txRow).join('') || `<div class="empty">${tipe === 'Masuk' ? 'Belum ada pemasukan' : 'Belum ada pengeluaran'}</div>`}</div>${shown.length < list.length ? '<div class="more" id="moreTx"></div>' : ''}</div>`;
};

V.rangkuman = () => {
  const D = S.data, T = totals(D), n = D.students.length, thisPaid = D.students.filter(s => stat(s).thisPaid).length;
  const pct = n ? Math.round(thisPaid / n * 100) : 0, C = 2 * Math.PI * 52;
  const mon = Array.from({ length: 12 }, () => ({ m: 0, k: 0 }));
  D.tx.forEach(t => { const [y, m] = t.tgl.split('-').map(Number); if (y === Number(D.settings.tahun)) mon[m - 1][t.tipe === 'Masuk' ? 'm' : 'k'] += Number(t.jumlah); });
  const mx = Math.max(1, ...mon.map(x => Math.max(x.m, x.k)));
  const unpaid = D.students.filter(s => !stat(s).thisPaid);
  return `${header('Rangkuman keuangan')}
  <div class="cols"><div>
    <section class="card glass fx"><h3 style="text-align:center;margin-bottom:10px">Sudah bayar minggu ini</h3>
      <div class="ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="#dbeee4" stroke-width="12"/><circle cx="60" cy="60" r="52" fill="none" stroke="#16a06a" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}"/></svg><b>${pct}%</b></div>
      <p style="text-align:center;margin-top:8px"><small>${thisPaid} dari ${n} siswa</small></p></section>
    <section class="card glass fx"><div class="sum-grid">
      <div><small>Total masuk</small><b style="color:var(--green-d)">${rp(T.masuk)}</b></div>
      <div><small>Total keluar</small><b style="color:var(--red)">${rp(T.keluar)}</b></div>
      <div><small>Saldo kas</small><b>${rp(T.saldo)}</b></div>
      <div><small>Total tunggakan</small><b style="color:var(--amber)">${rp(T.arrearsRp)}</b></div></div></section>
  </div><div>
    <section class="card glass fx"><h3>Per bulan ${D.settings.tahun}</h3><small>Hijau = masuk, merah = keluar</small>
      <div class="bars">${mon.map((x, i) => `<div class="bar"><div class="col"><i style="height:${Math.max(2, x.m / mx * 100)}%"></i><i class="o" style="height:${Math.max(2, x.k / mx * 100)}%"></i></div><small>${BLN[i][0]}</small></div>`).join('')}</div></section>
    <section class="card glass fx"><h3>Belum bayar minggu ini (${unpaid.length})</h3>
      <p style="margin:6px 0 10px;font-size:13.5px">${unpaid.length ? unpaid.map(s => esc(s.nama)).join(', ') : 'Semua sudah bayar 🎉'}</p>
      <div class="btns">${S.admin && unpaid.length ? `<button class="btn soft sm" data-act="copyRemind">${ic('copy', 15)} Salin pesan pengingat grup</button>` : ''}
      ${D.settings.spreadsheetUrl ? `<a class="btn ghost sm" target="_blank" rel="noopener" href="${esc(D.settings.spreadsheetUrl)}">${ic('sheet', 15)} Buka Spreadsheet</a>` : ''}</div></section>
  </div></div>`;
};

/* ---------- Bayar Kas + verifikasi bukti ---------- */
const STAT = { pending: ['Menunggu verifikasi', 'wait'], approved: ['Disetujui', 'ok'], rejected: ['Ditolak', 'bad'] };
const weeksText = ix => ix.length <= 2 ? ix.map(idxLabel).join(', ') : `${idxLabel(ix[0])} – ${idxLabel(ix[ix.length - 1])} (${ix.length} mgg)`;
function proofIdxs(s, w) {            // minggu yang akan dibayar: tunggakan dulu, lalu minggu depan; lewati yang sedang diverifikasi
  const x = stat(s), busy = new Set(S.proofs.filter(q => q.status === 'pending').flatMap(q => q.idxs)), out = x.due.filter(i => !busy.has(i));
  let i = Math.max(x.cur + 1, x.start); while (out.length < w && i <= 47) { if (!x.paid.has(i) && !busy.has(i)) out.push(i); i++; }
  return out.slice(0, w);
}
const myProofCard = q => {
  const [lb, cl] = STAT[q.status];
  return `<div class="pcard ${cl} fx"><div class="p-ic">${ic(q.status === 'approved' ? 'check' : q.status === 'rejected' ? 'x' : 'clock', 22)}</div>
    <div class="grow"><b>${lb}</b><small>${weeksText(q.idxs)} · ${rp(q.amount)}</small>${q.status === 'rejected' && q.alasan ? `<small class="why">Alasan: ${esc(q.alasan)}</small>` : ''}</div>
    ${q.status === 'approved' ? `<button class="btn primary sm" data-act="proofOk" data-id="${q.id}">OK</button>` : ''}
    ${q.status === 'rejected' ? `<button class="btn primary sm" data-act="proofRetry" data-id="${q.id}">Kirim ulang</button>` : ''}</div>`;
};
const adminProofs = () => {
  const L = S.plist || [], pend = L.filter(q => q.status === 'pending');
  return `${secH('Verifikasi bukti' + (pend.length ? ` <span class="cnt">${pend.length}</span>` : ''))}
  <div class="glass list-wrap fx"><div class="list">${L.map(q => `<button class="row lite" data-act="proofOpen" data-id="${q.id}">
      <div class="tx-ic ${q.status === 'pending' ? 'wait' : q.status === 'approved' ? 'in' : 'out'}">${ic(q.status === 'approved' ? 'check' : q.status === 'rejected' ? 'x' : 'clock', 18)}</div>
      <div class="grow"><b>${esc(q.nama)}</b><small>${weeksText(q.idxs)} · ${esc(q.tgl)}</small></div>
      <span class="amt">${rp(q.amount)}</span></button>`).join('') || '<div class="empty">Belum ada bukti masuk</div>'}</div></div>`;
};
V.bayar = () => {
  const D = S.data, st = D.settings, me = D.students.find(s => s.id === S.me), mx = me && stat(me);
  const w = Math.min(12, Math.max(1, S.payWeeks || (mx ? Math.max(1, mx.arrears) : 1))); S.payWeeks = w;
  const ix = me ? proofIdxs(me, w) : [], total = ix.length * Number(st.nominal);
  const stepper = `<div class="stepper"><button data-act="payDec" aria-label="Kurangi">−</button><b>${w} minggu</b><button data-act="payInc" aria-label="Tambah">+</button></div>
    <div class="amount-big">${rp(me ? total : w * Number(st.nominal))}</div>${ix.length ? `<p style="margin-top:2px"><small>${weeksText(ix)}</small></p>` : ''}`;
  return `${header('Bayar kas')}
  ${S.admin ? adminProofs() : ''}
  ${S.proofs.length ? `<div class="pcards">${S.proofs.map(myProofCard).join('')}</div>` : ''}
  <div class="cols"><div>
  <section class="card glass qr-box fx"><h3>QRIS ${esc(st.bendahara)}</h3>
    <div class="qr">${st.qris ? `<img src="${esc(st.qris)}" alt="QRIS ${esc(st.bendahara)}" loading="lazy" decoding="async">` : `<div class="qr-ph">${ic('qr', 70)}<div>QR belum diunggah</div></div>`}</div>
    ${stepper}
    <div class="btns" style="justify-content:center;margin-top:12px">
      <button class="btn soft sm" data-act="copyAmt" data-v="${me ? total : w * Number(st.nominal)}">${ic('copy', 15)} Salin nominal</button>
      ${st.qris ? `<a class="btn soft sm" href="${esc(st.qris)}" download="qris-${esc(st.bendahara)}.jpg">${ic('download', 15)} Unduh QR</a>` : ''}
    </div>
    <div class="btns" style="margin-top:14px"><button class="btn primary block" data-act="proofForm">${ic('send')} Kirim bukti bayar</button></div>
    ${S.admin ? `<div style="margin-top:12px"><label class="btn ghost sm" style="cursor:pointer">${ic('edit', 15)} ${st.qris ? 'Ganti' : 'Unggah'} QR<input id="qrFile" type="file" accept="image/*" hidden></label></div>` : ''}
  </section></div></div>`;
};
function proofForm(retry) {
  const me = S.data.students.find(s => s.id === S.me);
  if (!me) { toast('Pilih namamu dulu'); return pickMe(); }
  let ix;
  if (retry) { ix = retry.idxs; S.payWeeks = ix.length; } else ix = proofIdxs(me, S.payWeeks || 1);
  if (!ix.length) return toast('Tidak ada minggu yang bisa dibayar');
  S.proofFoto = ''; S.proofIx = ix;
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>Kirim bukti bayar</h2>
    <div class="kv"><div><b>${ix.length}</b><small>Minggu</small></div><div><b>${rp(ix.length * Number(S.data.settings.nominal))}</b><small>Nominal</small></div></div>
    <p style="margin:2px 0 12px;font-size:13px"><b>${weeksText(ix)}</b></p>
    <label class="drop" id="proofDrop"><input id="proofFile" type="file" accept="image/*" hidden><span id="proofPrev">${ic('camera', 30)}<b>Pilih foto bukti</b></span></label>
    <div class="field" style="margin-top:12px"><input id="proofNote" maxlength="200" placeholder="Catatan (opsional)"></div>
    <div class="grid2"><button class="btn ghost" data-act="close">Batal</button><button class="btn primary" id="proofSend" data-act="proofSend" disabled>Kirim</button></div>`, { type: 'proof' });
}
async function proofReview(id) {
  const q = (S.plist || []).find(x => x.id === id); if (!q) return;
  const [lb, cl] = STAT[q.status];
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>${esc(q.nama)}</h2>
    <p style="margin-bottom:10px"><span class="badge ${cl}">${lb}</span> <small>${weeksText(q.idxs)} · ${rp(q.amount)}</small></p>
    <div class="proof-img" id="proofImg"><div class="sk sk-row" style="height:220px"></div></div>
    ${q.note ? `<p style="margin:10px 0"><small>Catatan: ${esc(q.note)}</small></p>` : ''}
    ${q.status === 'pending' ? `<div class="field" style="margin-top:12px"><input id="rejWhy" placeholder="Alasan jika ditolak (opsional)" maxlength="200"></div>
      <div class="grid2"><button class="btn danger" data-act="proofNo" data-id="${q.id}">Tolak</button><button class="btn primary" data-act="proofYes" data-id="${q.id}">Setujui</button></div>`
      : `<button class="btn danger block" style="margin-top:12px" data-act="proofDel" data-id="${q.id}">${ic('trash', 16)} Hapus dari daftar</button>`}`, { type: 'proofReview', id });
  const r = await api('proofGet', { id });
  const box = $('#proofImg'); if (box) box.innerHTML = r.ok && r.foto ? `<img src="${esc(r.foto)}" alt="Bukti bayar">` : '<div class="empty">Foto tidak tersedia</div>';
}

V.menu = () => {
  const soon = (i, l) => `<div class="tile glass fx soon" aria-disabled="true"><span class="ti">${ic(i)}</span>${l}</div>`;
  const st = S.data.settings, tile = (act, icon, label, href) => `<${href ? `a href="${href}"` : `button data-act="${act}"`} class="tile glass fx"><span class="ti">${ic(icon)}</span>${label}</${href ? 'a' : 'button'}>`;
  const me = S.data.students.find(s => s.id === S.me);
  return `<h1 class="page-title fx">Menu</h1>
  <div class="menu-grid">
    ${tile('', 'wallet', 'Bayar Kas' + (S.admin ? (S.pending ? `<i class="tbadge">${S.pending}</i>` : '') : (S.proofs.some(q => q.status !== 'approved' || true) && S.proofs.length ? `<i class="tbadge">${S.proofs.length}</i>` : '')), '#/bayar')}
    ${tile('', 'clock', 'Riwayat', '#/riwayat')}
    ${tile('', 'chart', 'Rangkuman', '#/rangkuman')}
    ${tile('', 'users', 'Siswa', '#/siswa')}
    ${tile('', 'mega', 'Pengumuman', '#/pengumuman')}
    ${st.spreadsheetUrl ? `<a class="tile glass fx" href="${esc(st.spreadsheetUrl)}" target="_blank" rel="noopener"><span class="ti">${ic('sheet')}</span>Spreadsheet</a>` : ''}
    ${soon('calendar', 'Jadwal')}
    ${tile('notif', 'bell', 'Pengingat')}
    ${tile('pickMe', 'user', me ? esc(me.nama.replace(/\(.*?\)/g, '').trim().split(' ')[0]) : 'Pilih nama')}
    ${isStandalone() ? '' : tile('install', 'phone', 'Pasang')}
    ${tile('', 'shield', 'Admin', '#/admin')}
    ${tile(S.admin ? 'logout' : 'login', S.admin ? 'logout' : 'lock', S.admin ? 'Keluar' : 'Masuk')}
  </div>`;
};

V.admin = () => {
  if (!S.admin) return `${header('Menu admin')}<div class="empty glass card fx"><button class="btn primary" data-act="login">Masuk Admin</button></div>`;
  const D = S.data, t = (act, i, l, href) => `<${href ? `a href="${href}"` : `button data-act="${act}"`} class="tile glass fx"><span class="ti">${ic(i)}</span>${l}</${href ? 'a' : 'button'}>`;
  return `${header('Menu admin')}
  <div class="menu-grid">
    ${t('addStudent', 'users', 'Tambah siswa')}
    ${t('addAnn', 'mega', 'Pengumuman')}
    ${t('addTx', 'wallet', 'Transaksi')}
    ${t('', 'qr', 'QR QRIS', '#/bayar')}
    ${t('', 'settings', 'Pengaturan', '#/pengaturan')}
    ${t('logout', 'logout', 'Keluar')}
  </div>
  ${secH('Kelola siswa')}
  <div class="glass list-wrap"><div class="list">${D.students.map(s => `<div class="row lite">${avatar(s)}<div class="grow"><b>${esc(s.nama)}</b><small>${s.claimed ? 'Sudah diklaim' : 'Belum diklaim'}</small></div>
    ${s.claimed ? `<button class="ib" data-act="release" data-id="${s.id}" aria-label="Lepas klaim ${esc(s.nama)}">${ic('unlock', 18)}</button>` : ''}
    <button class="ib" data-act="editStudent" data-id="${s.id}" aria-label="Edit ${esc(s.nama)}">${ic('edit', 18)}</button>
    <button class="ib" data-act="delStudent" data-id="${s.id}" aria-label="Hapus ${esc(s.nama)}">${ic('trash', 18)}</button></div>`).join('') || '<div class="empty">Belum ada siswa</div>'}</div></div>`;
};

V.pengaturan = () => {
  if (!S.admin) return `${header()}<div class="empty glass card">Khusus admin. <button class="btn primary sm" data-act="login">Masuk Admin</button></div>`;
  const st = S.data.settings;
  return `${header('Pengaturan admin')}
  <form class="card glass fx" data-form="settings">
    <div class="grid2"><div class="field"><label>Nama kelas</label><input name="kelas" value="${esc(st.kelas)}" required></div>
    <div class="field"><label>Tahun</label><input name="tahun" type="number" value="${esc(st.tahun)}" required></div></div>
    <div class="grid2"><div class="field"><label>Kas per minggu (Rp)</label><input name="nominal" type="number" min="0" value="${esc(st.nominal)}" required></div>
    <div class="field"><label>Mulai kas bulan</label><select name="mulaiBulan">${BLNF.map((b, i) => `<option value="${i + 1}" ${Number(st.mulaiBulan) === i + 1 ? 'selected' : ''}>${b}</option>`).join('')}</select></div></div>
    <div class="grid2"><div class="field"><label>Nama bendahara</label><input name="bendahara" value="${esc(st.bendahara)}" required></div>
    <div class="field"><label>WhatsApp bendahara</label><input name="wa" inputmode="tel" placeholder="628123456789" value="${esc(st.wa)}"></div></div>
    <div class="field"><label>Link Google Spreadsheet</label><input name="spreadsheetUrl" type="url" placeholder="https://docs.google.com/spreadsheets/…" value="${esc(st.spreadsheetUrl)}"></div>
    <button class="btn primary block" type="submit">Simpan pengaturan</button></form>
  <form class="card glass fx" data-form="pin"><h3 style="margin-bottom:10px">Ganti PIN admin</h3>
    <div class="field"><label>PIN baru (min. 4 karakter)</label><input name="newPin" type="password" minlength="4" required autocomplete="new-password"></div>
    <button class="btn soft block" type="submit">Ganti PIN</button></form>`;
};

/* ---------- navigasi ---------- */
const NAV = [['beranda', 'Beranda', 'home'], ['pengumuman', 'Pengumuman', 'mega'], ['siswa', 'Siswa', 'users'], ['riwayat', 'Riwayat', 'clock'], ['rangkuman', 'Rangkuman', 'chart'], ['bayar', 'Bayar Kas', 'wallet'], ['menu', 'Menu', 'grid']];
const DOCK = ['beranda', 'pengumuman', 'siswa', 'menu'];
let dockI = null;
function buildNav() {
  const on = r => S.route === r ? 'on' : '';
  const T = S.data ? totals(S.data) : null;
  $('#side').innerHTML = `
    <div class="brand" style="padding:6px 8px 14px"><div><b>Kas Kelas</b><small>${esc(S.data ? S.data.settings.kelas : '')}</small></div></div>
    ${NAV.map(([r, l, i]) => `<a class="nav-i ${on(r)}" href="#/${r}">${ic(i)} ${l}</a>`).join('')}
    ${S.admin ? `<a class="nav-i ${on('pengaturan')}" href="#/pengaturan">${ic('settings')} Pengaturan</a>` : ''}
    <div class="grow"></div>
    <div class="adm">${ic(S.admin ? 'user' : 'lock', 18)}<span>${S.admin ? 'Admin aktif' : 'Mode lihat'}</span><button class="btn sm soft" style="margin-left:auto" data-act="${S.admin ? 'logout' : 'login'}">${S.admin ? 'Keluar' : 'Masuk'}</button></div>`;
  const ai = Math.max(0, DOCK.indexOf(S.route) < 0 ? 3 : DOCK.indexOf(S.route));
  const fab = S.admin ? `<button class="fab glass" data-act="addTx" aria-label="Tambah transaksi">${ic('plus')}</button>` : `<a class="fab glass" href="#/bayar" aria-label="Bayar kas">${ic('plus')}</a>`;
  const bn = r => { const [, l, i] = NAV.find(n => n[0] === r); return `<a class="bn ${DOCK.indexOf(S.route) < 0 && r === 'menu' ? 'on' : on(r)}" href="#/${r}">${ic(i)}<span>${l}</span>${r === 'siswa' && T && T.arrearsPeople ? `<span class="badge-dot">${T.arrearsPeople}</span>` : ''}</a>`; };
  $('#bottom').innerHTML = `${fab}<div class="dnav-wrap"><div class="dnav glass" style="--i:${dockI == null ? ai : dockI}"><i class="lens" aria-hidden="true"></i>${DOCK.map(bn).join('')}</div></div>`;
  if (dockI != null && dockI !== ai) requestAnimationFrame(() => requestAnimationFrame(() => { const d = $('.dnav'); d && d.style.setProperty('--i', ai); }));
  dockI = ai;
}
/* dock menyusut jadi tombol + saat scroll ke bawah, muncul lagi saat scroll ke atas */
let lastY = 0, acc = 0, scTick = false;
const setDock = min => { const d = $('#bottom'); if (d) d.classList.toggle('min', min); };
window.addEventListener('scroll', () => {
  if (scTick) return; scTick = true;
  requestAnimationFrame(() => {
    scTick = false; const y = window.scrollY, dy = y - lastY; lastY = y;
    if (y < 60) { acc = 0; setDock(false); return; }
    acc = (dy > 0) === (acc > 0) ? acc + dy : dy;      // jarak scroll searah
    if (acc > 14) setDock(true); else if (acc < -14) setDock(false);
  });
}, { passive: true });
if (/Chrome\//.test(navigator.userAgent) && !/iPhone|iPad/.test(navigator.userAgent)) document.documentElement.classList.add('refract');

function render(keepScroll) {
  const v = $('#view'), y = window.scrollY;
  if (!S.data) { v.innerHTML = S.err ? `<div class="card glass empty">${esc(S.err)}<br><br><button class="btn primary" data-act="refresh">Coba lagi</button></div>` : skeleton(); buildNav(); return; }
  v.innerHTML = (V[S.route] || V.beranda)();
  buildNav(); observeFx(); lazyMore(); countUp();
  if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
}
function route() {
  const r = (location.hash.replace(/^#\/?/, '') || 'beranda');
  S.route = V[r] ? r : 'beranda';
  S.lim = { st: 16, tx: 14 };
  setDock(false); closeSheet(); render(); if (S.route === 'bayar' && S.admin) loadProofs();
}

/* lazy render daftar panjang: tampilkan bertahap saat discroll */
let moreIO;
function lazyMore() {
  moreIO && moreIO.disconnect();
  const el = $('#moreSt') || $('#moreTx'); if (!el || !('IntersectionObserver' in window)) return;
  moreIO = new IntersectionObserver(es => { if (es[0].isIntersecting) { S.lim.st += 16; S.lim.tx += 14; render(true); } }, { rootMargin: '300px' });
  moreIO.observe(el);
}

/* ---------- aksi ---------- */
function applyState(r) {
  if (!r || !r.ok || !r.data) return false;
  S.data = r.data; S.updated = new Date(); S.err = ''; ls.set(KEY, r.data);
  if (typeof r.me === 'number') { S.me = r.me; ls.set('kas-me', r.me); }
  if (r.proofs) S.proofs = r.proofs;
  if (typeof r.pending === 'number') S.pending = r.pending;
  return true;
}
async function loadProofs() { if (!S.admin) return; const r = await api('proofList'); if (r.ok) { S.plist = r.list; if (r.data) { S.data = r.data; } if (S.route === 'bayar' || S.route === 'beranda') render(true); } }
async function loadData(silent) {
  S.loading = true; if (!S.data) render(); else $$('[data-act=refresh]').forEach(b => b.classList.add('spin'));
  const r = await api('data');
  S.loading = false;
  if (applyState(r)) { /* ok */ }
  else if (!S.data) S.err = r.error || 'Gagal memuat data';
  else if (!silent) toast(r.error || 'Gagal memuat');
  if (S.admin === false && S.pin) verifyPin(); else if (S.admin) loadProofs();
  render(!!S.data); refreshSheet(); maybeNotify();
  if (S.data && r.ok && !S.me && !S.asked && S.route === 'beranda' && !S.sheet && S.data.students.some(x => !x.claimed)) { S.asked = true; setTimeout(() => { if (!S.me && !S.sheet) pickMe(); }, 500); }
}
async function verifyPin() { const r = await api('login', { pin: S.pin }); if (r.ok) { S.admin = true; applyAdmin(); render(true); loadProofs(); } else { S.pin = ''; ls.del('kas-pin'); } }
async function write(action, p, okMsg) {
  const r = await api(action, p);
  if (r.ok) { if (r.data) { S.data = r.data; S.updated = new Date(); ls.set(KEY, r.data); } if (r.list) { S.plist = r.list; S.pending = r.list.filter(q => q.status === 'pending').length; } if (okMsg) toast(okMsg); render(true); refreshSheet(); }
  else toast(r.error || 'Gagal menyimpan');
  return r;
}
function refreshSheet() { if (S.sheet && S.sheet.type === 'student') showStudent(S.sheet.id); }

function showStudent(id) {
  const D = S.data, s = D.students.find(x => x.id === id); if (!s) return closeSheet();
  const x = stat(s), nom = Number(D.settings.nominal), tahun = Number(D.settings.tahun);
  const months = BLNF.map((_, m) => `<div class="mo"><small>${BLN[m]}</small><div class="dots">${[0, 1, 2, 3].map(w => {
    const i = m * 4 + w, p = x.paid.has(i), before = i < x.start, fut = i > x.cur;
    const cls = p ? 'paid' : (before || fut) ? 'off' : 'due';
    const inner = p ? ic('check', 14) : `M${w + 1}`;
    return S.admin ? `<button class="dot ${cls} ${i === x.cur ? 'now' : ''}" data-act="toggleWeek" data-id="${s.id}" data-i="${i}" aria-label="${idxLabel(i)}">${inner}</button>` : `<span class="dot ${cls} ${i === x.cur ? 'now' : ''}" title="${idxLabel(i)}">${inner}</span>`;
  }).join('')}</div></div>`).join('');
  openSheet(`
    <button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button>
    <div class="s-head">${S.me === s.id ? `<label class="edit-photo" aria-label="Ganti foto">${avatar(s, 'big')}<span class="cam">${ic('camera')}</span><input id="fotoFile" type="file" accept="image/*" hidden></label>` : avatar(s)}<div><h2 style="margin:0">${esc(s.nama)}</h2>${badge(x)}</div></div>
    <div class="kv"><div><b>${x.thisPaid ? 'Lunas' : 'Belum'}</b><small>Minggu ini</small></div><div><b>${x.paidCount}/${x.expected}</b><small>Minggu dibayar</small></div><div><b style="color:${x.arrears ? 'var(--red)' : 'var(--green-d)'}">${rp(x.amount)}</b><small>Tunggakan</small></div></div>
    ${x.arrears ? `<p style="margin-bottom:10px;font-size:13.5px"><b>Belum dibayar:</b> ${x.due.map(idxLabel).join(', ')}</p>` : '<p style="margin-bottom:10px;font-size:13.5px">Lunas semua 🎉</p>'}
    <div class="legend"><span><i style="background:var(--green)"></i>Bayar</span><span><i style="background:var(--red-l);box-shadow:inset 0 0 0 1.5px var(--red)"></i>Belum</span><span><i style="background:#e6ece8"></i>Belum jatuh tempo</span></div>
    <div class="mgrid">${months}</div>
    <div class="btns">
      ${S.me === s.id && s.foto ? `<button class="btn ghost sm" data-act="delFoto">Hapus foto</button>` : ''}
      ${S.me === s.id ? `<button class="btn ghost sm" data-act="unclaim">${ic('unlock', 15)} Lepas namaku</button>` : ''}
      ${S.admin && s.claimed && S.me !== s.id ? `<button class="btn ghost sm" data-act="release" data-id="${s.id}">${ic('unlock', 15)} Lepas klaim</button>` : ''}
      ${S.admin && !x.thisPaid && x.cur >= 0 ? `<button class="btn primary sm" data-act="payThis" data-id="${s.id}">${ic('check', 15)} Tandai lunas minggu ini</button>` : ''}
      ${S.admin && x.arrears > 1 ? `<button class="btn primary sm" data-act="payAll" data-id="${s.id}">Lunasi semua (${rp(x.amount)})</button>` : ''}
      ${S.admin && x.arrears ? `<button class="btn ghost sm" data-act="remind" data-id="${s.id}">${ic('send', 15)} Ingatkan via WA</button>` : ''}
      ${S.admin ? `<button class="btn ghost sm" data-act="editStudent" data-id="${s.id}">${ic('edit', 15)} Edit data</button>` : ''}
    </div>
`, { type: 'student', id });
}

function txForm(t) {
  S.txFoto = undefined;
  const keluar = !t || t.tipe === 'Keluar';
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>${t ? 'Edit' : 'Catat'} Transaksi</h2>
  <form data-form="tx" data-id="${t ? t.id : 0}" class="${keluar ? 'is-out' : ''}" id="txf">
    <div class="field"><label>Jenis</label><select name="tipe" id="txTipe"><option value="Keluar" ${keluar ? 'selected' : ''}>Pengeluaran</option><option value="Masuk" ${!keluar ? 'selected' : ''}>Pemasukan</option></select></div>
    <div class="field"><label>Keterangan</label><input name="ket" required placeholder="Contoh: Beli spidol" value="${t ? esc(t.ket) : ''}"></div>
    <div class="grid2"><div class="field"><label>Jumlah (Rp)</label><input name="jumlah" type="number" min="1" inputmode="numeric" required value="${t ? t.jumlah : ''}"></div>
    <div class="field"><label>Tanggal</label><input name="tgl" type="date" required value="${t ? t.tgl : todayStr()}"></div></div>
    <div class="only-out">
      <div class="field"><label>Detail pengeluaran</label><textarea name="detail" placeholder="Beli apa, di mana, untuk keperluan apa…">${t ? esc(t.detail || '') : ''}</textarea></div>
      <label class="drop" id="buktiDrop"><input id="buktiFile" type="file" accept="image/*" hidden><span id="buktiPrev">${t && t.hasBukti ? `${ic('check', 26)}<b>Bukti sudah ada · ketuk untuk ganti</b>` : `${ic('camera', 30)}<b>Foto bukti pengeluaran (nota/struk)</b>`}</span></label>
      ${t && t.hasBukti ? '<button type="button" class="link" data-act="buktiDel" style="margin:8px 0 12px">Hapus bukti</button>' : '<div style="height:12px"></div>'}
    </div>
    <div class="grid2"><button type="button" class="btn ghost" data-act="close">Batal</button><button class="btn primary" type="submit">Simpan</button></div>
    ${t ? `<button type="button" class="btn danger block" style="margin-top:10px" data-act="delTx" data-id="${t.id}">${ic('trash', 16)} Hapus transaksi</button>` : ''}
  </form>`);
}
async function txDetail(id) {
  const t = S.data.tx.find(x => x.id === id); if (!t) return;
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>${esc(t.ket)}</h2>
    <div class="kv"><div><b style="color:var(--red)">-${rp(t.jumlah)}</b><small>Pengeluaran</small></div><div><b>${fmtDate(t.tgl)}</b><small>Tanggal</small></div></div>
    <h3 style="margin:4px 0 6px;font-size:14px">Detail</h3>
    <p style="white-space:pre-wrap;margin-bottom:12px">${t.detail ? esc(t.detail) : '<small>Tidak ada detail.</small>'}</p>
    ${t.hasBukti ? `<h3 style="margin:4px 0 6px;font-size:14px">Bukti pengeluaran</h3><div class="proof-img" id="buktiImg"><div class="sk sk-row" style="height:200px"></div></div>` : ''}
    ${S.admin ? `<div class="btns" style="margin-top:14px"><button class="btn soft sm" data-act="editTx" data-id="${t.id}">${ic('edit', 15)} Edit</button></div>` : ''}`, { type: 'txDetail', id });
  if (t.hasBukti) { const r = await api('txBukti', { id }); const b = $('#buktiImg'); if (b) b.innerHTML = r.ok && r.bukti ? `<img src="${esc(r.bukti)}" alt="Bukti pengeluaran">` : '<div class="empty">Foto tidak tersedia</div>'; }
}
function annForm(a) {
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>${a ? 'Edit' : 'Buat'} Pengumuman</h2>
  <form data-form="ann" data-id="${a ? a.id : 0}">
    <div class="field"><label>Judul</label><input name="judul" required value="${a ? esc(a.judul) : ''}"></div>
    <div class="field"><label>Isi</label><textarea name="isi" required>${a ? esc(a.isi) : ''}</textarea></div>
    <label style="display:flex;gap:8px;align-items:center;margin-bottom:14px;font-size:14px"><input type="checkbox" name="pin" ${a && a.pin ? 'checked' : ''}> Sematkan (penting)</label>
    <div class="grid2"><button type="button" class="btn ghost" data-act="close">Batal</button><button class="btn primary" type="submit">Simpan</button></div></form>`);
}
function studentForm(s) {
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>${s ? 'Edit' : 'Tambah'} Siswa</h2>
  <form data-form="student" data-id="${s ? s.id : 0}">
    <div class="field"><label>Nama</label><input name="nama" required value="${s ? esc(s.nama) : ''}"></div>
    <div class="field"><label>No. WhatsApp (opsional, untuk pengingat)</label><input name="hp" inputmode="tel" placeholder="628123456789" value="${s ? esc(s.hp) : ''}"></div>
    <div class="grid2"><button type="button" class="btn ghost" data-act="close">Batal</button><button class="btn primary" type="submit">Simpan</button></div></form>`);
}
function loginForm() {
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>Masuk Admin</h2>
  <form data-form="login"><div class="field"><label>PIN</label><input name="pin" type="password" required autocomplete="current-password" autofocus></div>
  <button class="btn primary block" type="submit">Masuk</button>${DEMO ? '<p style="margin-top:10px"><small>Demo: PIN 1234</small></p>' : ''}</form>`);
}
function pickMe() {
  if (S.me) return showStudent(S.me);
  const L = S.data.students;
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>Kamu siapa?</h2>
  <div class="list">${L.map(s => `<button class="row lite pick-row ${s.claimed ? 'taken' : ''}" data-act="askClaim" data-id="${s.id}">${avatar(s)}<div class="grow"><b>${esc(s.nama)}</b></div>${s.claimed ? '<span class="badge muted">Diklaim</span>' : ic('chev')}</button>`).join('') || '<div class="empty">Belum ada siswa</div>'}</div>`, { type: 'pick' });
}
function askClaim(id) {
  const s = S.data.students.find(x => x.id === id); if (!s || s.claimed) return;
  openSheet(`<h2>Kamu ${esc(s.nama)}?</h2><p style="margin-bottom:14px;font-size:14px">Nama ini akan terkunci untuk perangkatmu dan tidak bisa dipakai orang lain.</p>
  <div class="grid2"><button class="btn ghost" data-act="pickBack">Bukan</button><button class="btn primary" data-act="doClaim" data-id="${s.id}">Ya, itu aku</button></div>`, { type: 'confirm' });
}
function compressImg(file, o) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const c = document.createElement('canvas'), x = c.getContext('2d'); let w, h, sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (o.square) { const k = Math.min(img.width, img.height); sx = (img.width - k) / 2; sy = (img.height - k) / 2; sw = sh = k; w = h = o.max; }
      else { const k = Math.min(1, o.max / Math.max(img.width, img.height)); w = Math.round(img.width * k); h = Math.round(img.height * k); }
      c.width = w; c.height = h; x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      let q = .8, d = c.toDataURL('image/jpeg', q); while (d.length > o.limit && q > .3) { q -= .1; d = c.toDataURL('image/jpeg', q); }
      URL.revokeObjectURL(url); d.length > o.limit * 1.25 ? rej(new Error('Foto terlalu besar')) : res(d);
    };
    img.onerror = () => rej(new Error('Foto tidak bisa dibaca'));
    img.src = url;
  });
}

/* ---------- pengingat HP (notifikasi lokal) ---------- */
async function showNotif(title, body) {
  try { const reg = await navigator.serviceWorker.getRegistration(); if (reg) return reg.showNotification(title, { body, icon: 'img/icon-192.png', badge: 'img/favicon.png', tag: 'kas', data: {} }); } catch {}
  try { new Notification(title, { body, icon: 'img/icon-192.png' }); } catch {}
}
function maybeNotify() {
  if (!S.data || !S.me || !('Notification' in window) || Notification.permission !== 'granted') return;
  const s = S.data.students.find(x => x.id === S.me); if (!s) return;
  const x = stat(s); if (x.arrears < 1) return;
  const k = 'kas-notif-' + todayStr(); if (ls.get(k)) return; ls.set(k, 1);
  showNotif('Kas kelas belum lunas', `Hai ${s.nama.split(' ')[0]}, kamu belum bayar kas ${x.arrears} minggu (${rp(x.amount)}). Yuk bayar lewat QRIS.`);
}
async function toggleNotif() {
  if (!('Notification' in window)) return toast('Browser ini belum mendukung notifikasi');
  if (!S.me) { toast('Pilih namamu dulu'); return pickMe(); }
  if (Notification.permission === 'denied') return toast('Notifikasi diblokir. Aktifkan di pengaturan browser.');
  const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (p === 'granted') { toast('Pengingat aktif'); const s = S.data.students.find(x => x.id === S.me), x = stat(s);
    showNotif('Pengingat kas aktif ✅', x.arrears ? `Kamu masih punya tunggakan ${x.arrears} minggu (${rp(x.amount)}).` : 'Kasmu sudah lunas, mantap!'); ls.del('kas-notif-' + todayStr()); }
}

/* ---------- pasang aplikasi (PWA sungguhan) ---------- */
let deferredInstall;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstall = e; if (S.data && S.route === 'beranda') render(true); });
window.addEventListener('appinstalled', () => { deferredInstall = null; toast('Aplikasi terpasang 🎉'); render(true); });
async function install() {
  if (isStandalone()) return toast('Sudah terpasang sebagai aplikasi');
  if (deferredInstall) { const p = deferredInstall; deferredInstall = null; p.prompt(); await p.userChoice; render(true); return; }
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  openSheet(`<button class="ib x" data-act="close" aria-label="Tutup">${ic('x')}</button><h2>Pasang aplikasi</h2>
  <ol class="steps">${ios ? `<li><span>Buka di <b>Safari</b>, ketuk tombol <b>Bagikan</b>.</span></li><li><span>Pilih <b>Tambah ke Layar Utama</b>.</span></li>`
  : `<li><span>Buka web ini di <b>Chrome</b>, ketuk <b>⋮</b> di kanan atas.</span></li><li><span>Pilih <b>Instal aplikasi</b> (bukan "Tambahkan ke layar utama").</span></li><li><span>Kalau pilihan "Instal aplikasi" tidak ada, muat ulang halaman 2x lalu coba lagi.</span></li>`}</ol>`);
}

/* ---------- event delegation ---------- */
const ACT = {
  close: closeSheet,
  refresh: () => loadData(),
  notif: toggleNotif,
  install,
  login: loginForm,
  logout: () => { S.admin = false; S.pin = ''; ls.del('kas-pin'); applyAdmin(); closeSheet(); render(true); toast('Keluar dari admin'); },
  pickMe,
  askClaim: t => askClaim(+t.dataset.id),
  pickBack: () => pickMe(),
  doClaim: async t => {
    const r = await api('claim', { studentId: +t.dataset.id });
    if (applyState(r)) { toast('Nama terkunci untukmu'); closeSheet(); render(true); maybeNotify(); }
    else { toast(r.error || 'Gagal'); await loadData(true); if (!S.me) pickMe(); }
  },
  unclaim: async () => { if (!confirm('Lepas namamu? Orang lain bisa memilih nama ini.')) return; const r = await api('unclaim'); if (applyState(r)) { closeSheet(); render(true); toast('Nama dilepas'); } else toast(r.error || 'Gagal'); },
  release: t => { const x = S.data.students.find(v => v.id === +t.dataset.id); if (x && confirm(`Lepas klaim ${x.nama}?`)) write('releaseClaim', { id: x.id }, 'Klaim dilepas'); },
  delFoto: async () => { const r = await api('photo', { foto: '' }); if (applyState(r)) { render(true); refreshSheet(); toast('Foto dihapus'); } else toast(r.error || 'Gagal'); },
  noInst: () => { ls.set('kas-noinst', 1); render(true); },
  proofForm: () => proofForm(),
  proofRetry: t => proofForm(S.proofs.find(q => q.id === +t.dataset.id)),
  proofSend: async t => {
    if (!S.proofFoto) return toast('Pilih foto bukti dulu');
    t.disabled = true; t.classList.add('load');
    const r = await api('proofSubmit', { idxs: S.proofIx, foto: S.proofFoto, note: ($('#proofNote') || {}).value || '' });
    if (applyState(r)) { closeSheet(); render(true); toast('Bukti terkirim, menunggu verifikasi'); confetti(innerWidth / 2, innerHeight * .6, 14); }
    else { t.disabled = false; t.classList.remove('load'); toast(r.error || 'Gagal mengirim'); }
  },
  proofOk: async t => { confetti(t.getBoundingClientRect().left, t.getBoundingClientRect().top, 26); const r = await api('proofAck', { id: +t.dataset.id }); if (applyState(r)) render(true); },
  proofOpen: t => proofReview(+t.dataset.id),
  proofYes: async t => { const r = await write('proofApprove', { id: +t.dataset.id }, 'Disetujui · minggu dicentang'); if (r.ok) { closeSheet(); confetti(innerWidth / 2, innerHeight * .5, 24); } },
  proofNo: async t => { const r = await write('proofReject', { id: +t.dataset.id, alasan: ($('#rejWhy') || {}).value || '' }, 'Bukti ditolak'); if (r.ok) closeSheet(); },
  proofDel: async t => { const r = await write('proofDelete', { id: +t.dataset.id }, 'Dihapus'); if (r.ok) closeSheet(); },
  txDetail: t => txDetail(+t.dataset.id),
  buktiDel: () => { S.txFoto = ''; const p = $('#buktiPrev'); if (p) p.innerHTML = `${ic('camera', 30)}<b>Foto bukti pengeluaran (nota/struk)</b>`; toast('Bukti akan dihapus saat disimpan'); },
  openStudent: t => showStudent(+t.dataset.id),
  stFilter: t => { S.stFilter = t.dataset.v; S.lim.st = 16; render(true); },
  txFilter: t => { if (t.dataset.v === S.txFilter) return; S.segFrom = S.txFilter === 'Keluar' ? 100 : 0; S.txFilter = t.dataset.v; S.lim.tx = 14; S.tq = ''; render(true); },
  addTx: () => txForm(),
  editTx: t => txForm(S.data.tx.find(x => x.id === +t.dataset.id)),
  delTx: async t => { if (confirm('Hapus transaksi ini?')) { await write('deleteTx', { id: +t.dataset.id }, 'Transaksi dihapus'); closeSheet(); } },
  editAnn: t => annForm(S.data.ann.find(a => a.id === +t.dataset.id)),
  delAnn: async t => { if (confirm('Hapus pengumuman ini?')) write('deleteAnn', { id: +t.dataset.id }, 'Dihapus'); },
  addAnn: () => annForm(),
  addStudent: () => studentForm(),
  delStudent: async t => { const x = S.data.students.find(v => v.id === +t.dataset.id); if (x && confirm(`Hapus ${x.nama}? Catatan kasnya ikut terhapus.`)) write('deleteStudent', { id: x.id }, 'Siswa dihapus'); },
  editStudent: t => studentForm(S.data.students.find(s => s.id === +t.dataset.id)),
  toggleWeek: async t => {
    const id = +t.dataset.id, i = +t.dataset.i, set = new Set(S.data.paid[id] || []), paid = !set.has(i);
    paid ? set.add(i) : set.delete(i); S.data.paid[id] = [...set]; refreshSheet(); render(true); // optimistis
    const r = await api('togglePaid', { studentId: id, idx: i, paid });
    if (r.ok) { S.data = r.data; ls.set(KEY, r.data); toast(paid ? `Lunas ${idxLabel(i)} · +${rp(S.data.settings.nominal)}` : 'Pembayaran dibatalkan'); }
    else { toast(r.error || 'Gagal'); await loadData(true); } render(true); refreshSheet();
  },
  payThis: t => { const s = S.data.students.find(x => x.id === +t.dataset.id); write('payMany', { studentId: s.id, idxs: [stat(s).cur] }, 'Ditandai lunas minggu ini'); },
  payAll: t => { const s = S.data.students.find(x => x.id === +t.dataset.id), x = stat(s); if (confirm(`Lunasi ${x.arrears} minggu (${rp(x.amount)}) untuk ${s.nama}?`)) write('payMany', { studentId: s.id, idxs: x.due }, 'Semua tunggakan lunas'); },
  remind: t => {
    const s = S.data.students.find(x => x.id === +t.dataset.id), x = stat(s), st = S.data.settings;
    const msg = `Halo ${s.nama.split(' ')[0]}, kas kelas kamu belum lunas ${x.arrears} minggu (${rp(x.amount)}). Yuk bayar lewat QRIS di web kas kelas ya 🙏 — ${st.bendahara}`;
    window.open(`https://wa.me/${(s.hp || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  },
  copyRemind: () => { const un = S.data.students.filter(s => !stat(s).thisPaid); copyText(`📢 Pengingat Kas ${S.data.settings.kelas}\nKas minggu ini ${rp(S.data.settings.nominal)}. Yang belum bayar:\n${un.map((s, i) => `${i + 1}. ${s.nama}${stat(s).arrears > 1 ? ` (${stat(s).arrears} mgg)` : ''}`).join('\n')}\n\nBayar via QRIS di web kas kelas, lalu kirim bukti ke ${S.data.settings.bendahara}. Terima kasih 🙏`); },
  payInc: () => { S.payWeeks = Math.min(12, (S.payWeeks || 1) + 1); render(true); },
  payDec: () => { S.payWeeks = Math.max(1, (S.payWeeks || 1) - 1); render(true); },
  copyAmt: t => copyText(t.dataset.v)
};
document.addEventListener('click', e => {
  if (e.target.id === 'sheet') return closeSheet();
  if (e.target.closest('.dock.min .fab')) { e.preventDefault(); return setDock(false); }
  const t = e.target.closest('[data-act]'); if (t && ACT[t.dataset.act]) { e.preventDefault(); ACT[t.dataset.act](t); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.sheet) closeSheet(); if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-act]')) { e.preventDefault(); e.target.click(); } });
document.addEventListener('input', e => {
  if (e.target.id === 'tq') { S.tq = e.target.value; S.lim.tx = 14; const pos = e.target.selectionStart; render(true); const q = $('#tq'); q.focus(); q.setSelectionRange(pos, pos); return; } if (e.target.id === 'q') { S.q = e.target.value; S.lim.st = 16; const pos = e.target.selectionStart; render(true); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); } });
document.addEventListener('change', async e => {
  if (e.target.id === 'txTipe') { $('#txf').classList.toggle('is-out', e.target.value === 'Keluar'); return; }
  if ((e.target.id === 'proofFile' || e.target.id === 'buktiFile') && e.target.files[0]) {
    const isProof = e.target.id === 'proofFile';
    try {
      const d = await compressImg(e.target.files[0], { max: 960, limit: 260000 });
      if (isProof) { S.proofFoto = d; const b = $('#proofSend'); if (b) b.disabled = false; } else S.txFoto = d;
      const box = $(isProof ? '#proofPrev' : '#buktiPrev'); if (box) box.innerHTML = `<img src="${d}" alt="Pratinjau">`;
    } catch (er) { toast(er.message); }
    return;
  }
  if (e.target.id === 'fotoFile' && e.target.files[0]) {
    try { const r = await api('photo', { foto: await compressImg(e.target.files[0], { max: 144, square: true, limit: 20000 }) }); if (applyState(r)) { render(true); refreshSheet(); toast('Foto diperbarui'); } else toast(r.error || 'Gagal'); }
    catch (er) { toast(er.message); }
    return;
  }
  if (e.target.id !== 'qrFile' || !e.target.files[0]) return;
  const f = e.target.files[0], img = new Image(), url = URL.createObjectURL(f);
  img.onload = async () => {
    const c = document.createElement('canvas'), k = Math.min(1, 520 / Math.max(img.width, img.height));
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
    let q = .85, d = c.toDataURL('image/jpeg', q); while (d.length > 45000 && q > .3) { q -= .1; d = c.toDataURL('image/jpeg', q); }
    URL.revokeObjectURL(url);
    if (d.length > 45000) return toast('Gambar QR terlalu besar, crop dulu');
    write('saveQris', { qris: d }, 'QRIS diperbarui');
  };
  img.src = url;
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
  const v = Object.fromEntries(new FormData(f)), id = +f.dataset.id || 0, btn = $('[type=submit]', f); btn && (btn.disabled = true);
  const type = f.dataset.form; let r;
  if (type === 'login') {
    const rr = await api('login', { pin: v.pin }); btn && (btn.disabled = false);
    if (rr.ok) { S.admin = true; S.pin = v.pin; ls.set('kas-pin', v.pin); applyAdmin(); closeSheet(); render(true); toast('Halo, ' + S.data.settings.bendahara + '!'); } else toast(rr.error || 'PIN salah');
    return;
  }
  if (type === 'tx') r = await write(id ? 'updateTx' : 'addTx', { id, ...v, detail: v.tipe === 'Keluar' ? (v.detail || '') : '', ...(S.txFoto !== undefined || v.tipe === 'Masuk' ? { bukti: v.tipe === 'Masuk' ? '' : S.txFoto } : {}) }, 'Transaksi disimpan');
  else if (type === 'ann') r = await write('saveAnn', { id, judul: v.judul, isi: v.isi, pin: !!v.pin }, 'Pengumuman disimpan');
  else if (type === 'student') r = await write(id ? 'saveStudent' : 'addStudent', { id, nama: v.nama, hp: v.hp }, 'Data siswa disimpan');
  else if (type === 'settings') r = await write('saveSettings', { settings: { ...v, tahun: +v.tahun, nominal: +v.nominal, mulaiBulan: +v.mulaiBulan } }, 'Pengaturan disimpan');
  else if (type === 'pin') { r = await write('changePin', { newPin: v.newPin }, 'PIN diganti'); if (r.ok) { S.pin = v.newPin; ls.set('kas-pin', v.newPin); f.reset(); } }
  btn && (btn.disabled = false);
  if (r && r.ok && type !== 'settings' && type !== 'pin') closeSheet();
});
window.addEventListener('hashchange', route);
let lastFocus = Date.now();
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastFocus > 60000) { lastFocus = Date.now(); loadData(true); } });

/* ---------- pembuka ---------- */
function intro() {
  const el = $('#intro'); if (!el) return;
  if (sessionStorage.getItem('kas-intro')) { el.remove(); return; }
  let gone = false;
  const done = () => { if (gone) return; gone = true; sessionStorage.setItem('kas-intro', '1'); el.classList.add('out'); setTimeout(() => el.remove(), 800); };
  el.addEventListener('click', done);
  requestAnimationFrame(() => el.classList.add('go'));
  setTimeout(done, matchMedia('(prefers-reduced-motion: reduce)').matches ? 900 : 3800);
}

/* ---------- efek: riak tombol, konfeti, angka naik ---------- */
const RIP = '.btn,.chip,.ib,.tile,.row[data-act],.fab,.dot,.bn,.seg button,.banner,.stepper button';
document.addEventListener('pointerdown', e => {
  const el = e.target.closest(RIP); if (!el || el.disabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.classList.add('rp');
  try { el.animate([{ scale: '1' }, { scale: '.92', offset: .3 }, { scale: '1.03', offset: .65 }, { scale: '1' }], { duration: 420, easing: 'ease-out' });
    const g = el.querySelector('svg'); if (g) g.animate([{ rotate: '0deg', scale: 1 }, { rotate: '-14deg', scale: 1.28 }, { rotate: '0deg', scale: 1 }], { duration: 460, easing: 'cubic-bezier(.3,1.7,.4,1)' }); } catch {}
  const r = el.getBoundingClientRect(), k = Math.max(r.width, r.height) * 2.2, s = document.createElement('span');
  s.className = 'rip'; s.style.cssText = `width:${k}px;height:${k}px;left:${e.clientX - r.left - k / 2}px;top:${e.clientY - r.top - k / 2}px`;
  el.appendChild(s); setTimeout(() => s.remove(), 650);
}, { passive: true });
function confetti(x, y, n = 20) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cols = ['#16a06a', '#f5b021', '#ff6b6b', '#2fd0ff', '#8b7bff'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.className = 'cf';
    p.style.cssText = `left:${x}px;top:${y}px;background:${cols[i % cols.length]};width:${6 + Math.random() * 6}px;height:${8 + Math.random() * 8}px;border-radius:${i % 3 ? '2px' : '50%'}`;
    document.body.appendChild(p);
    const dx = (Math.random() - .5) * 320, dy = -120 - Math.random() * 220;
    p.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) rotate(${Math.random() * 540}deg)`, opacity: 1, offset: .45 }, { transform: `translate(${dx * 1.2}px,${dy + 420}px) rotate(${Math.random() * 900}deg)`, opacity: 0 }],
      { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => p.remove();
  }
}
let lastSaldo = null;
function countUp() {
  const el = $('.hero .big'); if (!el || !S.data) return;
  const to = totals(S.data).saldo; if (lastSaldo === to) return;
  const from = lastSaldo == null ? 0 : lastSaldo; lastSaldo = to;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const t0 = performance.now(), D = 900;
  const step = t => { const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3); el.textContent = rp(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ---------- mulai ---------- */
async function boot() {
  intro();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (S.pin) S.admin = false; // diverifikasi setelah data masuk
  const cache = ls.get(KEY);
  const hash = location.hash.replace(/^#\/?/, '') || 'beranda'; S.route = V[hash] ? hash : 'beranda';
  if (cache) S.data = cache;
  render(); // skeleton jika belum ada cache
  loadData(true);
}
boot();
/* ganti hari (mis. lewat tengah malam Senin) saat web masih terbuka -> hitung ulang tagihan otomatis */
let hariIni = new Date().toDateString();
setInterval(() => { const t = new Date().toDateString(); if (t !== hariIni) { hariIni = t; if (S.data) render(true); } }, 60000);
})();
