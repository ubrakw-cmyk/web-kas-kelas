/**
 * KAS KELAS — Google Apps Script: pembuat spreadsheet + sinkron dua arah dengan Supabase.
 * Database utama = Supabase. Spreadsheet ini adalah tampilan yang ikut berubah:
 *   web/Supabase -> sheet : otomatis tiap 1 menit (hanya kalau ada perubahan)
 *   sheet -> Supabase     : langsung saat kamu mengedit sheet (centang, nama siswa, transaksi, pengumuman, pengaturan)
 * Tempel seluruh isi file ini di Extensions > Apps Script, isi 2 baris di bawah, lalu jalankan setup() SEKALI.
 */

// >>> Isi dari Supabase: Project Settings -> API
const SUPABASE_URL = '';          // contoh: https://abcdefgh.supabase.co
const SUPABASE_SECRET_KEY = '';   // kunci RAHASIA (secret / service_role). JANGAN dipakai di web, JANGAN dibagikan.

const NAMA = { SET: 'Pengaturan', SIS: 'Siswa', KAS: 'Kas', TX: 'Transaksi', ANN: 'Pengumuman', RANG: 'Rangkuman' };
const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const BLN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const KEYS = ['kelas','tahun','mulaiBulan','nominal','bendahara','wa','spreadsheetUrl','qris'];
const ROW0 = 12;   // baris pertama siswa di sheet "Kas"
const COL0 = 3;    // kolom pertama minggu (C)
const WEEKS = 48;

/* ================= SETUP (jalankan sekali) ================= */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SSID', ss.getId());
  if (SUPABASE_URL) props.setProperty('SB_URL', SUPABASE_URL.trim());
  if (SUPABASE_SECRET_KEY) props.setProperty('SB_KEY', SUPABASE_SECRET_KEY.trim());
  cfg_();   // berhenti dengan pesan jelas kalau URL/kunci belum diisi

  const get = n => ss.getSheetByName(n) || ss.insertSheet(n);
  const sSet = get(NAMA.SET), sSis = get(NAMA.SIS), sKas = get(NAMA.KAS), sTx = get(NAMA.TX), sAnn = get(NAMA.ANN), sRang = get(NAMA.RANG);

  // Pengaturan
  sSet.clear();
  const thn = new Date().getFullYear();
  const defSet = [['Kunci','Nilai'], ['kelas','Kelas'], ['tahun', thn], ['mulaiBulan', new Date().getMonth() + 1], ['nominal', 5000], ['bendahara','Kucay'], ['wa',''], ['spreadsheetUrl', ss.getUrl()], ['qris','']];
  sSet.getRange('B7').setNumberFormat('@');   // nomor WA tetap teks
  sSet.getRange(1, 1, defSet.length, 2).setValues(defSet);
  sSet.getRange('A1:B1').setFontWeight('bold').setBackground('#0b7a4f').setFontColor('#fff');
  sSet.setColumnWidth(1, 140); sSet.setColumnWidth(2, 360);

  // Siswa: kosong. Admin menambah lewat web (Menu Admin) atau langsung ketik di sheet ini.
  sSis.clear();
  sSis.getRange(1, 1, 1, 4).setValues([['ID','No','Nama','HP (WhatsApp)']]).setFontWeight('bold').setBackground('#0b7a4f').setFontColor('#fff');
  sSis.getRange(2, 4, 100, 1).setNumberFormat('@');
  sSis.setColumnWidth(3, 220); sSis.setColumnWidth(4, 160);

  // Transaksi
  sTx.clear();
  sTx.getRange(1, 1, 1, 7).setValues([['ID','Tanggal','Tipe','Keterangan','Jumlah','SiswaID','Kunci']]).setFontWeight('bold').setBackground('#0b7a4f').setFontColor('#fff');
  sTx.getRange('B2:B').setNumberFormat('dd/mm/yyyy'); sTx.getRange('E2:E').setNumberFormat('"Rp"#,##0');
  sTx.setColumnWidth(4, 300); sTx.setFrozenRows(1);

  // Pengumuman
  sAnn.clear();
  sAnn.getRange(1, 1, 1, 5).setValues([['ID','Tanggal','Judul','Isi','Sematkan']]).setFontWeight('bold').setBackground('#0b7a4f').setFontColor('#fff');
  sAnn.setColumnWidth(3, 220); sAnn.setColumnWidth(4, 420);

  buildKas_(sKas, 0);
  buildRangkuman_(sRang);
  ss.setActiveSheet(sKas);
  // hapus sheet bawaan kosong (Sheet1 / Lembar1)
  ['Sheet1', 'Lembar1', 'Sheet 1'].forEach(n => { const d = ss.getSheetByName(n); if (d && ss.getSheets().length > 1 && d.getLastRow() === 0) ss.deleteSheet(d); });

  // trigger: sheet -> Supabase (edit & hapus baris), Supabase -> sheet (tiap 1 menit)
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onEditSync').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('onChangeSync').forSpreadsheet(ss).onChange().create();
  ScriptApp.newTrigger('pullTick').timeBased().everyMinutes(1).create();

  // beri tahu web alamat spreadsheet ini, lalu isi semua sheet dari database
  rpc_('kas_sync_apply', { p_table: 'settings', p_rows: [{ k: 'spreadsheetUrl', v: ss.getUrl() }], p_auth: false });
  pull_(true);
  Logger.log('Setup selesai. Sheet sudah terisi dari Supabase dan tersinkron otomatis.');
}

