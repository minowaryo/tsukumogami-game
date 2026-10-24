// Generate candidate takes for one cue with the ElevenLabs API.
// Usage: node tools/audio/generate.mjs --cue <cue-id> [--takes N]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseCues, getCue, takeBaseName } from '../lib/cues.mjs';
import { buildRequest } from '../lib/elevenlabs.mjs';
import { AUDIO_DIR, CUES_FILE, loadEnv, main, parseFlags } from '../lib/runtime.mjs';

const EXTENSIONS = { mp3: 'mp3', wav: 'wav', opus: 'opus' };

main(async () => {
  const flags = parseFlags(process.argv.slice(2));
  if (typeof flags.cue !== 'string') throw new Error('usage: generate.mjs --cue <cue-id> [--takes N]');
  const takes = Number(flags.takes ?? 1);
  if (!Number.isInteger(takes) || takes < 1 || takes > 10) throw new Error('--takes must be 1-10');

  loadEnv();
  const cue = getCue(parseCues(readFileSync(CUES_FILE, 'utf8')), flags.cue);
  const ext = EXTENSIONS[cue.output_format.split('_')[0]];
  if (!ext) throw new Error(`output_format ${cue.output_format} is not supported (use mp3_*, wav_*, or opus_*)`);

  const dir = path.join(AUDIO_DIR, 'takes', cue.id);
  mkdirSync(dir, { recursive: true });

  for (let i = 1; i <= takes; i++) {
    const req = buildRequest(cue, process.env.ELEVENLABS_API_KEY);
    const res = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body });
    if (!res.ok) throw new Error(`ElevenLabs returned ${res.status}: ${await res.text()}`);

    const base = takeBaseName(new Date(), i);
    const file = path.join(dir, `${base}.${ext}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    writeFileSync(
      path.join(dir, `${base}.json`),
      JSON.stringify(
        {
          cue: cue.id,
          kind: cue.kind,
          tool: cue.tool,
          model: cue.kind === 'sfx' ? cue.sfx_model : cue.music_model,
          license: cue.license,
          endpoint: req.url,
          request: JSON.parse(req.body),
          generated_at: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
    console.log(`take ${i}/${takes}: ${path.relative(process.cwd(), file)}`);
  }
});
