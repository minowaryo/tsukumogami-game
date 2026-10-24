import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const AUDIO_DIR = path.join(ROOT, 'assets', 'proto', 'audio');
export const CUES_FILE = path.join(AUDIO_DIR, 'cues.yaml');

export function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`ffmpeg failed (exit ${result.status})`);
}

export function parseFlags(argv) {
  const flags = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const next = argv[i + 1];
      flags[arg.slice(2)] = next !== undefined && !next.startsWith('--') ? argv[++i] : true;
    } else {
      flags._.push(arg);
    }
  }
  return flags;
}

export function loadEnv() {
  try {
    process.loadEnvFile(path.join(ROOT, '.env'));
  } catch {
    // .env is optional; generate.mjs reports a missing key itself
  }
}

export function main(fn) {
  fn().catch((err) => {
    console.error(`error: ${err.message}`);
    process.exit(1);
  });
}