function buildKas_(sh, n) {
  sh.clear(); sh.clearConditionalFormatRules();
  const G = '#0b6e3e', G2 = '#168a52', GL = '#d6f0df', last = COL0 + WEEKS - 1, WHITE = '#ffffff';
  // sheet baru cuma punya 26 kolom; tambah sampai cukup untuk 12 bulan x 4 minggu
  if (sh.getMaxColumns() < last) sh.insertColumnsAfter(sh.getMaxColumns(), last - sh.getMaxColumns());
  if (sh.getMaxRows() < 120) sh.insertRowsAfter(sh.getMaxRows(), 120 - sh.getMaxRows());
  sh.setHiddenGridlines(true);
  sh.getRange(1, 1, 120, last).setFontFamily('Lexend').setFontSize(10).setVerticalAlignment('middle');
  sh.setColumnWidth(1, 40); sh.setColumnWidth(2, 190);
  for (let c = COL0; c <= last; c++) sh.setColumnWidth(c, 24);
  [1, 3, 7, 8, 9].forEach(r => sh.setRowHeight(r, r === 1 || r === 3 ? 8 : 4));
  sh.setRowHeight(2, 34); [4, 5, 6].forEach(r => sh.setRowHeight(r, 24));
  sh.setRowHeight(10, 26); sh.setRowHeight(11, 20);

  // judul + jam (tanpa merge melewati kolom beku)
  sh.getRange(2, 2, 1, 7).setBackground(G);
  sh.getRange(2, 2).setValue('DATA PEMBAYARAN UANG KAS').setFontColor(WHITE).setFontWeight('bold').setFontSize(14).setWrapStrategy(SpreadsheetApp.WrapStrategy.OVERFLOW);
  sh.getRange(2, 9, 1, 3).merge().setFormula('=NOW()').setNumberFormat('h:mm AM/PM').setBackground('#3aa76d').setFontColor(WHITE).setFontWeight('bold').setFontSize(14).setHorizontalAlignment('center');

  // info kiri (baris 4-6)
  const kiri = [['Tahun', '=Pengaturan!B3', '0'], ['Kelas', '=Pengaturan!B2', '@'], ['Kas per minggu', '=Pengaturan!B5', '"Rp"#,##0']];
  kiri.forEach((r, i) => {
    const row = 4 + i;
    sh.getRange(row, 2).setValue(r[0]).setBackground(G).setFontColor(WHITE).setFontWeight('bold').setFontSize(9);
    sh.getRange(row, 3, 1, 6).merge().setFormula(r[1]).setBackground(GL).setHorizontalAlignment('left').setFontWeight('bold').setFontSize(9);
    if (r[2] !== '@') sh.getRange(row, 3).setNumberFormat(r[2]);
  });
  // info kanan (baris 4-6)
  const kanan = [
    ['Total kas saat ini', '=SUMIF(Transaksi!C2:C2000,"Masuk",Transaksi!E2:E2000)-SUMIF(Transaksi!C2:C2000,"Keluar",Transaksi!E2:E2000)', '"Rp"#,##0'],
    ['Jumlah siswa', '=COUNTA(Siswa!C2:C2000)', '0'],
    ['Nama bendahara', '=Pengaturan!B6', '@']
  ];
  kanan.forEach((r, i) => {
    const row = 4 + i;
    sh.getRange(row, 10, 1, 5).merge().setValue(r[0]).setBackground(G).setFontColor(WHITE).setFontWeight('bold').setFontSize(9);
    sh.getRange(row, 15, 1, 5).merge().setFormula(r[1]).setBackground(GL).setHorizontalAlignment('left').setFontWeight('bold').setFontSize(9);
    if (r[2] !== '@') sh.getRange(row, 15).setNumberFormat(r[2]);
  });
  // maskot + kutipan
  sh.getRange(4, 22, 3, 3).merge().setValue('📚').setFontSize(30).setHorizontalAlignment('center');
  sh.getRange(4, 25, 3, 16).merge().setValue('"Ini uang kas, bukan kenangan. Jangan pura-pura lupa."').setFontStyle('italic').setFontColor('#3f6b52').setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP).setBackground('#f3fbf6');

  // header tabel
  const h = sh.getRange(10, 1, 2, 2);
  h.setBackground(G).setFontColor(WHITE).setFontWeight('bold').setHorizontalAlignment('center');
  sh.getRange(10, 1).setValue('No'); sh.getRange(10, 2).setValue('Nama');
  sh.getRange(10, 1, 2, 1).merge(); sh.getRange(10, 2, 2, 1).merge();
  for (let m = 0; m < 12; m++) {
    const c = COL0 + m * 4;
    sh.getRange(10, c, 1, 4).merge().setValue(BULAN[m]).setBackground(m % 2 ? G2 : G).setFontColor(WHITE).setFontWeight('bold').setHorizontalAlignment('center');
    for (let w = 0; w < 4; w++) sh.getRange(11, c + w).setValue('M' + (w + 1)).setBackground(GL).setFontWeight('bold').setFontSize(7).setHorizontalAlignment('center');
  }
  setKasRows_(sh, Math.max(n, 40));
  // centang = hijau, baris selang-seling di kolom nama
  const cek = sh.getRange(ROW0, COL0, 108, WEEKS), nm = sh.getRange(ROW0, 1, 108, 2);
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=C12=TRUE').setBackground('#b7e4c7').setRanges([cek]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=ISEVEN(ROW())').setBackground('#f1f8f4').setRanges([nm]).build()
  ]);
  sh.setFrozenRows(11); sh.setFrozenColumns(2);
}

