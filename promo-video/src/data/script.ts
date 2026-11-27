export interface SceneScript {
  id: string;
  title: string;
  audioFile: string;
  text: string;
  estimatedSec: number;
  bufferFrames: number;
}

export const FPS = 30;

export const SCENE_SCRIPTS: SceneScript[] = [
  {
    id: 'scene_01',
    title: 'Hook (Masalah)',
    audioFile: 'audio/vo_01.mp3',
    text: 'Orderan di Shopee dan TikTok ramai terus, tapi pas dicek rekening, kok malah boncos?',
    estimatedSec: 4.5,
    bufferFrames: 10,
  },
  {
    id: 'scene_02',
    title: 'Agitasi / Realita',
    audioFile: 'audio/vo_02.mp3',
    text: 'Hati-hati! Banyak penjual lupa hitung potongan admin, gratis ongkir ekstra, komisi affiliate, sampai biaya kemasan. Akibatnya, makin banyak yang beli, malah makin rugi.',
    estimatedSec: 8.0,
    bufferFrames: 10,
  },
  {
    id: 'scene_03',
    title: 'Solusi & Intro App',
    audioFile: 'audio/vo_03.mp3',
    text: 'Stop nebak-nebak harga jual! Kenalin, MarginKu. Aplikasi kalkulator HPP dan harga jual khusus penjual online.',
    estimatedSec: 6.0,
    bufferFrames: 10,
  },
  {
    id: 'scene_04',
    title: 'Demo Fitur Utama',
    audioFile: 'audio/vo_04.mp3',
    text: 'Tinggal masukin modal dan target untung bersih yang kamu mau. Dalam satu detik, MarginKu langsung kasih tahu harga jual paling aman, lengkap dengan simulasi potongan semua marketplace sekaligus.',
    estimatedSec: 9.5,
    bufferFrames: 10,
  },
  {
    id: 'scene_05',
    title: 'Kelebihan App',
    audioFile: 'audio/vo_05.mp3',
    text: 'Ada juga kalkulator resep bahan baku buat jualan kuliner, bisa export ke Excel, jalan seratus persen offline di HP kamu, dan yang paling penting: cukup sekali bayar, tanpa biaya langganan bulanan!',
    estimatedSec: 9.5,
    bufferFrames: 10,
  },
  {
    id: 'scene_06',
    title: 'CTA (Penutup)',
    audioFile: 'audio/vo_06.mp3',
    text: 'Amankan profit jualanmu sebelum makin boncos. Klik link di bio atau keranjang sekarang untuk dapetin MarginKu!',
    estimatedSec: 5.5,
    bufferFrames: 18,
  },
];
