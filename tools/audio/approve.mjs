// Approve one take: convert it to the WAV master and record the approval in cues.yaml.
// Usage: node tools/audio/approve.mjs --cue <cue-id> --take <file name in takes/<cue-id>/>
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseCues, getCue, withApproval } from '../lib/cues.mjs';
import { masterArgs } from '../lib/ffmpeg-args.mjs';
import { AUDIO_DIR, CUES_FILE, main, parseFlags, runFfmpeg } from '../lib/runtime.mjs';

main(async () => {
  const flags = parseFlags(process.argv.slice(2));
  if (typeof flags.cue !== 'string' || typeof flags.take !== 'string') {
    throw new Error('usage: approve.mjs --cue <cue-id> --take <file>');
  }

  const text = readFileSync(CUES_FILE, 'utf8');
  const cue = getCue(parseCues(text), flags.cue);
  const takePath = path.join(AUDIO_DIR, 'takes', cue.id, path.basename(flags.take));
  if (!existsSync(takePath)) throw new Error(`take not found: ${takePath}`);

  const master = path.join(AUDIO_DIR, 'masters', `${cue.id}.wav`);
  mkdirSync(path.dirname(master), { recursive: true });
  runFfmpeg(masterArgs(takePath, master));

  const sidecarPath = takePath.replace(/\.[^.]+$/, '.json');
  const sidecar = existsSync(sidecarPath) ? JSON.parse(readFileSync(sidecarPath, 'utf8')) : {};
  const approval = {
    take: path.basename(takePath),
    master: `masters/${cue.id}.wav`,
    approved_at: new Date().toISOString().slice(0, 10),
    generated_at: sidecar.generated_at ?? null,
    tool: sidecar.tool ?? cue.tool,
    model: sidecar.model ?? null,
    license: sidecar.license ?? cue.license,
    prompt: sidecar.request?.text ?? sidecar.request?.prompt ?? cue.prompt,
  };
  writeFileSync(CUES_FILE, withApproval(text, cue.id, approval));
  console.log(`approved ${cue.id}: ${path.relative(process.cwd(), master)}`);
});