function setKasRows_(sh, n) {
  if (n < 1) return;
  const need = ROW0 + n - 1;
  if (sh.getMaxRows() < need + 5) sh.insertRowsAfter(sh.getMaxRows(), need + 5 - sh.getMaxRows());
  const cur = sh.getRange(ROW0, 2).getFormula() ? sh.getLastRow() - ROW0 + 1 : 0;
  for (let k = Math.max(0, cur); k < n; k++) {
    const r = ROW0 + k;
    sh.getRange(r, 1).setFormula('=IF(Siswa!C' + (k + 2) + '="","",Siswa!B' + (k + 2) + ')');
    sh.getRange(r, 2).setFormula('=IF(Siswa!C' + (k + 2) + '="","",Siswa!C' + (k + 2) + ')');
  }
  const BORD = '#6f9f84', ST = SpreadsheetApp.BorderStyle.SOLID;
  const rng = sh.getRange(ROW0, COL0, n, WEEKS);
  rng.insertCheckboxes();
  rng.setBorder(true, true, true, true, true, true, BORD, ST).setHorizontalAlignment('center').setFontSize(8);
  const left = sh.getRange(ROW0, 1, n, 2);
  left.setBorder(true, true, true, true, true, true, BORD, ST).setBackground(null);
  sh.getRange(ROW0, 1, n, 1).setHorizontalAlignment('center').setFontWeight('bold');
  sh.getRange(ROW0, 2, n, 1).setHorizontalAlignment('left');
  sh.setRowHeights(ROW0, n, 22);
}

