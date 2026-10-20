# CLAUDE.md

## Project

- **Project**: 付喪神 擬人化育成ゲーム（仮題）— 物を大切にすると付喪神が宿り、日用品が少しずつ人の姿になるスマホゲーム
- **Owner**: Ryo（判断・レビュー・仕様を決める人。開発は AI エージェントに任せる）
- **Phase**: Phase 0（世界観の深掘り、キャラ設計、画像生成の基盤、変化デモの試作）
- **Stack**: 未定。Phase 0 はブラウザの 2D 試作（`prototype/`）と、Python＋ComfyUI の画像生成ハーネス（ADR-0001）
- **Original materials**: `docs/original-docs/tsukumogami-game/`（読み取り専用。原案の企画・世界観・キャラ・ロードマップ）

## Roles first

**このプロジェクトのルールの土台は `docs/development/roles-and-decisions.md`（役割分担と判断ポイント）。**
Ryo が判断するのは「判断A：着手」「判断B：確認」「判断C：取り込み」と、AI が止まる8つの条件だけ。
それ以外は AI が進める。

## Read first (every session)

- `docs/ai-context/project-summary.md`
- `docs/ai-context/glossary.md`
- `docs/development/roles-and-decisions.md`
- `PLAN.md`（今どこまで進んでいて、次に何をするか）

## Read when relevant (task-based)

| Task | Read |
|---|---|
| 企画・世界観・キャラの検討 | `docs/original-docs/tsukumogami-game/docs/`（原案）＋ `docs/characters/` ＋ `docs/decisions.md` |
| キャラの画像・プロンプト | `docs/characters/README.md`、`docs/characters/_common.yaml`、ADR-0001 |
| 動画・プロモーション | `PLAN.md` の Phase 1（大方針：世界観が伝わるか） |
| AI 生成素材をリリースに使うか | ADR-0002 |
| 技術の採用・方針の変更 | `docs/adr/`（必要なら新しい ADR を下書きして Ryo に採択してもらう） |
| 実装・テスト | `.claude/rules/30-testing.md` |
| 秘密情報・外部サービス | `.claude/rules/40-security.md`、`docs/credentials/` |
| エラーやライブラリ固有のつまずき | `docs/ai-context/known-pitfalls.md`。原因が分からないバグは `.claude/skills/systematic-debugging/SKILL.md` |
| 「完了した」と報告する前 | `.claude/skills/verification-before-completion/SKILL.md`（実際に実行して確かめてから報告する） |
| Git（ブランチ、コミット、push、マージ） | `.claude/rules/70-git.md` → `docs/development/git-workflow.md` |

## Global rules

- **判断A（完了条件の承認）の前に、実装に入らない**。試作なら数行の提案に「OK」で足りる
- **止まる条件**（お金・外部公開・新しいツール・取り消せない操作・正典の変更・権利・合意範囲の超過・セキュリティ例外）に当たったら、その場で止まって聞く
- Ryo の決定は `docs/decisions.md` に記録する。提案は「案」と明記して各ドキュメントに書く
- `docs/original-docs/` は読み取り専用（編集・削除・新規作成は禁止。ただし同フォルダの `README.md` は編集してよい）
- AI 生成の画像・音声は、リリースに使うと決まるまで `assets/proto/` に置き、本番素材と区別する（ADR-0002）
- キャラは全員、ひと目で大人に見えるデザインにする。全年齢向け（原案）
- 外部への投稿・ストア申請・課金設定は AI が実行しない。Ryo が手で行う
- 設計の意図が変わったら、ドキュメントも同時に更新する

## Detailed rules

- `.claude/rules/00-global.md` — 作業の流れ、判断ポイント、禁止事項
- `.claude/rules/30-testing.md` — テストと検証
- `.claude/rules/40-security.md` — 秘密情報、外部サービス、画像生成の安全面
- `.claude/rules/50-review.md` — レビュー（テンプレート由来。Laravel 向けの観点は該当しないものを飛ばす）
- `.claude/rules/60-docs.md` — ドキュメントの更新
- `.claude/rules/70-git.md` — Git の核となるルール

テンプレート由来で退避したルール（Laravel・MySQL・Vue）と元の版は `meta/template-archive/` にある。読み込まない。
