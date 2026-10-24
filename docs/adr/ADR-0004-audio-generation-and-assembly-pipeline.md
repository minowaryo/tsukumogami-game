# ADR-0004: 音声は ElevenLabs で生成し、動画は ffmpeg で組み立てる

## Status
Accepted（Ryo、2026-10-21）

- 2026-10-24 改訂（Ryo 決定）：リリースでの扱いを ADR-0002 にそろえた（出来が良ければ AI 生成の音声もそのまま使う）。
  BGM は後のフェーズに回し、最初に生成するのは効果音だけにした

## Date
2026-10-21

## Context

- ロードマップの Phase 1 は、縦長 15 秒の変化動画（物に顔が出て、人の姿になる）を X / TikTok / YouTube Shorts /
  Instagram Reels に出して反応を見ること。原案では BGM・効果音・字幕を CapCut で手作業で付ける予定だった
- 同じ作業は毎週（開発ログの動画）繰り返し、ブラウザの試作でも同じ音が要る。だから音声の作業を開発環境の中で
  再現できるようにしたい
- 制約
  - 個人・兼業の開発。Ryo は判断とレビューをし、ツールは Claude Code が書いて動かす
  - Windows ＋ PowerShell。Node 24 は入っている。ffmpeg はシステムに入っていない。
    PC は他のプロジェクトと共用なので、全体へのインストールや常駐は不可
  - 音の方針は効果音が中心（効果音 7 割・音楽 3 割の目安。`docs/audio/README.md`）

## Decision

1. 音楽と効果音は、どちらも **ElevenLabs**（Music API と Sound Effects API）の有料プランで生成する。
   API キーは 1 つで、`.env` の `ELEVENLABS_API_KEY` に置く
   - **最初に生成するのは効果音だけ**。BGM（`music.*` のキュー）は後のフェーズで生成する（2026-10-24 Ryo 決定。
     Phase 1 の大方針「BGM は後回し」に合わせる）
2. すべてのキューを `assets/proto/audio/cues.yaml` に記録する（プロンプト、長さ、選んだテイク、ツール、ライセンス、日付）。
   生成した候補は `takes/`（Git 管理外）に置き、承認したテイクを WAV のマスターとしてコミットする
3. 動画は **ffmpeg** で組み立てる。Node のスクリプトが動画の仕様ファイル（`videos/*.yaml`：元の映像、キューの位置、字幕ファイル）を
   読み、1 回で書き出す
4. ツールは `tools/`（Node、ESM）に置き、専用の `package.json` を持つ。開発用のツールで、ゲームには含めない
5. **リリースでの扱いは ADR-0002 に従う**：AI 生成の音声も、出来が良ければそのままリリースに使う（2026-10-24 Ryo 決定）。
   ボイス（声）は ADR-0002 と同じく対象外

## Rationale

- ElevenLabs は、音楽と効果音の両方を 1 つの API で扱える唯一の候補で、オルゴールやピアノのモチーフの旋律の質も良い
- ffmpeg は単体のプログラムで Windows でそのまま動き、BGM・ずらした効果音・日英の焼き込み字幕を 1 回のコマンドで合成できる。
  毎週同じ型で作る動画にはこれで足りる

### Rejected Alternatives
- **Stable Audio（API）**：商用ライセンスが最も明確（売上 100 万ドル未満は無料）。ただし感情のある旋律が弱く、
  効果音は別のサービスが要る。ElevenLabs の規約や品質が合わなくなったときの代わりとして残す
- **Suno / Udio**：安定した公開 API がない。歌もの中心。大手レーベルとの訴訟が続いている
- **AIVA、Mubert、Soundraw、Beatoven.ai**：API が不明確、またはゲーム用途では高い
- **DOVA-SYNDROME だけ**：無料で人が作った曲だが、探すのが手作業でスクリプトにできない。音楽の手作業の代わりとして残す
- **Remotion**：コードで動画を作れるのは魅力だが、React のビルドと、会社の規模で有料になるライセンスが増える。
  ffmpeg のコマンド 1 つで足りる
- **CapCut の手作業だけ**：1 本なら十分だが、毎週繰り返すうえ、ブラウザの試作と音を共有できない

## Consequences

### Benefits
- キューや字幕を変えたあとの動画の書き出しが、コマンド 1 つで済む
- 同じ WAV のマスターを、動画とブラウザの試作（OGG / MP3 に変換）の両方で使える
- 生成したすべての音に、プロンプト・ツール・ライセンスが記録される。Steam の AI 申告や、
  リリースに使うかどうかの判断（ADR-0002）に必要になる

### Drawbacks / Risks
- 月額の費用（約 6〜22 ドル）がかかり、ElevenLabs の API の安定性と規約に依存する
- ElevenLabs Music の出力を市販のゲームに入れるには、Enterprise 契約が要る可能性がある。
  AI 生成の BGM をリリースに使う場合は、判断の前に最新の規約を確かめる（ライセンスの判断なので Ryo に聞く）
- AI 生成の音楽でも YouTube の Content ID に引っかかることがある。プロンプトに実在のアーティスト名や曲名を書かない
- AI 生成の音声は著作物として保護されにくい（ADR-0002 の著作権のリスクと同じ）
- ffmpeg は `tools/node_modules` の中の npm パッケージ `ffmpeg-static` から使う（約 81 MB、libass 入りの gyan.dev 版。
  日本語の字幕は確認済み）。システムへのインストールも PATH の変更もないので、同じ PC の他のプロジェクトに影響しない

## Related
- ADR-0002（AI 生成素材をリリースに使うかどうか）
- `docs/audio/README.md`（音の方針、キューシート、権利の扱い）
- `PLAN.md`（Phase 1 の「音声と動画の組み立て」）
- `docs/original-docs/tsukumogami-game/docs/04_roadmap.md`（Phase 1、15 秒動画）
- `docs/original-docs/tsukumogami-game/docs/03_production.md`（権利、AI 素材の扱い）
