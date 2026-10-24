// Derive OGG + MP3 files for the browser prototype from every approved WAV master.
// Usage: node tools/audio/derive.mjs [--cue <cue-id>]
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseCues } from '../lib/cues.mjs';
import { deriveArgs } from '../lib/ffmpeg-args.mjs';
import { AUDIO_DIR, CUES_FILE, main, parseFlags, runFfmpeg } from '../lib/runtime.mjs';

main(async () => {
  const flags = parseFlags(process.argv.slice(2));
  const registry = parseCues(readFileSync(CUES_FILE, 'utf8'));
  const ids = Object.keys(registry.cues).filter((id) => flags.cue === undefined || id === flags.cue);
  const outDir = path.join(AUDIO_DIR, 'game');
  mkdirSync(outDir, { recursive: true });

  let count = 0;
  for (const id of ids) {
    const master = path.join(AUDIO_DIR, 'masters', `${id}.wav`);
    if (!registry.cues[id].approved || !existsSync(master)) continue;
    for (const args of deriveArgs(master, path.join(outDir, id))) runFfmpeg(args);
    count++;
  }
  console.log(`derived ${count} cue(s) into ${path.relative(process.cwd(), outDir)}`);
});
