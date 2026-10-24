const API_BASE = 'https://api.elevenlabs.io';

export function buildRequest(cue, apiKey) {
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is not set. Copy .env.example to .env and add your key.');
  }

  let path;
  let body;
  if (cue.kind === 'sfx') {
    path = '/v1/sound-generation';
    body = {
      text: cue.prompt,
      duration_seconds: cue.duration,
      prompt_influence: cue.prompt_influence,
      model_id: cue.sfx_model,
    };
    if (cue.loop) body.loop = true;
  } else {
    path = '/v1/music';
    body = {
      prompt: cue.prompt,
      music_length_ms: Math.round(cue.duration * 1000),
      force_instrumental: true,
      model_id: cue.music_model,
    };
  }

  return {
    method: 'POST',
    url: `${API_BASE}${path}?output_format=${encodeURIComponent(cue.output_format)}`,
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
