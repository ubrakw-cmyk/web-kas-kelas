# Panduan Memasang Web Kas Kelas (Supabase + Spreadsheet) — step by step

## Gambaran singkat
```
Web (Vercel)  ⇄  Supabase (DATABASE UTAMA)  ⇄  Apps Script  ⇄  Google Spreadsheet
```
- **Supabase** menyimpan semua data (siswa, centang bayar, transaksi, pengumuman, pengaturan). Perubahan dari web langsung tersimpan di sini.
- **Spreadsheet** ikut sama dengan database: dari web ke sheet otomatis tiap 1 menit (kalau ada perubahan), dari sheet ke database langsung saat kamu mengedit sheet.
- Hanya **admin ber-PIN (Kucay)** yang bisa mengubah data. Pengunjung biasa hanya bisa melihat.

Isi folder:
```
kas-kelas/
├─ index.html  style.css  app.js   web
├─ config.js                       <-- tempat menempel URL & kunci Supabase (langkah 4)
├─ sw.js  manifest.json            supaya cepat + bisa jadi aplikasi/APK
├─ img/                            ikon buku, latar menu, latar pembuka (WAJIB ikut di-upload)
├─ supabase/schema.sql             <-- dijalankan di Supabase (langkah 2)
└─ Code.gs                         <-- dipasang di Google Spreadsheet (langkah 5)
```

---

## Langkah 1 — Buat project Supabase
1. Buka <https://supabase.com> → **Start your project** → masuk (bisa pakai GitHub/Google).
2. **New project** → isi nama (misal `kas-kelas`), buat **Database Password** (simpan, tapi tidak dipakai lagi nanti), **Region: Southeast Asia (Singapore)** → **Create new project**.
3. Tunggu 1–2 menit sampai project siap.

## Langkah 2 — Pasang database
1. Menu kiri **SQL Editor** → **New query**.
2. Buka file `supabase/schema.sql`, **ganti PIN admin**: cari baris
   `select 1, s, encode(sha256(convert_to(s || 'PIN_ADMIN_AWAL', 'UTF8')), 'hex')`
   dan ganti tulisan `PIN_ADMIN_AWAL` (yang di dalam tanda kutip) dengan PIN yang kamu mau, misalnya `'482913'`. Ini PIN Kucay.
3. Salin **seluruh isi** file → tempel di SQL Editor → klik **Run**.
4. Harus muncul **Success. No rows returned**. Sekarang database + fungsinya sudah ada.
   (Aman dijalankan ulang, data tidak terhapus.)

## Langkah 3 — Ambil URL dan kunci
Menu kiri **Project Settings (ikon ⚙) → API Keys** (atau **API**):
- **Project URL** → contoh `https://abcdefgh.supabase.co`
- **Publishable key** (atau **anon public**) → ini untuk **web** (aman dilihat orang).
- **Secret key** (atau **service_role**) → ini untuk **Apps Script**. **RAHASIA**: jangan ditempel di `config.js`, jangan dikirim ke siapa pun.

## Langkah 4 — Hubungkan web
Buka `config.js`, isi:
```js
window.KAS_CONFIG = {
  SUPABASE_URL: "https://abcdefgh.supabase.co",
  SUPABASE_KEY: "sb_publishable_xxxxxxxxxxxx"      // publishable / anon, BUKAN secret
};
```
Upload semua isi folder ke Vercel (atau GitHub Pages / Netlify), **termasuk folder `img`**.
Buka webnya → **Menu → Masuk Admin** → PIN dari langkah 2. Kalau berhasil masuk, web sudah tersambung ke database.
> Setelah upload ulang, tekan **Ctrl+Shift+R** dua kali di web supaya file lama di browser terganti.

## Langkah 5 — Hubungkan spreadsheet
1. <https://sheets.google.com> → **Kosong** → beri nama, misal "Kas Kelas".
2. **Ekstensi → Apps Script**. Hapus isi bawaan, tempel **seluruh isi `Code.gs`**.
3. Di bagian paling atas isi dua baris:
   ```js
   const SUPABASE_URL = 'https://abcdefgh.supabase.co';
   const SUPABASE_SECRET_KEY = 'sb_secret_xxxxxxxxxxxx';   // secret / service_role
   ```
4. Klik 💾 **Simpan** → pilih fungsi **`setup`** → **▶ Jalankan**.
5. Izinkan akses: **Tinjau izin → pilih akun → Lanjutan → Buka proyek (tidak aman) → Izinkan** (aman, skripnya milikmu sendiri).
6. Kembali ke spreadsheet: akan muncul sheet **Pengaturan, Siswa, Kas, Transaksi, Pengumuman, Rangkuman**, terisi dari database.
7. (Opsional, lebih aman) Setelah `setup` berhasil, kosongkan lagi dua baris di langkah 5.3 lalu simpan. Kunci sudah tersimpan di properti skrip.

`setup` juga memasang pemicu otomatis (sheet→database saat edit, database→sheet tiap 1 menit). Tidak perlu "Deploy" / Web App lagi.

## Langkah 6 — Tes sinkron
1. Di web (login admin): **Siswa → Tambah siswa** → isi satu nama. Tunggu ≤ 1 menit → nama muncul di sheet **Siswa** dan **Kas**.
2. Di sheet **Kas**: centang satu kotak minggu. Dalam beberapa detik, di web siswa itu tercatat lunas dan **Transaksi** bertambah otomatis.
3. Menu **Kas Kelas → Sinkron sekarang** di spreadsheet = tarik perubahan terbaru tanpa menunggu 1 menit.

