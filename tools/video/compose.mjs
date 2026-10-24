// Render a video from its spec: base clip + approved cue masters + burned-in captions.
// Usage: node tools/video/compose.mjs <videos/xxx.yaml> [--masters <dir>]
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { composeArgs, parseVideoSpec } from '../lib/ffmpeg-args.mjs';
import { AUDIO_DIR, ROOT, main, parseFlags, runFfmpeg } from '../lib/runtime.mjs';

main(async () => {
  const flags = parseFlags(process.argv.slice(2));
  const specFile = flags._[0];
  if (!specFile) throw new Error('usage: compose.mjs <spec.yaml> [--masters <dir>]');

  const spec = parseVideoSpec(readFileSync(path.resolve(specFile), 'utf8'));
  const mastersDir = path.resolve(typeof flags.masters === 'string' ? flags.masters : path.join(AUDIO_DIR, 'masters'));
  const masterOf = (id) => path.join(mastersDir, `${id}.wav`);

  if (!existsSync(path.resolve(ROOT, spec.base))) throw new Error(`base clip not found: ${spec.base}`);
  const missingCaptions = spec.captions.filter((c) => !existsSync(path.resolve(ROOT, c)));
  if (missingCaptions.length) throw new Error(`caption file(s) not found: ${missingCaptions.join(', ')}`);
  const missing = spec.audio.map((a) => a.cue).filter((id) => !existsSync(masterOf(id)));
  if (missing.length) {
    throw new Error(`no approved master for: ${missing.join(', ')} (run tools/audio/approve.mjs first)`);
  }

  mkdirSync(path.join(ROOT, 'out'), { recursive: true });
  runFfmpeg(composeArgs(spec, masterOf));
  console.log(`rendered ${path.join('out', `${spec.name}.mp4`)}`);
});
