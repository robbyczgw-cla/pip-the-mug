# Public release checklist

Everything that has to be true before the repository goes public and the Devpost entry is submitted.

Deadline: **3 September 2026, 1:00pm PDT.** Judging runs **4 September to 21 September 2026**. Rules: https://webmcp.devpost.com/rules

> **Do not change the repository, the live site, or the Devpost entry between 4 and 21 September 2026.** Judges open the live URL and the repo during that window. A deploy that breaks the demo, a force-push, a visibility change, or an edited submission mid-judging can cost the entry. Freeze everything on 3 September after submitting. If something is broken enough to need a fix during judging, decide deliberately and note what changed and when.

## Cleared, no action needed

Do not reopen these. The basis for each is written up in `docs/asset-provenance.md`.

- **`public/sprites/*.png`, the 23 PixelLab pixflux PNGs.** The owner retrieved the PixelLab terms on 2026-08-28 from https://www.pixellab.ai/termsofservice, page last updated 2025-11-23. Clause 1.3 gives the user the copyrights and commercial use without permission. Clause 3.3 keeps ownership with the user and allows use, modification, and distribution for any purpose except training other models without PixelLab's explicit permission. The owner records that no third-party protected reference images or trademarks were used as inputs. The PixelLab API token was never committed. The sprites are not MIT. They are owned outputs carried under those terms, so do not relabel them.
- **`public/logo.png`.** OpenAI ImageGen created the original 1254x1254 mug illustration through Codex on 2026-08-29 from a text-only prompt with no reference image, logo, or trademark. SHA-256 `072ba2e43446c4508aa026c87fd6e7ed5c81b07afb44e1e8afe83705d641ef89`. The owner reviewed and accepted it. OpenAI's EU Terms of Use assign OpenAI's interest in the output to the user to the extent permitted by applicable law. Full prompt and terms are in `docs/asset-provenance.md`.
- **Video narration.** ElevenLabs generated the English narration through its Text to Speech API on the owner's Starter paid plan. It uses voice Brian and model `eleven_multilingual_v2`. Both source and timed files contain `-paid` and stay outside the repository. The YouTube description carries the line "Narration created with ElevenLabs."
- **Video soundtrack.** The final cut uses `pip-the-mug-demo-underscore-paid.mp3`, generated through the ElevenLabs Music API after the owner upgraded the account to Starter. The processed track has SHA-256 `105d666848c93890712c88fa78ab8253e20526b2d7ee44b27908efd59b1621c7`; the final MP4 has SHA-256 `fd1dc99e916c05f26c5d4dea949820a0d5609531c51a25b6937976d895cc4574`. Full details and terms are in `docs/asset-provenance.md`. No Free-plan ElevenLabs file is used in the cut.
- **Homepage loop.** Not used. The app loads no music file, `public/audio/` does not exist, and the public release keeps it that way.
- **Screenshots.** The three 1440 by 900 files in `docs/demo/` come from one verified WebMCP run and show the reset seed, SEP-1 with an Agent row, and the confirmed separation with a Human row.

## Repository

- [ ] Repository is public on GitHub.
- [x] `LICENSE` is present, unchanged, and MIT. Copyright (c) 2026 PIP the Mug contributors.
- [ ] The GitHub About box shows **MIT** at the top of the repository page. GitHub detects this from `LICENSE`; check it after publishing rather than assuming.
- [x] Full source is in the repo: `src/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`.
- [x] Assets are in the repo: `public/favicon.svg`, `public/logo.png`, `public/sprites/`.
- [ ] The OpenAI ImageGen logo appears in the README, in-app header, deployed site, Devpost project image, and any newly captured screenshots. The README, in-app header, deployed site, and current screenshots are verified. Check the Devpost project image before submitting.
- [x] Instructions are in the repo: `README.md` plus `docs/architecture.md`, `docs/demo-protocol.md`, `docs/asset-provenance.md`.
- [x] `VIDEO.md` is still in `.gitignore` and is not committed. It must not appear in the public repo and must not be linked from any public doc.
- [x] No private preview hostnames or internal URLs anywhere in the repo, the README, the docs, the screenshots, or the video. Every link a reader can follow is a public one. Localhost references remain only in tests and local Vite configuration.
- [x] No credentials, tokens, or `.env` files in the working tree or in the git history. The PixelLab API token was never committed; the current tree and full patch history were scanned again on 2026-08-29.
- [x] `pnpm build` passes (`tsc --noEmit` clean, static build into `dist/`). Verified 2026-08-29.
- [x] `pnpm test` passes. Verified 24 of 24 on 2026-08-29.
- [x] `dist/` is not committed.
- [x] No video file is committed. The submission video lives on YouTube and stays out of the repository, and `VIDEO.md` stays gitignored and unlinked from every public doc.
- [x] The audio rules in `.gitignore` still hold and nothing slipped past them. They ignore `*.mp3`, `*.wav`, `*.m4a`, and `*.ogg`, then re-include exactly two paths: `!public/audio/pip-the-mug-homepage-loop-paid.mp3` and `!public/audio/pip-the-mug-homepage-loop-paid.ogg`. That is a two-path exception, not a blanket `-paid` un-ignore, and it should not be widened into one. Every other audio file stays ignored. Video extensions are not in `.gitignore`, so they must not be committed; the submission video lives on YouTube. `git ls-files` returned no audio or video files on 2026-08-29.
- [x] Screenshots in `docs/demo/` match the current build and show WebMCP on. The three 1440 by 900 captures use the current logo and show the reset seed, SEP-1, and the Human confirmation result.
- [ ] The commit that will be submitted is recorded. Note the full SHA here, and tag it (for example `submission-2026-09-03`) so the judged state is identifiable later: `SUBMITTED_COMMIT_SHA`.

