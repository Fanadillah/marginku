import 'dotenv/config';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FPS, SCENE_SCRIPTS } from '../src/data/script.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROMO_ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(PROMO_ROOT, 'public', 'audio');
const MANIFEST_PATH = path.join(PROMO_ROOT, 'src', 'data', 'voManifest.json');

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface SceneManifestEntry {
  id: string;
  title: string;
  audioFile: string;
  hasAudio: boolean;
  text: string;
  durationSec: number;
  durationInFrames: number;
  bufferFrames: number;
  totalFrames: number;
  words: WordTimestamp[];
}

export interface VoManifest {
  fps: number;
  dryRun: boolean;
  totalDurationInFrames: number;
  scenes: SceneManifestEntry[];
}

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

function measureAudioDurationSec(filePath: string): number {
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
    { encoding: 'utf8' }
  ).trim();
  const dur = parseFloat(out);
  if (!Number.isFinite(dur) || dur <= 0) {
    throw new Error(`Invalid audio duration from ffprobe for ${filePath}: "${out}"`);
  }
  return dur;
}

function buildProportionalWords(text: string, durationSec: number): WordTimestamp[] {
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  const totalWeight = rawWords.reduce((acc, w) => acc + Math.max(2, w.length), 0);
  let cursor = 0;
  return rawWords.map((word) => {
    const weight = Math.max(2, word.length);
    const slice = (weight / totalWeight) * durationSec;
    const start = Number(cursor.toFixed(3));
    const end = Number((cursor + slice).toFixed(3));
    cursor += slice;
    return { word, start, end };
  });
}

function alignmentToWords(alignment: ElevenLabsAlignment): WordTimestamp[] {
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;
  const words: WordTimestamp[] = [];
  let curWord = '';
  let curStart = -1;
  let curEnd = 0;

  for (let i = 0; i < characters.length; i++) {
    const ch = characters[i];
    if (/\s/.test(ch)) {
      if (curWord.length > 0) {
        words.push({
          word: curWord,
          start: Number(curStart.toFixed(3)),
          end: Number(curEnd.toFixed(3)),
        });
        curWord = '';
        curStart = -1;
      }
    } else {
      if (curStart < 0) curStart = starts[i] ?? curEnd;
      curWord += ch;
      curEnd = ends[i] ?? curStart + 0.08;
    }
  }
  if (curWord.length > 0) {
    words.push({
      word: curWord,
      start: Number(curStart.toFixed(3)),
      end: Number(curEnd.toFixed(3)),
    });
  }
  return words;
}

async function generateSceneAudio(
  apiKey: string,
  voiceId: string,
  text: string,
  outPath: string
): Promise<{ durationSec: number; words: WordTimestamp[] }> {
  const voiceSettings = {
    stability: 0.45,
    similarity_boost: 0.8,
    style: 0.25,
    use_speaker_boost: true,
  };

  // Primary: /with-timestamps
  const tsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`;
  const tsRes = await fetch(tsUrl, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    }),
  });

  if (tsRes.ok) {
    const data = (await tsRes.json()) as {
      audio_base64?: string;
      alignment?: ElevenLabsAlignment;
    };
    if (data.audio_base64) {
      const buf = Buffer.from(data.audio_base64, 'base64');
      fs.writeFileSync(outPath, buf);
      const durationSec = measureAudioDurationSec(outPath);
      const words =
        data.alignment && data.alignment.characters?.length > 0
          ? alignmentToWords(data.alignment)
          : buildProportionalWords(text, durationSec);
      return { durationSec, words };
    }
  } else {
    const errText = await tsRes.text();
    console.warn(`[vo] /with-timestamps failed (${tsRes.status}): ${errText.slice(0, 200)}. Falling back...`);
  }

  // Fallback: standard TTS endpoint
  const stdUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const stdRes = await fetch(stdUrl, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: voiceSettings,
    }),
  });

  if (!stdRes.ok) {
    const errText = await stdRes.text();
    throw new Error(`ElevenLabs API error (${stdRes.status}): ${errText}`);
  }

  const audioBuf = Buffer.from(await stdRes.arrayBuffer());
  fs.writeFileSync(outPath, audioBuf);
  const durationSec = measureAudioDurationSec(outPath);
  const words = buildProportionalWords(text, durationSec);
  return { durationSec, words };
}

async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || 'pNInz6obpgDQGcFmaJgB';

  if (!isDryRun && (!apiKey || apiKey === 'your_elevenlabs_api_key_here')) {
    console.error('[vo] ELEVENLABS_API_KEY belum diisi di promo-video/.env.');
    console.error('[vo] Jalankan dengan --dry-run jika ingin membuat manifest estimasi untuk preview.');
    process.exit(1);
  }

  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });

  const scenes: SceneManifestEntry[] = [];

  for (const scene of SCENE_SCRIPTS) {
    const outFile = path.join(PROMO_ROOT, 'public', scene.audioFile);
    if (isDryRun) {
      const durationSec = scene.estimatedSec;
      const durationInFrames = Math.ceil(durationSec * FPS);
      scenes.push({
        id: scene.id,
        title: scene.title,
        audioFile: scene.audioFile,
        hasAudio: false,
        text: scene.text,
        durationSec,
        durationInFrames,
        bufferFrames: scene.bufferFrames,
        totalFrames: durationInFrames + scene.bufferFrames,
        words: buildProportionalWords(scene.text, durationSec),
      });
      console.log(`[vo][dry-run] ${scene.id}: ${durationSec.toFixed(2)}s (${durationInFrames + scene.bufferFrames} frames)`);
    } else {
      console.log(`[vo] Generating ${scene.id} (${scene.title})...`);
      const { durationSec, words } = await generateSceneAudio(apiKey!, voiceId, scene.text, outFile);
      const durationInFrames = Math.ceil(durationSec * FPS);
      scenes.push({
        id: scene.id,
        title: scene.title,
        audioFile: scene.audioFile,
        hasAudio: true,
        text: scene.text,
        durationSec: Number(durationSec.toFixed(3)),
        durationInFrames,
        bufferFrames: scene.bufferFrames,
        totalFrames: durationInFrames + scene.bufferFrames,
        words,
      });
      console.log(
        `[vo] Saved ${scene.audioFile} — ${durationSec.toFixed(2)}s (${durationInFrames} + ${scene.bufferFrames} buffer frames, ${words.length} words)`
      );
    }
  }

  const totalDurationInFrames = scenes.reduce((sum, s) => sum + s.totalFrames, 0);
  const manifest: VoManifest = {
    fps: FPS,
    dryRun: isDryRun,
    totalDurationInFrames,
    scenes,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(
    `[vo] Manifest written to src/data/voManifest.json — Total: ${(totalDurationInFrames / FPS).toFixed(2)}s (${totalDurationInFrames} frames)`
  );
}

run().catch((err) => {
  console.error('[vo] Error:', err);
  process.exit(1);
});
