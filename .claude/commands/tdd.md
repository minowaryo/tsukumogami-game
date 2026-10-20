---
disable-model-invocation: true
---

# /tdd — TDD (Red → Green → Refactor) execution command

Run a TDD cycle for the specified feature / UC number.

## Files to read before running

- The Decision A completion criteria for this task (agreed with the user; `docs/development/roles-and-decisions.md`) and the related spec (e.g. `docs/characters/`)
- `.claude/rules/30-testing.md`
- `docs/development/git-workflow.md` (branch, commit, and merge steps; profile in `.claude/rules/70-git.md`)

## Steps

0. **Branch check**: If the current branch is `main`, get onto a branch before Step 1 — `lite` creates it and says so, `standard` proposes a name and waits (`docs/development/git-workflow.md` §0 Profile, §1 Branches)
1. **Red**: Ask the `test-writer` sub-agent to write failing tests (do not let it touch implementation code)
2. **Self-check the tests (replaces the former human Gate 4 — `docs/adr/ADR-0003-ai-led-development-roles.md`)**: Check yourself that the tests fail for the intended reason, that their expected values come from the Decision A completion criteria / spec (not from reading an implementation), and that they cover what the completion criteria require (`.claude/rules/30-testing.md`). Do not wait for the user's approval of the tests. Then save the snapshot and show its one-line result: `bash .claude/hooks/tdd-snapshot.sh record` (copies `tests/` and `docs/product/` into `.git/`; ADR-0016)
3. **Green**: After the self-check, ask the `tdd-implementer` sub-agent for the minimum implementation to make the tests pass. If it stops with `SPEC_CONFLICT`, or after its attempt limit (3 attempts, or the same failure twice), present its report to the user and wait — do not re-invoke it on your own. A spec conflict is resolved by a person; the cycle then restarts from Step 1, and the new self-check replaces the snapshot
4. **Check the goal did not move**: run `bash .claude/hooks/tdd-snapshot.sh verify`. Exit 0 → continue. Exit 2 → `tests/` or `docs/product/` changed after approval: show the printed diff and stop until the user decides (discard the change, or restart from Step 1). Exit 3 → no snapshot: tell the user and stop. When the exit was 0, also run `bash .claude/hooks/fixture-literal-check.sh`: exit 0 → continue; exit 2 → show the printed `FIXTURE_LITERAL` lines as they are (application code compares against a value that only the approved tests contain) and stop until the user decides; exit 3 → tell the user and stop. Show its blocked-attempt lines (or its "No blocked attempts" line) to the user as printed — they come from `logs/audit.jsonl`, so show them even when the implementer's report does not mention any. Then present the execution results (Green confirmation) to the user. In `standard`, suggest **`/commit`** now (Red + Green is one commit; Refactor stays separate). In `lite`, the cycle is committed once after Step 7 (`docs/development/git-workflow.md` §0)
5. **Verify actual behavior**: Recommend the `run` skill to the user so they can launch the app and confirm the feature actually works — bundled skills only run when a human explicitly invokes them, so state the recommendation rather than invoking it yourself (see `.claude/rules/30-testing.md`)
6. **Add E2E tests (only if applicable)**: If the target is a critical user flow in the completion criteria and includes UI changes, read `.claude/commands/generate-e2e-test.md` and follow its steps to add Playwright E2E tests (do not start `/generate-e2e-test` itself — commands run only when a person types them, ADR-0016)
7. **Refactor**: Refactor as needed. After refactoring, always re-run the tests and confirm Green is maintained
8. Summarize the final diff and test results, then suggest **`/commit`** (in `standard`, for the Refactor changes); when the branch is done, **`prepare-merge`** (it decides whether `/review` is needed — `docs/development/git-workflow.md` §6). In `lite`, the user may ask for commit → merge → push in one go (§4)

## Constraints

- Do not skip or reorder the steps above (especially the self-check and snapshot in step 2, and the snapshot check in step 4)
- Run `/tdd` only after Decision A (the user approved what to build and its completion criteria — `docs/development/roles-and-decisions.md`)
- After each phase completes, run the project's test command (recorded in `docs/ai-context/common-commands.md` once the stack is decided) and show the results

## Example

```
/tdd UC-006 Order list filter feature
```