## Langkah 7 — Isi data awal (sebagai admin di web)
1. **Menu → Pengaturan**: nama kelas, kas per minggu (5000), bulan mulai kas, **WhatsApp Kucay** (`628123…`).
2. **Siswa → Tambah siswa** untuk ke-32 anak (atau ketik nama di sheet **Siswa**, kolom C, baris baru tanpa ID).
3. **Bayar Kas → Unggah QR**: foto QRIS Kucay.
4. **Pengumuman → Buat pengumuman**.

---

## Aturan mengedit di spreadsheet
- **Jangan ubah kolom ID** (kolom A) dan kolom **Kunci** di sheet Transaksi.
- **Hapus siswa/transaksi/pengumuman** = klik kanan nomor baris → **Hapus baris**. (Mengosongkan satu sel saja tidak menghapus.)
- **Menambah baris baru**: ketik di baris kosong paling bawah, kolom ID dibiarkan kosong. Transaksi baru wajib isi Tanggal, Tipe (`Masuk`/`Keluar`), Jumlah.
- Mencentang kotak di sheet **Kas** otomatis membuat transaksi "Kas M1 Jan — Nama"; menghapus centang menghapus transaksinya.
- Setelah kamu mengedit, sheet menyegarkan dirinya beberapa detik kemudian (ID baru dan total terisi) — itu normal.
- Kalau web dan sheet diedit di waktu yang hampir bersamaan, yang terakhir tersimpan yang menang. Cukup satu orang (Kucay) yang mengedit supaya tidak bentrok.

## Cara pakai sehari-hari
- **Siswa bayar** → scan QRIS → kirim bukti ke Kucay lewat tombol WhatsApp di halaman *Bayar Kas*.
- **Kucay**: *Siswa* → ketuk nama → ketuk kotak minggu yang dibayar (atau *Tandai lunas minggu ini*). Saldo, riwayat, dan spreadsheet ikut terisi.
- Tombol **+** (hanya admin) = catat pengeluaran/pemasukan lain.
- *Ingatkan via WA* di detail siswa; di *Rangkuman* ada **Salin pesan pengingat grup**.

## Notifikasi di HP
**Menu → Aku siapa?** (pilih nama) → **Pengingat** → izinkan notifikasi. Setiap web dibuka dan kas belum lunas, muncul notifikasi + banner peringatan.
> Notifikasi yang masuk sendiri saat web **tertutup** butuh server push khusus; sebagai gantinya ada tombol *Ingatkan via WA* untuk admin.

## Jadi APK
**Cara cepat:** buka web di Chrome Android → ⋮ → **Instal aplikasi**.
**Mau file .apk:** buka <https://www.pwabuilder.com> → tempel link web (harus `https`) → **Start → Package for stores → Android → Generate** → unduh zip → ambil `.apk`.

## Keamanan singkat
- Tabel database **terkunci**: lewat web hanya 3 fungsi yang bisa dipanggil (lihat data, login, aksi admin). Aksi admin selalu butuh PIN.
- PIN disimpan sebagai hash. Salah PIN 8 kali = terkunci 5 menit.
- **Secret key** hanya ada di Apps Script milikmu. Kalau bocor: Supabase → Settings → API Keys → buat ulang, lalu perbarui di Apps Script.
- Siapa pun yang punya akses **edit** ke spreadsheet bisa mengubah data lewat sheet, jadi bagikan spreadsheet hanya sebagai **Lihat** (View) kecuali ke Kucay.

## Kalau ada masalah
| Gejala | Solusi |
|---|---|
| Web: "Tidak bisa terhubung" | `SUPABASE_URL` / `SUPABASE_KEY` di `config.js` salah atau belum ter-upload; Ctrl+Shift+R |
| Web: "Server: Could not find the function public.kas_get" | `schema.sql` belum dijalankan penuh (langkah 2). Jalankan ulang. |
| Web: "Server: permission denied…" / 401 / 403 | Yang ditempel di `config.js` kunci yang salah. Pakai **publishable/anon**, bukan secret |
| Ikon/latar tidak muncul | Folder `img` belum ikut di-upload |
| Web: "PIN salah" terus | Salah 8x = terkunci 5 menit. Lupa PIN → lihat di bawah |
| Apps Script: `Isi SUPABASE_URL dan SUPABASE_SECRET_KEY…` | Isi 2 baris di atas `Code.gs`, simpan, jalankan `setup` lagi |
| Apps Script: `Supabase 401/403…` | Kunci yang dipakai harus **secret / service_role** |
| Apps Script: `Supabase 404 … function` | `schema.sql` belum dijalankan / belum versi terbaru |
| Sheet tidak ikut berubah | Menu **Kas Kelas → Sinkron sekarang**. Kalau menu tidak ada, muat ulang spreadsheet. Cek **Apps Script → Pemicu** ada 3 pemicu |
| Supabase gratis "Paused" (tidak aktif 1 minggu) | Buka dashboard Supabase → **Restore project**. Pemicu 1 menit dari spreadsheet membantu menjaga tetap aktif |

**Lupa PIN:** Supabase → SQL Editor, jalankan (ganti `PIN_BARU`):
```sql
update kas_secret set salt = 'x', hash = encode(sha256(convert_to('x' || 'PIN_BARU', 'UTF8')), 'hex'), fails = 0, locked_until = null where id = 1;
```

**Reset total (hapus semua data):**
```sql
truncate kas_payments, kas_tx, kas_ann, kas_students restart identity cascade;
```
Lalu di spreadsheet jalankan `setup` lagi.
