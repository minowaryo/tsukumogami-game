# known-pitfalls.md — Known Pitfalls

> This file is not loaded every time. AI consults it when debugging errors or implementing a similar library/feature.
> Whenever a new pitfall is resolved, append it below (do not refactor this file or delete past records).

## Recording Rules

- One entry = a level-3 heading (`###`) + exactly 3 lines (symptom / cause / fix) — no long-form narrative
- State the library name and version when known (many bugs are version-dependent)
- Do not record generic coding conventions here (reflect those in `.claude/rules/` instead)

## Template

```markdown
### [Library/feature] — [one-line description of the symptom]

- Symptom: [what happened]
- Cause: [why it happened]
- Fix: [what resolved it. Reference the relevant file as `path:line` if applicable]
```

---

## Records

### ComfyUI 0.39.0 — 同じ設定を2回投入すると2回目が約1秒で終わり、再現性を確かめられない

- Symptom: 同じワークフローを API で2回投入すると、2回目は計算せず前回の結果が返る
- Cause: ComfyUI は入力が同じノードの結果をキャッシュして使い回す
- Fix: 2回目の前に `POST /free` に `{"unload_models": true, "free_memory": true}` を送ってキャッシュを消す

### ComfyUI 0.39.0 / NVIDIA 617.42 / MSI Pulse GL66 — モデルの読み込み中に GPU が落ちる（"GPU is lost"）

- Symptom: SDXL のモデルを GPU に読み込む途中で応答が止まり、nvidia-smi が "GPU is lost. Reboot the system" を返す
- Cause: 断定できていないが、MSI Center の User Scenario が省電力系（エコサイレント）だった可能性が高い（バランスに変えた後、計6回の生成で再発なし。最高 75℃、瞬間最大 約155W）
- Fix: 画像生成の前に MSI Center を「バランス」以上にする。ComfyUI は `--reserve-vram 1` を付けて起動する。落ちたら PC の再起動が必要

### ComfyUI 0.39.0 — 同じ seed の画像なのに PNG ファイルのハッシュが一致しない

- Symptom: 絵が同じでも、保存された PNG のファイル全体の SHA-256 が毎回違う
- Cause: PNG に生成時のワークフロー（保存名を含む）がメタデータとして埋め込まれる
- Fix: ファイルではなく画素を比べる（Pillow で `Image.open(p).convert('RGB').tobytes()` のハッシュ）