function buildRangkuman_(sh) {
  sh.clear(); sh.setHiddenGridlines(true);
  sh.setColumnWidth(1, 220); sh.setColumnWidth(2, 140); sh.setColumnWidth(3, 140); sh.setColumnWidth(4, 140);
  sh.getRange('A1:D1').merge().setValue('RANGKUMAN KAS KELAS').setBackground('#0b7a4f').setFontColor('#fff').setFontWeight('bold').setFontSize(14).setHorizontalAlignment('center');
  const rows = [
    ['Total masuk', '=SUMIF(Transaksi!C2:C2000,"Masuk",Transaksi!E2:E2000)'],
    ['Total keluar', '=SUMIF(Transaksi!C2:C2000,"Keluar",Transaksi!E2:E2000)'],
    ['Saldo kas', '=B3-B4'],
    ['Jumlah siswa', '=COUNTA(Siswa!C2:C2000)'],
    ['Jumlah transaksi', '=COUNTA(Transaksi!A2:A2000)']
  ];
  // letakkan: B3 masuk, B4 keluar, B5 saldo
  sh.getRange('A3:B7').setValues([[rows[0][0], ''], [rows[1][0], ''], [rows[2][0], ''], [rows[3][0], ''], [rows[4][0], '']]);
  sh.getRange('B3').setFormula(rows[0][1]); sh.getRange('B4').setFormula(rows[1][1]); sh.getRange('B5').setFormula(rows[2][1]);
  sh.getRange('B6').setFormula(rows[3][1]); sh.getRange('B7').setFormula(rows[4][1]);
  sh.getRange('B3:B5').setNumberFormat('"Rp"#,##0');
  sh.getRange('A3:A7').setFontWeight('bold').setBackground('#e3f6ec'); sh.getRange('B3:B7').setFontWeight('bold');
  sh.getRange('B5').setBackground('#0b7a4f').setFontColor('#fff'); sh.getRange('A5').setBackground('#0b7a4f').setFontColor('#fff');
  sh.getRange('A9:D9').setValues([['Bulan', 'Masuk', 'Keluar', 'Selisih']]).setBackground('#0b7a4f').setFontColor('#fff').setFontWeight('bold');
  for (let m = 0; m < 12; m++) {
    const r = 10 + m;
    const rngTgl = 'Transaksi!B2:B2000,">="&DATE(Pengaturan!$B$3,' + (m + 1) + ',1),Transaksi!B2:B2000,"<"&DATE(Pengaturan!$B$3,' + (m + 2) + ',1)';
    sh.getRange(r, 1).setValue(BULAN[m]);
    sh.getRange(r, 2).setFormula('=SUMIFS(Transaksi!E2:E2000,Transaksi!C2:C2000,"Masuk",' + rngTgl + ')');
    sh.getRange(r, 3).setFormula('=SUMIFS(Transaksi!E2:E2000,Transaksi!C2:C2000,"Keluar",' + rngTgl + ')');
    sh.getRange(r, 4).setFormula('=B' + r + '-C' + r);
  }
  sh.getRange('B10:D21').setNumberFormat('"Rp"#,##0');
  sh.getRange('A9:D21').setBorder(true, true, true, true, true, true, '#cfe5d8', SpreadsheetApp.BorderStyle.SOLID);
  const chart = sh.newChart().setChartType(Charts.ChartType.COLUMN).addRange(sh.getRange('A9:C21')).setPosition(3, 6, 0, 0).setOption('title', 'Kas masuk & keluar per bulan').setOption('colors', ['#16a06a', '#e5484d']).build();
  sh.insertChart(chart);
}

/* ================= SINKRON DENGAN SUPABASE ================= */
function cfg_() {
  const p = PropertiesService.getScriptProperties(), url = p.getProperty('SB_URL'), key = p.getProperty('SB_KEY');
  if (!url || !key) throw new Error('Isi SUPABASE_URL dan SUPABASE_SECRET_KEY di bagian atas Code.gs, simpan, lalu jalankan setup lagi.');
  return { url: url.replace(/\/+$/, ''), key: key };
}
function rpc_(fn, args) {
  const c = cfg_(), headers = { apikey: c.key };
  if (c.key.indexOf('eyJ') === 0) headers.Authorization = 'Bearer ' + c.key;   // kunci service_role model lama = JWT
  const res = UrlFetchApp.fetch(c.url + '/rest/v1/rpc/' + fn, { method: 'post', contentType: 'application/json', headers: headers, payload: JSON.stringify(args || {}), muteHttpExceptions: true });
  const code = res.getResponseCode(), txt = res.getContentText();
  if (code >= 300) throw new Error('Supabase ' + code + ': ' + txt.slice(0, 300));
  return txt ? JSON.parse(txt) : null;
}
function ss_() { return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SSID')); }
function tz_() { return ss_().getSpreadsheetTimeZone(); }
function dateOut_(s) { const p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); }
function dateIn_(v) { return v instanceof Date ? Utilities.formatDate(v, tz_(), 'yyyy-MM-dd') : ''; }
function clearRows_(sh, col, ncol) { const n = sh.getMaxRows() - 1; if (n > 0) sh.getRange(2, col, n, ncol).clearContent(); }
function fmtRows_(sh, col, fmt, n) { if (n > 0) sh.getRange(2, col, n, 1).setNumberFormat(fmt); }

