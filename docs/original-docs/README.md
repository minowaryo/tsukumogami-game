# original-docs — Primary Source Materials

This directory is for primary source materials brought in by humans.

## ⚠️ Notes for AI

- Files in this directory are **read-only**
- **Editing, deleting, and creating new files are prohibited**
- Exception: this `README.md` file itself (the directory's own index, not a source material) may be edited by AI — e.g. to keep the File List below current
- Use this as the primary information source when creating `docs/product/requirements.md` or `use-cases.md`
- **Existing-codebase adoption**: the "primary source" guidance above assumes a new
  project, where nothing else yet exists to compare against. When adopting this harness
  onto a project with running code (`SETUP.md`'s Existing-Codebase Path), the code is the
  source of truth for what currently happens; files here become reference material for
  cross-checking only. Either way, neither the code nor a document here is ever treated
  as unilaterally correct when they disagree — that is (and always was) governed by
  `.claude/rules/00-global.md`'s "User-Facing Behavior Changes Always Require Approval":
  a mismatch is a finding to report, resolved by a human, never resolved by silently
  favoring one side.

## What May Be Placed Here

- Requirements documents (Word, PDF, Excel, images, etc.)
- Handwritten notes and meeting notes
- Screen sketches, wireframes, Figma exports
- Meeting minutes, email threads, etc.

## File List

| File Name | Content | Date Added |
|---|---|---|
| `tsukumogami-game.zip` | Original archive of the Phase 0 planning docs (kept as-is) | 2026-10-19 |
| `tsukumogami-game/` | Extracted contents of the zip above: owner handoff (`CLAUDE.md`), concept / research / production / roadmap / decisions / world / characters / marketing / market strategy (`docs/01`–`09`) | 2026-10-19 |
| `Youtube_idea` | Handoff memo (Markdown, no extension) for a separate English YouTube channel concept: positioning, content pillars, avatar and AI voice strategy, next steps | 2026-10-24 |
| `サングラスの柴犬、夏のアロハスタイル.png` | Shiba Inu illustration (sunglasses, aloha shirt): avatar candidate for the YouTube concept above | 2026-10-24 |

## Operation Rules

- As the volume grows, feel free to create subdirectories for organization
- Use descriptive file names that indicate the content (e.g. `2024-04-kickoff-requirements.pdf`) — this is the primary way to identify a file's purpose; keeping the File List table above in sync is optional, not required, since nothing else in the repo depends on it staying current
