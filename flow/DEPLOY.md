# Deploy 3 landing page SYNAX ke synaxhq.site

## Kemas kini v2 (gantikan versi "clean" di /lp/)

Flow penuh dipulangkan: pain point bergambar, meter semakan, perbandingan, mineral, timeline, testimoni, tab rutin, KKM, jaminan dan P.S.
Bahagian **pakej, borang order (ERP/Billplz), Meta Pixel, head/OG, sticky bar dan pautan Dasar Privasi** diambil terus dari versi live `/lp/`, jadi integrasi order tidak berubah.

Gantikan fail-fail ini di `public/lp/`:
- `prasekolah.html`, `sekolah-rendah.html`, `spm.html`
- `assets/synax.css`, `assets/synax.js`, `assets/lp-clean.css` (JS & CSS sama seperti versi live, cuma line ending LF)
- `assets/img/prasekolah/`, `assets/img/sekolah-rendah/`, `assets/img/spm/` (semua gambar)
- `assets/img/3.webp`, `5.webp`, `7.webp`, `t1–t4.webp`, `mineral-*.webp`, `surat-kkm.webp`

Kekalkan `assets/img/og.jpg` yang sedia ada di server. Cache-buster dalam HTML ditukar kepada `?v=flow2`.

---


Repo: https://github.com/dinrvsb-dev/websitesynax (branch `claude/busy-dirac-vwj5ym`), folder `flow/`.

Halaman ni HTML/CSS/JS statik biasa. Tak perlu build, tak perlu React, dan tak ada dependency.

## Fail yang perlu di-deploy

```
flow/prasekolah.html
flow/sekolah-rendah.html
flow/spm.html
flow/assets/          (synax.css, synax.js, img/)
```

Jangan deploy fail-fail ni:
- `flow/index.html` (halaman preview dalaman sahaja)
- `flow/image-prompts/`
- `bahan website synax.zip`

## Cara paling mudah (projek Vite sedia ada)

1. Salin fail di atas ke `public/lp/` dalam projek synaxhq.site:
   ```
   public/lp/prasekolah.html
   public/lp/sekolah-rendah.html
   public/lp/spm.html
   public/lp/assets/...
   ```
2. Build & deploy macam biasa. URL akan jadi:
   - https://synaxhq.site/lp/prasekolah.html
   - https://synaxhq.site/lp/sekolah-rendah.html
   - https://synaxhq.site/lp/spm.html
3. Semua path dalam halaman adalah relatif (`assets/...`), jadi tak perlu ubah apa-apa.

## URL bersih (pilihan)

Untuk URL macam `synaxhq.site/prasekolah`, tambah rewrite. Letak rewrite ni **sebelum** SPA fallback (`/* → /index.html`), kalau tak halaman akan buka app React:

- Netlify (`public/_redirects`):
  ```
  /prasekolah      /lp/prasekolah.html      200
  /sekolah-rendah  /lp/sekolah-rendah.html  200
  /spm             /lp/spm.html             200
  ```
- Vercel (`vercel.json` → `rewrites`):
  ```json
  { "source": "/prasekolah", "destination": "/lp/prasekolah.html" }
  ```
  Buat entri yang sama untuk `/sekolah-rendah` dan `/spm`.
- Nginx / cPanel: alias ke fail `.html` yang sama.

Kalau guna rewrite, pastikan `<base>` atau path aset masih resolve ke `/lp/assets/`. Cara paling selamat: tukar `assets/` kepada `/lp/assets/` dalam 3 fail HTML tu.

## Perlu disemak sebelum live

1. **Meta Pixel:** halaman dah panggil `fbq('track', ...)` untuk `AddToCart`, `Purchase` dan `Contact`, tapi kod base pixel **belum** dimasukkan. Tampal snippet Meta Pixel SYNAX dalam `<head>` setiap halaman.
2. **Nombor WhatsApp:** dalam `assets/synax.js` → `CONFIG.whatsapp` (sekarang `601153087474`).
3. **Aliran tempahan:** borang hantar mesej ke WhatsApp sahaja. Ia tak guna API order / Billplz yang ada di synaxhq.site. Kalau nak tempahan masuk sistem yang sama, sambung `#orderForm` submit (dalam `synax.js`) ke API tempahan sedia ada.
4. **Harga:** harga & pakej disimpan dalam `CONFIG.packages` (`synax.js`) **dan** ditulis terus dalam HTML bahagian `#pakej`. Kalau harga berubah, kedua-dua tempat perlu dikemas kini.
5. **Uji di telefon:** semak semua 3 halaman pada skrin telefon dan buat satu tempahan ujian sampai mesej WhatsApp terbuka.