/* ---- Supabase -> sheet ---- */
function writeSheets_(d, skipKas) {
  const ss = ss_(), st = d.settings;
  // Pengaturan
  const sSet = ss.getSheetByName(NAMA.SET);
  sSet.getRange(2, 1, KEYS.length, 2).setNumberFormat('@').setValues(KEYS.map(k => [k, st[k] == null ? '' : String(st[k])]));
  sSet.getRange('B3:B5').setNumberFormat('0').setValues([[Number(st.tahun)], [Number(st.mulaiBulan)], [Number(st.nominal)]]);
  // Siswa
  const sSis = ss.getSheetByName(NAMA.SIS), stu = d.students;
  clearRows_(sSis, 1, 4);
  sSis.getRange(2, 4, Math.max(stu.length, 100), 1).setNumberFormat('@');
  if (stu.length) sSis.getRange(2, 1, stu.length, 4).setValues(stu.map(s => [s.id, s.no, s.nama, String(s.hp || '')]));
  // Transaksi
  const sTx = ss.getSheetByName(NAMA.TX), tx = d.tx;
  clearRows_(sTx, 1, 7);
  if (tx.length) {
    sTx.getRange(2, 1, tx.length, 7).setValues(tx.map(t => [t.id, dateOut_(t.tgl), t.tipe, t.ket, Number(t.jumlah), t.siswaId || '', t.key || '']));
    fmtRows_(sTx, 2, 'dd/mm/yyyy', tx.length); fmtRows_(sTx, 5, '"Rp"#,##0', tx.length);
  }
  // Pengumuman
  const sAnn = ss.getSheetByName(NAMA.ANN), ann = d.ann;
  clearRows_(sAnn, 1, 5);
  if (ann.length) {
    sAnn.getRange(2, 1, ann.length, 5).setValues(ann.map(a => [a.id, dateOut_(a.tgl), a.judul, a.isi, a.pin === true]));
    fmtRows_(sAnn, 2, 'dd/mm/yyyy', ann.length);
    sAnn.getRange(2, 5, ann.length, 1).insertCheckboxes();
  }
  // Kas: nama (rumus), centang. skipKas = jangan timpa centang (dipakai tepat setelah kamu mencentang, supaya klik cepat tidak hilang)
  const kas = ss.getSheetByName(NAMA.KAS), N = Math.max(40, stu.length);
  if (skipKas) return;
  if (stu.length > 40) setKasRows_(kas, stu.length);
  kas.getRange(ROW0, 1, N, 2).setFormulas(Array.from({ length: N }, (_, k) => [
    '=IF(Siswa!C' + (k + 2) + '="","",Siswa!B' + (k + 2) + ')', '=IF(Siswa!C' + (k + 2) + '="","",Siswa!C' + (k + 2) + ')']));
  const grid = Array.from({ length: N }, (_, k) => {
    const row = new Array(WEEKS).fill(false), s = stu[k];
    if (s) (d.paid[String(s.id)] || []).forEach(i => { if (i >= 0 && i < WEEKS) row[i] = true; });
    return row;
  });
  kas.getRange(ROW0, COL0, N, WEEKS).setValues(grid);
}

/* Ambil dari Supabase kalau ada perubahan (force = paksa) */
function pull_(force) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return false;
  try { return pullLocked_(force); } finally { lock.releaseLock(); }
}
function pullLocked_(force, skipKas) {
  const props = PropertiesService.getScriptProperties();
  if (!force && String(rpc_('kas_sync_version')) === props.getProperty('VER')) return false;
  const g = rpc_('kas_sync_get');
  writeSheets_(g.data, skipKas);
  props.setProperty('VER', String(g.version));
  SpreadsheetApp.flush();
  return true;
}
function pullTick() { try { pull_(false); } catch (err) { console.error(err); } }
function sinkronSekarang() { pull_(true); SpreadsheetApp.getActiveSpreadsheet().toast('Sheet sudah sama dengan database.', 'Kas Kelas', 4); }
function onOpen() { SpreadsheetApp.getUi().createMenu('Kas Kelas').addItem('Sinkron sekarang (ambil dari database)', 'sinkronSekarang').addToUi(); }

