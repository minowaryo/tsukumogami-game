import { parse } from 'yaml';

const COMMON = ['-y', '-hide_banner', '-loglevel', 'error'];

export function masterArgs(input, output) {
  return [...COMMON, '-i', input, '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', output];
}

export function deriveArgs(master, outBase) {
  return [
    [...COMMON, '-i', master, '-c:a', 'libvorbis', '-q:a', '6', `${outBase}.ogg`],
    [...COMMON, '-i', master, '-c:a', 'libmp3lame', '-b:a', '192k', `${outBase}.mp3`],
  ];
}

export function parseVideoSpec(text) {
  const s = parse(text) ?? {};
  if (typeof s.name !== 'string' || !/^[A-Za-z0-9][\w.-]*$/.test(s.name)) {
    throw new Error('spec: name must be a file-name-safe slug (letters, digits, . _ -)');
  }
  if (typeof s.duration !== 'number' || s.duration <= 0) {
    throw new Error('spec: duration must be a positive number of seconds');
  }
  if (typeof s.base !== 'string' || !s.base) {
    throw new Error('spec: base (the video clip to put audio and captions on) is required');
  }

  const audio = (s.audio ?? []).map((a, i) => {
    if (typeof a?.cue !== 'string' || !a.cue) throw new Error(`spec: audio[${i}].cue is required`);
    if (typeof a.at !== 'number' || a.at < 0) throw new Error(`spec: audio[${i}].at must be >= 0 seconds`);
    return { cue: a.cue, at: a.at, gain: a.gain ?? 1 };
  });

  // Caption paths go into an ffmpeg filter string, where ':' and quotes are special —
  // so only plain relative paths are accepted.
  const captions = (s.captions ?? []).map((c, i) => {
    if (typeof c !== 'string' || !/^[\w.-][\w./-]*$/.test(c)) {
      throw new Error(`spec: captions[${i}] must be a relative path of letters, digits, . _ - / (got ${c})`);
    }
    return c;
  });

  return {
    name: s.name,
    duration: s.duration,
    base: s.base,
    size: s.size ?? [1080, 1920],
    fps: s.fps ?? 30,
    fade_out: s.fade_out ?? 0,
    audio,
    captions,
  };
}

export function composeArgs(spec, resolveAudio) {
  const [w, h] = spec.size;
  const d = spec.duration;
  const subtitles = spec.captions.map((c) => `,subtitles=filename=${c}`).join('');
  const graph = [
    `[0:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1,` +
      `fps=${spec.fps},tpad=stop_mode=clone:stop_duration=${d}${subtitles}[v]`,
  ];
  const inputs = ['-i', spec.base];

  if (spec.audio.length === 0) {
    graph.push('anullsrc=r=44100:cl=stereo[aout]');
  } else {
    spec.audio.forEach((a, k) => {
      const n = k + 1;
      inputs.push('-i', resolveAudio(a.cue));
      graph.push(`[${n}:a]adelay=${Math.round(a.at * 1000)}:all=1,volume=${a.gain}[a${n}]`);
    });
    const labels = spec.audio.map((_, k) => `[a${k + 1}]`).join('');
    let mix = `${labels}amix=inputs=${spec.audio.length}:duration=longest:normalize=0,apad`;
    if (spec.fade_out > 0) mix += `,afade=t=out:st=${d - spec.fade_out}:d=${spec.fade_out}`;
    graph.push(`${mix}[aout]`);
  }

  return [
    ...COMMON,
    ...inputs,
    '-filter_complex', graph.join(';'),
    '-map', '[v]',
    '-map', '[aout]',
    '-t', String(d),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
    '-threads', '2',
    '-movflags', '+faststart',
    `out/${spec.name}.mp4`,
  ];
}
