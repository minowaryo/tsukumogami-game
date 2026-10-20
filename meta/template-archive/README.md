# template-archive/ — テンプレート由来で退避したファイル

2026-10-20、ルールを「人間と AI の役割分担」に合わせて作り直したとき（ADR-0003）に退避した。
**AI はこのフォルダを読み込まない・従わない。** 参考と、元に戻すための控え。

## 移動したもの（このプロジェクトでは使わない）

| ファイル | 理由 |
|---|---|
| `.claude/rules/10-laravel.md` | Laravel 専用 |
| `.claude/rules/15-frontend.md` | Vue 3 + Inertia.js 専用 |
| `.claude/rules/20-mysql.md` | MySQL 専用 |

## 書き換える前の元の版（控え）

`CLAUDE.md`、`AGENTS.md`、`.claude/rules/00-global.md`・`30-testing.md`・`40-security.md`・`60-docs.md`、
`.claude/commands/tdd.md`、`docs/development/ai-workflow.md`、`docs/ai-context/` の4ファイル。

## まだこのプロジェクト向けに直していないもの（使う場面が来たら直す）

- `SETUP.md`、`README.md`、`GLOBAL_CLAUDE.md`（テンプレートの導入手順・説明）
- `docs/product/`（requirements、use-cases、mockups など。Gate 1〜3 用）
- `docs/architecture/`（data-model、authz-authn、overview）、`docs/rcid/`、`docs/security/`
- `docs/development/review-guidelines.md`、`review-checklist.md`、`testing-strategy.md`、`e2e-testing.md`、`coding-standards.md`
- `.claude/commands/`：`review.md`、`generate-mock.md`、`generate-e2e-test.md`、`onboard-existing-codebase.md`
- `.claude/skills/regenerate-traceability/`、`.claude/hooks/`（`domain-boundary-check.sh`、`spec-lint.sh`、`review-score.sh` など Laravel・use-cases 前提のもの）
- `.claude/agents/`（`test-writer.md`、`tdd-implementer.md` は Laravel のテストコマンドを例に挙げている）
