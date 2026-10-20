# common-commands.md — よく使うコマンド

> ゲーム本体・ハーネスの技術が決まったら、テストや起動のコマンドをここに足す。

## Claude Code の入口（`.claude/commands/` と `.claude/skills/`）

コマンドは人が入力したときだけ動く。スキルは AI が自分で使ってよい。

| 入口 | いつ使う | 起動する人 |
|---|---|---|
| `/adr` | 技術・方針の判断をしたとき。ADR の下書きを作る | Ryo（AI が提案する） |
| `/commit` | コミットするとき。分け方とメッセージを提案し、1回の承認でコミットする（push はしない） | Ryo |
| `/tdd [機能]` | 判断A の後、ロジックを Red → Green → Refactor で作るとき（テストの人間承認はない） | Ryo |
| `/review` | マージ前にレビューが必要なとき（`docs/development/git-workflow.md` §6）。Laravel 向けの観点は該当しないものを飛ばす | Ryo |
| `prepare-merge` | ブランチが終わったとき（「マージして」）。マージ前の確認とメッセージ案 | AI / Ryo |
| `systematic-debugging` | 原因が分からないバグを調べるとき | AI |
| `verification-before-completion` | 「完了した」と報告する前 | AI |
| `grill-me` | あいまいな点を一問ずつ詰めるとき | AI |

テンプレート由来の `/generate-mock`、`/generate-e2e-test`、`/onboard-existing-codebase`、`regenerate-traceability` は、
use-cases.md や Laravel を前提にしているので、今は使わない。

## Character Bible の検証

```bash
# Check that every character YAML parses and every stage has levels 0-4
python -c "import yaml,glob; [print(f, [s['level'] for s in yaml.safe_load(open(f,encoding='utf-8'))['stages']]) for f in sorted(glob.glob('docs/characters/[!_]*.yaml'))]"
```

## Git

詰まったとき（コンフリクト、間違えたコミットなど）は `docs/development/git-troubleshooting.md`。

```bash
git status
git diff
git log --oneline -10
```

## Playwright MCP（ブラウザ操作の自動化、任意）

`.mcp.json` に定義済み。試作ページの動作確認やスクリーンショットに使える。ローカルの環境だけで使う。
