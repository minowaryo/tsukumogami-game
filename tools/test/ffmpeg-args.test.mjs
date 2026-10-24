import { test } from 'node:test';
import assert from 'node:assert/strict';
import { masterArgs, deriveArgs, parseVideoSpec, composeArgs } from '../lib/ffmpeg-args.mjs';

const SPEC = `
name: phase1-reveal
duration: 15
base: videos/clips/phase1-reveal.mp4
fade_out: 1
audio:
  - cue: sfx.hook.tink
    at: 0.3
  - cue: music.reveal15
    at: 2
    gain: 0.8
captions:
  - videos/captions/phase1-reveal.ja.ass
  - videos/captions/phase1-reveal.en.ass
`;

const resolve = (id) => `assets/proto/audio/masters/${id}.wav`;

function valueAfter(args, flag) {
  const i = args.indexOf(flag);
  assert.notEqual(i, -1, `missing ${flag}`);
  return args[i + 1];
}

test('masterArgs converts a take to WAV 44.1 kHz / 16-bit stereo', () => {
  const args = masterArgs('takes/a.mp3', 'masters/a.wav');
  assert.equal(valueAfter(args, '-i'), 'takes/a.mp3');
  assert.equal(valueAfter(args, '-ar'), '44100');
  assert.equal(valueAfter(args, '-ac'), '2');
  assert.equal(valueAfter(args, '-c:a'), 'pcm_s16le');
  assert.equal(args.at(-1), 'masters/a.wav');
});

test('deriveArgs produces an OGG Vorbis and an MP3 from one master', () => {
  const [ogg, mp3] = deriveArgs('masters/a.wav', 'game/a');
  assert.equal(valueAfter(ogg, '-c:a'), 'libvorbis');
  assert.equal(ogg.at(-1), 'game/a.ogg');
  assert.equal(valueAfter(mp3, '-c:a'), 'libmp3lame');
  assert.equal(mp3.at(-1), 'game/a.mp3');
});

test('parseVideoSpec fills defaults for size, fps, and gain', () => {
  const spec = parseVideoSpec(SPEC);
  assert.deepEqual(spec.size, [1080, 1920]);
  assert.equal(spec.fps, 30);
  assert.equal(spec.audio[0].gain, 1);
  assert.equal(spec.audio[1].gain, 0.8);
});

test('parseVideoSpec rejects an audio entry without a cue', () => {
  assert.throws(() => parseVideoSpec(SPEC.replace('cue: sfx.hook.tink', 'cue: ""')), /audio\[0\].*cue/);
});

test('parseVideoSpec rejects a negative start time', () => {
  assert.throws(() => parseVideoSpec(SPEC.replace('at: 0.3', 'at: -1')), /audio\[0\].*at/);
});

test('parseVideoSpec rejects absolute caption paths (ffmpeg filter escaping)', () => {
  assert.throws(
    () => parseVideoSpec(SPEC.replace('videos/captions/phase1-reveal.ja.ass', 'C:/captions/ja.ass')),
    /captions\[0\]/,
  );
});

test('composeArgs feeds the base clip and each cue master as inputs in order', () => {
  const args = composeArgs(parseVideoSpec(SPEC), resolve);
  const inputs = args.flatMap((a, i) => (a === '-i' ? [args[i + 1]] : []));
  assert.deepEqual(inputs, [
    'videos/clips/phase1-reveal.mp4',
    'assets/proto/audio/masters/sfx.hook.tink.wav',
    'assets/proto/audio/masters/music.reveal15.wav',
  ]);
});

test('composeArgs delays each cue to its start time in milliseconds', () => {
  const graph = valueAfter(composeArgs(parseVideoSpec(SPEC), resolve), '-filter_complex');
  assert.match(graph, /\[1:a\]adelay=300:all=1,volume=1\[a1\]/);
  assert.match(graph, /\[2:a\]adelay=2000:all=1,volume=0\.8\[a2\]/);
});

test('composeArgs mixes all cues without loudness normalization and fades out at the end', () => {
  const graph = valueAfter(composeArgs(parseVideoSpec(SPEC), resolve), '-filter_complex');
  assert.match(graph, /\[a1\]\[a2\]amix=inputs=2:duration=longest:normalize=0/);
  assert.match(graph, /afade=t=out:st=14:d=1/);
});

test('composeArgs fits the base clip to 1080x1920 and holds its last frame', () => {
  const graph = valueAfter(composeArgs(parseVideoSpec(SPEC), resolve), '-filter_complex');
  assert.match(graph, /scale=1080:1920:force_original_aspect_ratio=decrease/);
  assert.match(graph, /pad=1080:1920/);
  assert.match(graph, /tpad=stop_mode=clone:stop_duration=15/);
});

test('composeArgs burns in every caption file in order', () => {
  const graph = valueAfter(composeArgs(parseVideoSpec(SPEC), resolve), '-filter_complex');
  assert.match(
    graph,
    /subtitles=filename=videos\/captions\/phase1-reveal\.ja\.ass,subtitles=filename=videos\/captions\/phase1-reveal\.en\.ass/,
  );
});

test('composeArgs cuts the output to the spec duration and limits threads', () => {
  const args = composeArgs(parseVideoSpec(SPEC), resolve);
  assert.equal(valueAfter(args, '-t'), '15');
  assert.equal(valueAfter(args, '-threads'), '2');
  assert.equal(args.at(-1), 'out/phase1-reveal.mp4');
});

test('composeArgs renders silence when the spec has no audio cues', () => {
  const spec = parseVideoSpec(SPEC.replace(/audio:[\s\S]*?captions:/, 'audio: []\ncaptions:'));
  const args = composeArgs(spec, resolve);
  const graph = valueAfter(args, '-filter_complex');
  assert.match(graph, /anullsrc/);
  assert.doesNotMatch(graph, /amix/);
});
