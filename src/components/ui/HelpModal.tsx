import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  ChefHat,
  Package,
  Settings,
  Scale,
  Target,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { Modal } from './Modal';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

type HelpSection = 'mulai' | 'fitur' | 'kamus' | 'tips';

interface GlossaryItem {
  term: string;
  simple: string;
  example: string;
}

const GLOSSARY: GlossaryItem[] = [
  {
    term: 'HPP (Harga Pokok Penjualan)',
    simple: 'Total modal bersih untuk 1 barang siap kirim, termasuk harga beli/bahan dan kemasan.',
    example: 'Modal kaos Rp45.000 + plastik & lakban Rp2.000 = HPP Rp47.000.',
  },
  {
    term: 'Potongan Marketplace',
    simple: 'Biaya yang otomatis dipotong Shopee/TikTok/GoFood sebelum uang masuk ke saldo Anda.',
    example: 'Admin 8% + Gratis Ongkir XTRA 4% + Biaya Proses Rp1.250.',
  },
  {
    term: 'Uang Cair (Net Payout)',
    simple: 'Jumlah uang bersih yang benar-benar masuk ke saldo toko Anda setelah dipotong platform.',
    example: 'Harga jual Rp100.000 dikurangi potongan Rp13.250 = Uang Cair Rp86.750.',
  },
  {
    term: 'Profit Bersih & Margin (%)',
    simple: 'Untung bersih di kantong Anda setelah Uang Cair dikurangi modal (HPP). Margin adalah persentase untung dari harga jual.',
    example: 'Uang Cair Rp86.750 - HPP Rp60.000 = Profit Rp26.750 (Margin 26,8%).',
  },
  {
    term: 'ROI (Return on Investment)',
    simple: 'Seberapa besar untung dibanding modal yang Anda keluarkan.',
    example: 'Modal Rp50.000 dapat untung Rp25.000 berarti ROI 50%.',
  },
  {
    term: 'Pembulatan 900 (Harga Psikologis)',
    simple: 'Membulatkan harga jual otomatis ke akhiran 900 agar terlihat lebih murah di mata pembeli.',
    example: 'Hasil hitungan Rp24.320 dibulatkan otomatis menjadi Rp24.900.',
  },
  {
    term: 'BEP (Balik Modal Bulanan)',
    simple: 'Jumlah barang minimal yang harus terjual tiap bulan agar biaya sewa, listrik, dan gaji tertutup.',
    example: 'Biaya tetap Rp3.000.000/bulan dengan profit Rp15.000/pcs = minimal jual 200 pcs/bulan.',
  },
];

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const [section, setSection] = useState<HelpSection>('mulai');
  const [openGlossaryIdx, setOpenGlossaryIdx] = useState<number | null>(0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Panduan & Tutorial MarginKu"
      subtitle="Penjelasan singkat dan mudah dipahami untuk pemula"
    >
      {/* Navigation Pills */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-950 mb-4">
        {[
          { id: 'mulai' as HelpSection, label: 'Mulai', icon: Sparkles },
          { id: 'fitur' as HelpSection, label: 'Fitur', icon: BookOpen },
          { id: 'kamus' as HelpSection, label: 'Istilah', icon: ShieldCheck },
          { id: 'tips' as HelpSection, label: 'Tips', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold transition-all ${
                active
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: MULAI CEPAT */}
      {section === 'mulai' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              MarginKu membantu Anda menghitung <strong className="text-zinc-950 dark:text-zinc-100">untung bersih</strong> atau mencari <strong className="text-zinc-950 dark:text-zinc-100">harga jual ideal</strong> agar jualan di marketplace tidak rugi karena potongan admin.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              3 Langkah Mudah Menghitung
            </h3>

            {[
              {
                step: '1',
                title: 'Pilih Tujuan Hitung di Atas',
                desc: 'Pilih "Cek Profit" jika Anda sudah punya harga jual. Pilih "Cari Harga Jual" jika Anda ingin tahu harus jual berapa agar dapat untung tertentu.',
              },
              {
                step: '2',
                title: 'Isi Modal & Pilih Platform',
                desc: 'Masukkan harga beli barang dan biaya kemasan (bubble wrap/kardus). Lalu klik platform tujuan seperti Shopee, TikTok, GoFood, atau Offline.',
              },
              {
                step: '3',
                title: 'Lihat Hasil Otomatis di Kartu Atas',
                desc: 'Tidak perlu tekan tombol hitung. Profit bersih, uang cair ke saldo, dan status kesehatan margin langsung muncul secara real-time.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-3 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                <div className="w-6 h-6 rounded-full bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {item.step}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Arti Warna Status */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Arti Status Kesehatan Margin
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Boncos (Rugi)</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                  Profit Rp0 atau minus. Harga jual terlalu rendah.
                </p>
              </div>
              <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30">
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Tipis (&lt;15%)</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                  Untung kecil, rawan rugi jika ada retur atau iklan.
                </p>
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sehat (15-29%)</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                  Aman untuk jualan rutin dan promo ringan.
                </p>
              </div>
              <div className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tebal (30%+)</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">
                  Sangat optimal, leluasa pasang iklan & affiliate.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: FUNGSI SETIAP MENU */}
      {section === 'fitur' && (
        <div className="space-y-2.5">
          {[
            {
              icon: Calculator,
              title: 'Menu Hitung (Kalkulator Utama)',
              items: [
                'Cek Profit: Masukkan harga jual Anda untuk melihat sisa uang cair dan laba bersih.',
                'Cari Harga Jual: Masukkan target untung (Rupiah atau %) untuk mendapat rekomendasi harga jual otomatis.',
                'Ubah Rincian Potongan: Atur detail biaya admin, gratis ongkir, komisi affiliate, voucher, dan biaya iklan per produk.',
              ],
            },
            {
              icon: Scale,
              title: 'Bandingkan Semua Platform',
              items: [
                'Cukup 1 klik di bawah kartu hasil untuk melihat perbandingan profit produk yang sama di Shopee, TikTok, GoFood, dan Offline secara bersamaan.',
              ],
            },
            {
              icon: Target,
              title: 'Simulasi Target Bulanan (BEP)',
              items: [
                'Hitung berapa pcs yang harus terjual setiap hari agar biaya tetap bulanan (sewa, kuota, listrik) tertutup dan target penghasilan tercapai.',
              ],
            },
            {
              icon: ChefHat,
              title: 'Menu Bahan (Kalkulator Resep / HPP)',
              items: [
                'Khusus kuliner & handmade. Masukkan harga beli kemasan bahan (misal 1 kg tepung) dan takaran pakai (misal 250 gr), otomatis keluar modal per porsi.',
                'Klik "Gunakan di Kalkulator" agar modal per porsi langsung terisi ke kalkulator utama.',
              ],
            },
            {
              icon: Package,
              title: 'Menu Produk (Katalog Tersimpan)',
              items: [
                'Simpan semua hasil hitungan produk Anda agar tidak perlu hitung ulang.',
                'Filter produk yang masih Boncos atau Tipis, duplikat produk, dan Export ke Excel (CSV) kapan saja.',
              ],
            },
            {
              icon: Settings,
              title: 'Menu Atur (Pengaturan & Backup)',
              items: [
                'Ubah angka potongan default tiap marketplace jika ada kenaikan tarif admin, atau tambah platform baru.',
                'Backup & Restore data ke file JSON agar data aman jika ganti HP.',
                'Ganti tampilan Terang / Gelap dan install aplikasi ke layar utama HP (bisa dipakai tanpa internet).',
              ],
            },
          ].map((block) => {
            const Icon = block.icon;
            return (
              <div
                key={block.title}
                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl bg-zinc-950 dark:bg-zinc-800 text-white dark:text-lime-400 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                    {block.title}
                  </h3>
                </div>
                <ul className="space-y-1.5 pl-1">
                  {block.items.map((text, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1.5 shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 3: KAMUS ISTILAH AWAM */}
      {section === 'kamus' && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            Klik istilah di bawah ini untuk melihat penjelasan sederhana beserta contohnya.
          </p>
          {GLOSSARY.map((item, idx) => {
            const isOpen = openGlossaryIdx === idx;
            return (
              <div
                key={item.term}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900"
              >
                <button
                  type="button"
                  onClick={() => setOpenGlossaryIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left"
                >
                  <span className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                    {item.term}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-0 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-2.5">
                      {item.simple}
                    </p>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">
                        Contoh
                      </span>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {item.example}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SECTION 4: TIPS ANTI-BONCOS */}
      {section === 'tips' && (
        <div className="space-y-2.5">
          {[
            {
              title: 'Jangan Lupakan Biaya Kemasan',
              desc: 'Bubble wrap, lakban, plastik polymailer, hingga stiker sering terlihat kecil (Rp1.000-Rp3.000), tapi jika dijual 100 pcs bisa menggerus untung ratusan ribu.',
            },
            {
              title: 'Cek Tarif Admin Secara Berkala',
              desc: 'Marketplace sering mengubah biaya admin kategori dan program Gratis Ongkir XTRA. Anda bisa memperbarui angkanya sekali saja di menu Atur.',
            },
            {
              title: 'Sisakan Ruang untuk Iklan & Voucher',
              desc: 'Usahakan margin bersih minimal 20-30% sebelum iklan, agar saat Anda membuat voucher toko atau iklan berbayar, profit tidak langsung habis.',
            },
            {
              title: 'Gunakan Backup Rutin',
              desc: 'Semua data tersimpan aman di browser HP Anda tanpa internet. Lakukan Backup JSON di menu Atur secara berkala sebelum menghapus cache browser.',
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">
                  {tip.title}
                </h3>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
