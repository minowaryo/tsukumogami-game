# 60-docs.md — ドキュメントの更新

## 変更と更新するドキュメントの対応

| 変更 | 更新するドキュメント |
|---|---|
| Ryo の決定 | `docs/decisions.md` |
| 作業の進み具合、次にやること | `PLAN.md` |
| キャラの設定・見た目・段階・プロンプト | `docs/characters/` の該当ファイル（共通部分は `_common.yaml`） |
| 新しい技術・ツール・サービスの採用、方針の変更 | `docs/adr/ADR-XXXX-xxx.md`（新規作成。`/adr` のテンプレート） |
| 役割分担・判断ポイント・止まる条件の変更 | `docs/development/roles-and-decisions.md` ＋ `CLAUDE.md` ＋ `.claude/rules/00-global.md` ＋ `AGENTS.md`（4つをそろえる）＋ ADR |
| 用語の追加 | `docs/ai-context/glossary.md` |
| フォルダ・モジュールの追加 | `docs/ai-context/module-map.md` |
| よく使うコマンドの追加 | `docs/ai-context/common-commands.md` |
| プロジェクトの概要・フェーズ・技術の変化 | `docs/ai-context/project-summary.md` |
| ライブラリ固有のつまずきを解決した | `docs/ai-context/known-pitfalls.md` |
| Git の運用の変更 | `docs/development/git-workflow.md`（＋ 常に読み込む核の部分だけ `.claude/rules/70-git.md`） |
| 開発用の認証情報の置き場所 | `docs/credentials/README.md`（実際の値は書かない） |
| 原案の資料を追加した | `docs/original-docs/README.md` のファイル一覧 |

## 原則

1. ドキュメントは、関係するコード・設定の変更と同じコミットで更新する
2. 仕様の変更は、コードより先にドキュメントに書く
3. ADR には「何を決めたか」だけでなく「なぜそう決めたか」を必ず書く
4. `docs/ai-context/` は短く正確に保つ（AI が毎回読む要約）
5. AI の提案は「案」と明記する。Ryo の決定と混ぜない

## ADR を書くとき

- 新しいライブラリ・フレームワーク・ツール・有料サービスを採用する
- 既存のものを変える・やめる
- 作りの方針を変える
- セキュリティの方針を変える
- AI 開発の方針（役割分担を含む）を変える
- 検討した結果「今は採用しない」と決めた（`/adr` の「Not Adopted」の書き方）

ADR は AI が下書きし、Ryo が採択する。テンプレートは `.claude/commands/adr.md`。

## PLAN.md の大きさ

- `PLAN.md` は 300 行未満に保つ（250 行を超えたら古い部分の退避を考える）
- 退避先は `docs/history/plan-archive.md`（なければ作る）。手順は `docs/development/plan-archiving.md`