## Placeholders

The release URLs below are now written into `README.md`, `docs/demo-protocol.md`, and `docs/devpost-submission.md`.

- [x] Live demo: https://pip-the-mug.vercel.app/
- [x] Repository: https://github.com/robbyczgw-cla/pip-the-mug
- [x] Video: https://youtu.be/Hvzt2VUO43U
- [x] A full-repository search on 2026-08-29 found none of the three placeholder strings.

## Live demo

- [x] Deployed to Vercel as a static build with no functions. Production deployment `dpl_7ttrhBZ2dJjABVvWy86JXchSnBXX` was ready on 2026-08-29.
- [ ] The deployed build was produced from the exact commit being submitted. Check the Vercel deployment's source commit against `SUBMITTED_COMMIT_SHA`, and redeploy if they differ. A live site ahead of or behind the public repo is the easiest way to fail a code review.
- [x] Served over https. The production alias is https://pip-the-mug.vercel.app/.
- [x] `vercel.json` SPA rewrite works: `/`, `/demo`, and `/qa` returned HTTP 200 on 2026-08-29.
- [x] `Origin-Agent-Cluster: ?1` is present on responses. Verified on the deployed URL on 2026-08-29.
- [x] The live URL opens in ChatGPT's in-app browser and the banner reads WebMCP on. Verified on 2026-08-29.
- [ ] The live URL opens in Google Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled, and the banner reads WebMCP on.
- [x] The live URL is not behind a login, a preview-protection setting, or an allowlist. Anonymous HTTP requests returned the app on 2026-08-29.

## Demo verification

Run these against the deployed URL, not localhost, with a real agent. The full script with expected values is in `docs/demo-protocol.md`.

- [ ] **Demo seed loads.** `/`, `/demo`, and `?demo=1` all open the 8-person demo desk: `monitor`, `mug`, `pen`, `plant`, `usb-hub`, `charger`, `webcam-cover`, `stress-ball`. Plant is `on_pip`, Mug's last rating is 2, Pen's is 5.
- [ ] **Reset company works.** Clicking it rebuilds the demo seed, restores the three SYSTEM rows, and leaves the QA desk under `pip-the-mug:v2:qa` untouched.
- [x] **Nine tools are discovered.** On 2026-08-29 the public `/demo` access strip and ChatGPT in-app browser both listed all nine by name: `list_staff`, `get_personnel_file`, `get_org_chart`, `write_review`, `put_on_pip`, `resolve_pip`, `promote`, `relocate`, `terminate`.
- [ ] **SEP-1 human handoff works.** `terminate` on Mug returns `ok: false` with `status: "requires_user_action"` and a `requestId`, Form SEP-1 opens on the page, the agent stops and asks, Mug stays employed, and clicking Confirm termination moves Mug to the Donated / Sink box and the alumni wall.
- [ ] **Duplicate termination requests are refused.** With SEP-1 open, a second `terminate` call returns the same `requestId`, opens no second dialog, and files no second log row.
- [ ] **The audit trail separates the actors.** After the run the activity log shows the pending request as **Agent**, the separation as **Human**, the PIP as **Agent**, and the three seeded rows as **SYSTEM**.

## Video

- [x] Under three minutes. Final export is 113.642 seconds.
- [ ] Uploaded to YouTube and set to public. Not unlisted, not private.
- [x] Soundtrack resolved and recorded in `docs/asset-provenance.md`.
- [x] Every ElevenLabs audio file used in the final cut has `-paid` in its filename. The final narration source, timed narration, and soundtrack were checked before export; their provenance and hashes are recorded in `docs/asset-provenance.md`.
- [ ] Confirmed that no non-`-paid` ElevenLabs file was published, committed, uploaded, or linked anywhere: repo, live site, YouTube, or Devpost.
- [ ] The description carries "Narration created with ElevenLabs." The current logo was created with OpenAI ImageGen.
- [ ] No third-party trademarks or logos appear on screen. Tool names stay in prose.
- [ ] Shows the live demo, the tool list, the `requires_user_action` result, the human clicking Confirm termination, and the Agent versus Human rows in the activity log.
- [ ] Playable without being signed in. Check in a private window.

## Devpost entry

- [ ] Copy from `docs/devpost-submission.md` is pasted into the matching fields.
- [ ] Live demo URL, repository URL, and video URL are all filled in and all resolve.
- [ ] Project image uploaded.
- [ ] Repository link points at the public repo and opens without a login.
- [ ] The repository link points at the submitted commit's state. If you tagged it, say so in the submission text.
- [ ] Submitted before 3 September 2026, 1:00pm PDT. Do not aim for the last hour.

## After submitting

- [ ] Confirm the repo, the live URL, and the video all open in a private window with no session.
- [ ] Record the submitted commit SHA, the tag, the live URL, the video URL, and the submission timestamp somewhere outside this repo, so the judged state stays identifiable if `main` moves later.
- [ ] **Freeze.** No pushes, no deploys, no visibility changes, no history rewrites, no Devpost edits until 22 September 2026.
