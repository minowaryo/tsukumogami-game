import { parse, parseDocument } from 'yaml';

// Duration limits in seconds, from the ElevenLabs API (sound-generation: 0.5-30, music: 3-600)
const DURATION_LIMITS = { sfx: [0.5, 30], music: [3, 600] };

function validateCue(id, cue) {
  const limits = DURATION_LIMITS[cue?.kind];
  if (!limits) {
    throw new Error(`cue ${id}: kind must be one of ${Object.keys(DURATION_LIMITS).join(', ')}`);
  }
  if (typeof cue.prompt !== 'string' || !cue.prompt.trim()) {
    throw new Error(`cue ${id}: prompt is required`);
  }
  const [min, max] = limits;
  if (typeof cue.duration !== 'number' || cue.duration < min || cue.duration > max) {
    throw new Error(`cue ${id}: duration must be ${min}-${max} s for kind ${cue.kind}`);
  }
}

export function parseCues(text) {
  const data = parse(text) ?? {};
  const cues = data.cues ?? {};
  for (const [id, cue] of Object.entries(cues)) validateCue(id, cue);
  return { defaults: data.defaults ?? {}, cues };
}

export function getCue(registry, id) {
  const cue = registry.cues[id];
  if (!cue) {
    throw new Error(`Unknown cue "${id}". Known cues: ${Object.keys(registry.cues).join(', ')}`);
  }
  return { id, ...registry.defaults, ...cue };
}

export function takeBaseName(date, index) {
  const p = (n) => String(n).padStart(2, '0');
  const day = `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}`;
  const time = `${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
  return `${day}-${time}-${index}`;
}

export function withApproval(text, id, approval) {
  const doc = parseDocument(text);
  if (!doc.hasIn(['cues', id])) throw new Error(`Unknown cue "${id}"`);
  doc.setIn(['cues', id, 'approved'], doc.createNode(approval));
  return doc.toString({ lineWidth: 0 });
}