/* ---- sheet -> Supabase ---- */
function isFresh_() { return String(rpc_('kas_sync_version')) === PropertiesService.getScriptProperties().getProperty('VER'); }

function readTable_(name, r1, r2) {
  const sh = ss_().getSheetByName(name), last = sh.getLastRow();
  if (last < 2) return [];
  const from = Math.max(2, r1 || 2), to = Math.min(last, r2 || last);
  if (to < from) return [];
  const rows = [];
  if (name === NAMA.SET) {
    sh.getRange(2, 1, KEYS.length, 2).getValues().forEach(v => rows.push({ k: v[0], v: String(v[1] == null ? '' : v[1]) }));
  } else if (name === NAMA.SIS) {
    sh.getRange(from, 1, to - from + 1, 4).getValues().forEach(v => rows.push({ id: v[0] === '' ? null : v[0], nama: String(v[2] || '').trim(), hp: String(v[3] || '') }));
  } else if (name === NAMA.TX) {
    sh.getRange(from, 1, to - from + 1, 7).getValues().forEach(v => {
      if (v.every(c => c === '')) return;
      rows.push({ id: v[0] === '' ? null : v[0], tgl: dateIn_(v[1]), tipe: String(v[2] || ''), ket: String(v[3] || ''), jumlah: v[4] === '' ? '' : String(Math.round(Number(v[4]) || 0)) });
    });
  } else if (name === NAMA.ANN) {
    sh.getRange(from, 1, to - from + 1, 5).getValues().forEach(v => {
      if (v.every(c => c === '' || c === false)) return;
      rows.push({ id: v[0] === '' ? null : v[0], tgl: dateIn_(v[1]), judul: String(v[2] || '').trim(), isi: String(v[3] || ''), pin: v[4] === true });
    });
  }
  return rows;
}
const TABEL_ = {}; TABEL_[NAMA.SIS] = 'students'; TABEL_[NAMA.TX] = 'tx'; TABEL_[NAMA.ANN] = 'ann'; TABEL_[NAMA.SET] = 'settings';

function pushTable_(name, fresh, r1, r2) {
  // fresh = sheet sudah sama dengan database sebelum diedit => baris yang hilang dianggap dihapus
  const rows = readTable_(name, fresh ? 2 : r1, fresh ? null : r2);
  rpc_('kas_sync_apply', { p_table: TABEL_[name], p_rows: rows, p_auth: !!fresh && name !== NAMA.SET });
}

function pushKas_(sh, r, e) {
  const sis = ss_().getSheetByName(NAMA.SIS), n = Math.max(0, sis.getLastRow() - 1);
  const ids = n ? sis.getRange(2, 1, n, 1).getValues().map(v => v[0]) : [];
  const vals = (r.getNumRows() === 1 && r.getNumColumns() === 1 && e && e.value !== undefined) ? [[e.value === 'TRUE']] : r.getValues(), cells = [];
  for (let i = 0; i < vals.length; i++) for (let j = 0; j < vals[i].length; j++) {
    const row = r.getRow() + i, idx = r.getColumn() + j - COL0, k = row - ROW0, v = vals[i][j];
    if (row < ROW0 || idx < 0 || idx >= WEEKS || !(v === true || v === false)) continue;
    if (!ids[k]) continue;
    cells.push({ studentId: ids[k], idx: idx, paid: v });
  }
  if (cells.length) rpc_('kas_sync_paid', { p_cells: cells });
}

function onEditSync(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return;
  try {
    const r = e.range, sh = r.getSheet(), name = sh.getName();
    if (name === NAMA.KAS) { if (r.getRow() < ROW0 || r.getColumn() < COL0) return; pushKas_(sh, r, e); }
    else if (TABEL_[name]) { if (r.getRow() < 2) return; pushTable_(name, isFresh_(), r.getRow(), r.getLastRow()); }
    else return;
    pullLocked_(true, name === NAMA.KAS);   // ambil ID baru + transaksi otomatis + total
  } catch (err) { console.error(err); }
  finally { lock.releaseLock(); }
}

function onChangeSync(e) {
  if (e.changeType !== 'REMOVE_ROW') return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return;
  try {
    if (isFresh_()) [NAMA.SIS, NAMA.TX, NAMA.ANN].forEach(n => pushTable_(n, true));
    pullLocked_(true);   // kalau sheet ketinggalan, dikembalikan sama dengan database
  } catch (err) { console.error(err); }
  finally { lock.releaseLock(); }
}
