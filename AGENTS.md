# AGENTS.md

## Project

付喪神 擬人化育成ゲーム（仮題）— a mobile game where cherished everyday objects gain a spirit (tsukumogami) and gradually take human form.
Phase 0: worldview and character design, an image-generation harness (Python + ComfyUI, ADR-0001), and a 2D browser prototype.
The tech stack for the real game is not decided yet.

## Roles (read first)

Development is delegated to AI agents. The human owner (Ryo) decides *what* to build and *whether it is good*.
The full role split, decision points, and stop conditions are in `docs/development/roles-and-decisions.md` (Japanese).

- **Decision A (start)**: before implementing, propose what to build, the completion criteria (in terms the owner can check by using it), what is out of scope, and rough effort/cost. Wait for OK
- **Decision B (check)**: when done, present something the owner can see or touch (screen, video, URL) with verification results
- **Decision C (integrate)**: propose commits/merge; act only on approval (`.claude/rules/70-git.md`)
- After Decision A, proceed without stopping — except when a **stop condition** applies: money, publishing externally, new tool/library/service or policy change, irreversible operations, changing decided worldview/characters/story, license/terms judgments, exceeding the agreed scope, security exceptions

## Required read order

1. `docs/ai-context/project-summary.md`
2. `docs/ai-context/glossary.md`
3. `docs/development/roles-and-decisions.md`
4. `PLAN.md`
5. Task-specific files (see `CLAUDE.md` "Read when relevant")

## Rules

- Do not implement before Decision A
- Record the owner's explicit decisions in `docs/decisions.md`; write your own proposals as "案" (proposal) in the relevant document
- `docs/original-docs/` is read-only — never edit, delete, or create files in it, except its own `README.md`
- AI-generated images/audio stay in `assets/proto/` until the owner decides to release them (ADR-0002)
- All characters must look clearly adult; all-ages content only
- Never post, submit to stores, or configure payments — the owner does that by hand
- Logic gets tests; subjective quality (fun, cute, worldview) is judged by the owner at Decision B (`.claude/rules/30-testing.md`)
- Never put secrets in code, logs, or chat (`.claude/rules/40-security.md`)
- Do not edit unrelated files

## Output expectations

- Put what the owner must decide first, with options and a recommendation
- Back every "done" / "verified" with the actual output (command result, screenshot, video)
- Explain technical terms briefly; skip implementation details irrelevant to the decision

## Prohibited actions

- Implementing before Decision A, or continuing past a stop condition without asking
- Posting, submitting, or configuring payments externally
- Committing secrets or credentials
- Force-pushing, or committing / pushing / merging without explicit approval (`.claude/rules/70-git.md`, `docs/development/git-workflow.md`)
- Editing, deleting, or creating files under `docs/original-docs/` (except its own `README.md`)
