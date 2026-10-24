import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRequest } from '../lib/elevenlabs.mjs';

const SFX = {
  id: 'sfx.reveal.chime',
  kind: 'sfx',
  prompt: 'warm chime cluster',
  duration: 2.5,
  prompt_influence: 0.6,
  output_format: 'mp3_44100_128',
  sfx_model: 'eleven_text_to_sound_v2',
  music_model: 'music_v2',
};

const MUSIC = {
  id: 'music.reveal15',
  kind: 'music',
  prompt: 'music box motif, no vocals',
  duration: 15,
  output_format: 'mp3_44100_128',
  sfx_model: 'eleven_text_to_sound_v2',
  music_model: 'music_v2',
};

test('SFX cue targets the sound-generation endpoint with the output format', () => {
  const req = buildRequest(SFX, 'key-123');
  assert.equal(req.method, 'POST');
  assert.equal(req.url, 'https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128');
});

test('SFX request body carries prompt, duration, influence, and model', () => {
  const body = JSON.parse(buildRequest(SFX, 'key-123').body);
  assert.deepEqual(body, {
    text: 'warm chime cluster',
    duration_seconds: 2.5,
    prompt_influence: 0.6,
    model_id: 'eleven_text_to_sound_v2',
  });
});

test('SFX request asks for a seamless loop only when the cue says loop', () => {
  const body = JSON.parse(buildRequest({ ...SFX, loop: true }, 'key-123').body);
  assert.equal(body.loop, true);
});

test('music cue targets the music endpoint and is forced instrumental', () => {
  const req = buildRequest(MUSIC, 'key-123');
  assert.equal(req.url, 'https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128');
  assert.deepEqual(JSON.parse(req.body), {
    prompt: 'music box motif, no vocals',
    music_length_ms: 15000,
    force_instrumental: true,
    model_id: 'music_v2',
  });
});

test('request authenticates with the xi-api-key header', () => {
  const req = buildRequest(SFX, 'key-123');
  assert.equal(req.headers['xi-api-key'], 'key-123');
  assert.equal(req.headers['Content-Type'], 'application/json');
});

test('request without an API key fails with a hint about .env', () => {
  assert.throws(() => buildRequest(SFX, ''), /ELEVENLABS_API_KEY/);
  assert.throws(() => buildRequest(SFX, undefined), /ELEVENLABS_API_KEY/);
});
