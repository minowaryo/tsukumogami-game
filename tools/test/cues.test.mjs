import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { parseCues, getCue, takeBaseName, withApproval } from '../lib/cues.mjs';

const REGISTRY = `# registry comment must survive approval
defaults:
  tool: elevenlabs
  license: ElevenLabs paid plan (prototype only)
  output_format: mp3_44100_128
  sfx_model: eleven_text_to_sound_v2
  music_model: music_v2
cues:
  sfx.reveal.chime:
    kind: sfx
    prompt: warm chime cluster
    duration: 2.5
    prompt_influence: 0.6
    approved: null
  music.reveal15:
    kind: music
    prompt: music box motif, no vocals
    duration: 15
    approved: null
`;

test('getCue merges registry defaults into the cue', () => {
  const registry = parseCues(REGISTRY);
  const cue = getCue(registry, 'sfx.reveal.chime');
  assert.equal(cue.id, 'sfx.reveal.chime');
  assert.equal(cue.kind, 'sfx');
  assert.equal(cue.tool, 'elevenlabs');
  assert.equal(cue.output_format, 'mp3_44100_128');
  assert.equal(cue.duration, 2.5);
});

test('getCue rejects an unknown cue and names the known ones', () => {
  const registry = parseCues(REGISTRY);
  assert.throws(() => getCue(registry, 'sfx.nope'), /sfx\.nope[\s\S]*sfx\.reveal\.chime/);
});

test('parseCues rejects a cue with an unsupported kind', () => {
  const bad = REGISTRY.replace('kind: sfx', 'kind: voice');
  assert.throws(() => parseCues(bad), /sfx\.reveal\.chime.*kind/);
});

test('parseCues rejects a cue without a prompt', () => {
  const bad = REGISTRY.replace('prompt: warm chime cluster', 'prompt: ""');
  assert.throws(() => parseCues(bad), /sfx\.reveal\.chime.*prompt/);
});

test('parseCues rejects an SFX duration outside the API range of 0.5-30 s', () => {
  const bad = REGISTRY.replace('duration: 2.5', 'duration: 31');
  assert.throws(() => parseCues(bad), /sfx\.reveal\.chime.*duration/);
});

test('parseCues rejects a music duration below the API minimum of 3 s', () => {
  const bad = REGISTRY.replace('duration: 15', 'duration: 2');
  assert.throws(() => parseCues(bad), /music\.reveal15.*duration/);
});

test('takeBaseName encodes local date, time, and take index', () => {
  const name = takeBaseName(new Date(2026, 9, 21, 9, 5, 7), 3);
  assert.equal(name, '20261021-090507-3');
});

test('withApproval records the approval on the cue only', () => {
  const approval = { take: '20261021-090507-3.mp3', master: 'masters/sfx.reveal.chime.wav', approved_at: '2026-10-21' };
  const updated = parse(withApproval(REGISTRY, 'sfx.reveal.chime', approval));
  assert.deepEqual(updated.cues['sfx.reveal.chime'].approved, approval);
  assert.equal(updated.cues['music.reveal15'].approved, null);
});

test('withApproval keeps comments in the registry', () => {
  const out = withApproval(REGISTRY, 'sfx.reveal.chime', { take: 'a.mp3' });
  assert.match(out, /# registry comment must survive approval/);
});

test('withApproval leaves long lines of other cues unwrapped', () => {
  const longPrompt = 'a very long prompt '.repeat(8).trim();
  const text = REGISTRY.replace('prompt: music box motif, no vocals', `prompt: ${longPrompt}`);
  const out = withApproval(text, 'sfx.reveal.chime', { take: 'a.mp3' });
  assert.ok(out.includes(`    prompt: ${longPrompt}\n`), 'long prompt line was rewrapped');
});

test('withApproval rejects an unknown cue', () => {
  assert.throws(() => withApproval(REGISTRY, 'sfx.nope', { take: 'a.mp3' }), /sfx\.nope/);
});
