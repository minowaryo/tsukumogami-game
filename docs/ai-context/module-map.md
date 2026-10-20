# module-map.md — フォルダの役割

> ゲーム本体の技術が決まったら、そのフォルダ構成をここに足す。

## いまあるもの

| パス | 役割 | 書く人 |
|---|---|---|
| `PLAN.md` | 今どこまで進んでいて、次に何をするか | AI |
| `docs/decisions.md` | Ryo の決定ログ | AI（Ryo の明言だけ） |
| `docs/original-docs/tsukumogami-game/` | 原案（企画、世界観、キャラ、ロードマップ、市場）。**読み取り専用** | Ryo |
| `docs/characters/` | Character Bible（キャラの見た目・段階・プロンプト・物語の明かし方） | AI（採否は Ryo） |
| `docs/adr/` | 技術・方針の判断の記録 | AI が下書き、Ryo が採択 |
| `docs/development/roles-and-decisions.md` | 役割分担と判断ポイント（ルールの土台） | AI が下書き、Ryo が承認 |
| `docs/development/` | 開発の進め方（Git、AI の使い方など） | AI |
| `docs/ai-context/` | AI が毎回読む要約 | AI |
| `docs/credentials/` | 開発用の認証情報の置き場所の記録（コミットしない） | AI / Ryo |
| `.claude/` | Claude Code のルール・コマンド・スキル・フック | AI（ルールの変更は ADR） |
| `meta/template-archive/` | テンプレート由来で退避したルールと元の版。**読み込まない** | — |
| `meta/adr/` | テンプレート自体の判断の記録（参考） | — |

## これから作るもの（PLAN.md より）

| パス | 役割 |
|---|---|
| `assets/proto/` | AI 生成の試作素材（リリースに使うと決まるまでここ） |
| `prototype/` | 変化デモページ（2D・ブラウザ） |
| （未定） | 画像生成ハーネス（Python ＋ ComfyUI）。ゲーム本体とは分ける |

## テンプレート由来で、まだこのプロジェクト向けに直していないもの

`docs/product/`、`docs/architecture/`、`docs/rcid/`、`docs/security/`、`docs/development/review-guidelines.md` など。
Laravel の Web アプリ前提の内容が残っている。使う場面が来たら直す（`meta/template-archive/README.md`）。
