# MarginKu — Kalkulator HPP & Harga Jual Marketplace (PWA)

**MarginKu** adalah aplikasi web progresif (PWA) *mobile-first* tanpa backend dan tanpa API eksternal yang dirancang untuk membantu UMKM, reseller, dropshipper, dan pelaku bisnis kuliner rumahan di Indonesia menghitung **Harga Pokok Penjualan (HPP)**, mensimulasikan potongan biaya marketplace (**Shopee, TikTok Shop / Tokopedia, GoFood / GrabFood, Offline / WA**), serta menentukan harga jual ideal agar tidak rugi (*anti-boncos*).

---

## Fitur Utama

### 1. Kalkulator Utama (Tab Hitung)
- **Mode Cek Profit (Forward Calculation):** Masukkan harga jual yang sudah Anda tentukan untuk langsung melihat total potongan marketplace, uang cair ke saldo, profit bersih, margin (%), dan ROI (%).
- **Mode Cari Harga Jual (Reverse Calculation):** Masukkan target untung bersih dalam **Rupiah (Rp)** atau **Margin (%)** untuk mendapatkan rekomendasi harga jual otomatis.
- **Pembulatan Harga Psikologis (Smart Rounding):** Pilihan pembulatan otomatis `Tanpa`, `Rp500`, `Rp1.000`, atau `Akhiran 900` (misal Rp24.900 / Rp49.900), dengan perhitungan ulang profit aktual setelah pembulatan.
- **Indikator Kesehatan Margin & Visual Breakdown Bar:** Grafik batang proporsi *Modal (HPP)* vs *Potongan Marketplace* vs *Profit Bersih*, dilengkapi status **Boncos**, **Tipis**, **Sehat**, dan **Tebal**.
- **Bandingkan Semua Platform:** Simulasi perbandingan harga jual, potongan, dan profit bersih di seluruh platform marketplace sekaligus dalam satu tampilan.
- **Simulasi Target Bulanan & BEP:** Menghitung jumlah unit minimal balik modal (*Break Even Point*) dan target penjualan harian/bulanan berdasarkan biaya tetap bulanan dan target penghasilan.

### 2. Kalkulator Bahan & Resep (Tab Bahan)
- Menghitung HPP per porsi/unit untuk produk kuliner atau handmade berdasarkan harga beli kemasan, isi kemasan (`gr` / `ml` / `pcs`), takaran pakai, serta biaya tambahan per batch (gas, listrik, tenaga).
- Tombol **Pakai di Kalkulator** untuk langsung mengisi modal produk di tab Hitung tanpa input ulang.

### 3. Katalog Produk Tersimpan (Tab Produk)
- Menyimpan seluruh hasil simulasi produk lengkap dengan kategori dan tanggal pembaruan.
- Pencarian produk, filter berdasarkan **Platform** dan **Status Margin** (Boncos / Tipis / Sehat & Tebal).
- Aksi cepat per produk: Buka/Edit di Kalkulator, Bandingkan Platform, Duplikat, dan Hapus.
- **Export ke Excel (CSV):** Mengunduh seluruh katalog produk dalam format `.csv` dengan UTF-8 BOM sehingga terbuka rapi di Microsoft Excel.

### 4. Pengaturan, Backup & PWA (Tab Atur)
- **Preset Marketplace Editable:** Ubah persentase default (Admin, Layanan/Gratis Ongkir XTRA, Affiliate, Biaya Proses), tambah platform custom baru, atau kembalikan ke pengaturan bawaan.
- **Mode Terang & Mode Gelap (Light / Dark Mode):** Tersimpan otomatis di perangkat.
- **Backup & Restore JSON:** Ekspor dan impor seluruh data produk, resep, dan preset ke file `.json` dengan validasi schema.
- **100% Offline-First & Installable PWA:** Tombol **Install** langsung di header dan menu Atur untuk memasang aplikasi ke layar utama HP maupun desktop.

### 5. Panduan & Tutorial Ramah Pemula (Bantuan)
- Pusat bantuan interaktif yang dapat dibuka dari header aplikasi, berisi **3 Langkah Mulai Cepat**, **Fungsi Setiap Menu**, **Kamus Istilah Awam** (HPP, Margin, ROI, Uang Cair, BEP, Pembulatan 900), dan **Tips Anti-Boncos**.

---

## Rumus Perhitungan Inti

Seluruh logika perhitungan dipisahkan di `src/utils/calculator.ts`:

```text
totalHpp        = modalProduk + biayaKemasan + biayaOperasionalLain
totalFeePercent = adminPercent + layananPercent + affiliatePercent + voucherPercent
totalFixedFee   = biayaProses + voucherNominal + biayaIklanPerUnit

// Forward (Cek Profit)
marketplacePercentFeeRp = sellingPrice * (totalFeePercent / 100)
totalMarketplaceFeeRp   = marketplacePercentFeeRp + totalFixedFee
netPayout               = sellingPrice - totalMarketplaceFeeRp
netProfit               = netPayout - totalHpp
netMarginPercent        = (netProfit / sellingPrice) * 100
roiPercent              = (netProfit / totalHpp) * 100

// Reverse (Cari Harga Jual)
// Target Rupiah:
rawSellingPrice = (totalHpp + totalFixedFee + targetProfitRp) / (1 - totalFeePercent / 100)

// Target Margin (%):
rawSellingPrice = (totalHpp + totalFixedFee) / (1 - (totalFeePercent + targetMarginPercent) / 100)
```

---

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite 6
- **Styling:** Tailwind CSS v4 (`Plus Jakarta Sans` + `tabular-nums`)
- **Icons:** `lucide-react`
- **PWA:** `vite-plugin-pwa` (Workbox offline precaching & auto-update)
- **Storage:** Client-side `localStorage` dengan schema versioning dan Backup/Restore JSON

---

## Struktur Proyek

```text
src/
├── components/
│   ├── ui/             # CurrencyInput, PercentInput, BottomNav, Modal, Toast, HelpModal
│   ├── calculator/     # ResultCard, ComparisonModal, BepModal
│   ├── recipes/        # RecipeEditor
│   └── products/       # ProductCard
├── pages/              # CalculatorPage, RecipesPage, ProductsPage, SettingsPage
├── utils/              # calculator.ts, format.ts, storage.ts, csvExport.ts
├── data/               # defaultPresets.ts
├── types/              # index.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## Menjalankan Secara Lokal

Pastikan **Node.js 18+** sudah terpasang, lalu jalankan perintah berikut:

```bash
# Install dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Build produksi (termasuk Service Worker PWA)
npm run build

# Preview hasil build produksi
npm run preview
```

---

## Arsitektur & Privasi Data

- **Tanpa Server & Tanpa Login:** Seluruh data produk, resep, dan preset hanya tersimpan di `localStorage` browser pengguna.
- **Bekerja Tanpa Internet:** Setelah dibuka sekali atau diinstall sebagai PWA, seluruh kalkulasi tetap berjalan penuh secara offline.
