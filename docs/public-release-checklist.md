# Public release checklist

Everything that has to be true before the repository goes public and the Devpost entry is submitted.

Deadline: **3 September 2026, 1:00pm PDT.** Judging runs **4 September to 21 September 2026**. Rules: https://webmcp.devpost.com/rules

> **Do not change the repository, the live site, or the Devpost entry between 4 and 21 September 2026.** Judges open the live URL and the repo during that window. A deploy that breaks the demo, a force-push, a visibility change, or an edited submission mid-judging can cost the entry. Freeze everything on 3 September after submitting. If something is broken enough to need a fix during judging, decide deliberately and note what changed and when.

## Cleared, no action needed

Do not reopen these. The basis for each is written up in `docs/asset-provenance.md`.

- **`public/sprites/*.png`, the 23 PixelLab pixflux PNGs.** The owner retrieved the PixelLab terms on 2026-08-28 from https://www.pixellab.ai/termsofservice, page last updated 2025-11-23. Clause 1.3 gives the user the copyrights and commercial use without permission. Clause 3.3 keeps ownership with the user and allows use, modification, and distribution for any purpose except training other models without PixelLab's explicit permission. The owner records that no third-party protected reference images or trademarks were used as inputs. The PixelLab API token was never committed. The sprites are not MIT. They are owned outputs carried under those terms, so do not relabel them.
- **`public/logo.jpg`.** Grok Imagine generated the 1024x1024 mug illustration via `image_gen` on 2026-08-27 at 12:10 CEST, from a text prompt with no reference image: "cream ceramic mug, stale coffee, crooked yellow sticky note, walnut desk, thick ink outlines, no letters". Commit `550135a` added that first file. On 2026-08-28 an `image_edit` wrote PIP on the sticky note, and that is the file on disk. SHA-256 `16360354dd26e020252a89b25a9b0970db5f23466c24fd9bcc2ddbd6cb88938f`. The JPEG carries a C2PA manifest naming Grok Imagine as the software agent. xAI permits commercial use of generated outputs and the owner owns this one, under https://x.ai/legal/terms-of-service. Included in the repo under MIT to the extent applicable, and do not shorten that to "the logo is MIT". Credit it as "Created with Grok." in text, with no xAI or Grok mark.
- **Video narration.** English narration created with Grok using xAI TTS, voice Rigel. Script written for this project. The file stays out of the repository with the rest of the video. The YouTube description carries the line "Narration created with Grok", and no xAI or Grok logo goes anywhere.

## Blocking: open items

- [ ] **Owner transfer of three files from the Mac.** They are not on this host. Do not go looking for them here.
  ```
  /Users/robby/Documents/Codex/2026-08-27/ff/outputs/pip-the-mug-homepage-loop-paid.mp3
  /Users/robby/Documents/Codex/2026-08-27/ff/outputs/pip-the-mug-homepage-loop-paid.ogg
  /Users/robby/Documents/Codex/2026-08-27/ff/outputs/pip-the-mug-elevenlabs-music-provenance-paid.json
  ```
  The two audio files go to `public/audio/` at the exact gitignore exception paths, and only if the public demo loads the loop. The JSON is a provenance record, not a public homepage asset, so keep it out of `public/`.
- [ ] **Screenshot replacement, after the transfer.** The `work/demo7/` captures are not on this host yet. Once they are, replace the four temporary frames with three: `00-seed.png` becomes the reset demo seed with nine tools, `05-sep1.png` becomes Form SEP-1 raised by an agent action, and `06-mug-alumni.png` becomes the confirmed termination with the Human audit row. Delete `sep1-before.png`, and update the captions in `README.md` and `docs/devpost-submission.md` in the same pass. Do not recapture these by hand.
- [ ] **Homepage loop wiring and provenance, if the demo will load it.** Today it does not: `public/audio/` does not exist, `src/lib/audio.ts` synthesizes the paper-shuffle cue at runtime, and no source file references an `.mp3` or `.ogg`. Decide whether the public demo loads the loop. If yes, place the two transferred files at the gitignore exception paths and fill in the homepage loop provenance row in `docs/asset-provenance.md` from `pip-the-mug-elevenlabs-music-provenance-paid.json`. If no, the homepage keeps no music file and this item closes as "not used".
- [ ] **Video soundtrack for the YouTube cut.** The owner has not recorded which track the cut uses. It could be the homepage loop, another paid ElevenLabs file that stays off-repo, or no music. Do not assume the video and the homepage share a track. Nobody has said they do. **Any ElevenLabs audio in the cut falls under the `-paid` rule.** Only a file whose name contains `-paid` may be used in anything public. An ElevenLabs file without it is ineligible, and a free-plan track stays unsafe even when credited, because attribution is a condition on use rather than a grant of commercial rights. Renaming an old free-plan file does not fix it. Record the plan, date, and terms in `docs/asset-provenance.md`. A non-ElevenLabs choice, an original composition or a CC0 track, is outside the naming rule and still needs its source and terms recorded.

## Repository

- [ ] Repository is public on GitHub.
- [ ] `LICENSE` is present, unchanged, and MIT. Copyright (c) 2026 PIP the Mug contributors.
- [ ] The GitHub About box shows **MIT** at the top of the repository page. GitHub detects this from `LICENSE`; check it after publishing rather than assuming.
- [ ] Full source is in the repo: `src/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`.
- [ ] Assets are in the repo: `public/favicon.svg`, `public/logo.jpg`, `public/sprites/`.
- [ ] Every surface that publishes the logo carries the text attribution "Created with Grok." and no xAI or Grok mark. Check the README under the image, the in-app header brand mark, the compact credits line on the live site, the Devpost project image and required-media disclosure, and the YouTube description only if the logo appears in the video or as the thumbnail.
- [ ] Instructions are in the repo: `README.md` plus `docs/architecture.md`, `docs/demo-protocol.md`, `docs/asset-provenance.md`.
- [ ] `VIDEO.md` is still in `.gitignore` and is not committed. It must not appear in the public repo and must not be linked from any public doc.
- [ ] No private preview hostnames or internal URLs anywhere in the repo, the README, the docs, the screenshots, or the video. Every link a reader can follow is a public one.
- [ ] No credentials, tokens, or `.env` files in the working tree or in the git history. The PixelLab API token was never committed; confirm that still holds with a scan of the history.
- [ ] `pnpm build` passes (`tsc --noEmit` clean, static build into `dist/`).
- [ ] `pnpm test` passes.
- [ ] `dist/` is not committed.
- [ ] No video file is committed. The submission video lives on YouTube and stays out of the repository, and `VIDEO.md` stays gitignored and unlinked from every public doc.
- [ ] The audio rules in `.gitignore` still hold and nothing slipped past them. They ignore `*.mp3`, `*.wav`, `*.m4a`, and `*.ogg`, then re-include exactly two paths: `!public/audio/pip-the-mug-homepage-loop-paid.mp3` and `!public/audio/pip-the-mug-homepage-loop-paid.ogg`. That is a two-path exception, not a blanket `-paid` un-ignore, and it should not be widened into one. Every other audio file stays ignored. Video extensions are not in `.gitignore`, so they must not be committed; the submission video lives on YouTube. Run `git ls-files | grep -iE '\.(mp3|wav|m4a|ogg|flac|aac|mp4|mov|webm)$'` and confirm the only hits are those two homepage-loop paths, if they are here at all. Git will accept a free-plan track renamed to one of them, so the provenance record is the check, not the filter.
- [ ] Screenshots in `docs/demo/` match the current build and show WebMCP on. The four frames on disk today are temporary: they were captured without WebMCP, so the banner reads "No WebMCP. Manual mode still works.", the access strip reads "9 tools manual only", and every activity row reads HUMAN. They show manual parity, not the Agent versus Human split the submission argues for, and no caption claims otherwise. The replacement is the three-image `work/demo7/` set, tracked as a blocking item above. Do not recapture by hand.
- [ ] The commit that will be submitted is recorded. Note the full SHA here, and tag it (for example `submission-2026-09-03`) so the judged state is identifiable later: `SUBMITTED_COMMIT_SHA`.

## Placeholders

Replace every one with the real URL before submitting. They appear in `README.md`, `docs/demo-protocol.md`, and `docs/devpost-submission.md`.

- [ ] `LIVE_DEMO_URL`
- [ ] `PUBLIC_REPO_URL`
- [ ] `YOUTUBE_URL`
- [ ] Grep the whole repo for `LIVE_DEMO_URL`, `PUBLIC_REPO_URL`, and `YOUTUBE_URL` afterwards to confirm none are left.

## Live demo

- [ ] Deployed to Vercel as a static build with no functions.
- [ ] The deployed build was produced from the exact commit being submitted. Check the Vercel deployment's source commit against `SUBMITTED_COMMIT_SHA`, and redeploy if they differ. A live site ahead of or behind the public repo is the easiest way to fail a code review.
- [ ] Served over https.
- [ ] `vercel.json` SPA rewrite works: `/`, `/demo`, and `/qa` all load the app rather than 404.
- [ ] `Origin-Agent-Cluster: ?1` is present on responses. Check the response headers on the deployed URL, not just the config file.
- [ ] The live URL opens in ChatGPT's in-app browser and the banner reads WebMCP on.
- [ ] The live URL opens in Google Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled, and the banner reads WebMCP on.
- [ ] The live URL is not behind a login, a preview-protection setting, or an allowlist. Test it from a browser with no session.

## Demo verification

Run these against the deployed URL, not localhost, with a real agent. The full script with expected values is in `docs/demo-protocol.md`.

- [ ] **Demo seed loads.** `/`, `/demo`, and `?demo=1` all open the 8-person demo desk: `monitor`, `mug`, `pen`, `plant`, `usb-hub`, `charger`, `webcam-cover`, `stress-ball`. Plant is `on_pip`, Mug's last rating is 2, Pen's is 5.
- [ ] **Reset company works.** Clicking it rebuilds the demo seed, restores the three SYSTEM rows, and leaves the QA desk under `pip-the-mug:v2:qa` untouched.
- [ ] **Nine tools are discovered.** The access strip reads 9 tools on a freshly reset demo seed, and the agent's own client lists all nine by name: `list_staff`, `get_personnel_file`, `get_org_chart`, `write_review`, `put_on_pip`, `resolve_pip`, `promote`, `relocate`, `terminate`.
- [ ] **SEP-1 human handoff works.** `terminate` on Mug returns `ok: false` with `status: "requires_user_action"` and a `requestId`, Form SEP-1 opens on the page, the agent stops and asks, Mug stays employed, and clicking Confirm termination moves Mug to the Donated / Sink box and the alumni wall.
- [ ] **Duplicate termination requests are refused.** With SEP-1 open, a second `terminate` call returns the same `requestId`, opens no second dialog, and files no second log row.
- [ ] **The audit trail separates the actors.** After the run the activity log shows the pending request as **Agent**, the separation as **Human**, the PIP as **Agent**, and the three seeded rows as **SYSTEM**.

## Video

- [ ] Under three minutes.
- [ ] Uploaded to YouTube and set to public. Not unlisted, not private.
- [ ] Soundtrack resolved per the blocking item above.
- [ ] Every ElevenLabs audio file used in the final cut has `-paid` in its filename. Check the actual files in the editing project, not the export. One non-`-paid` ElevenLabs clip anywhere in the timeline fails this. Non-ElevenLabs audio is not covered by the naming rule and is cleared through its own provenance row instead.
- [ ] Confirmed that no non-`-paid` ElevenLabs file was published, committed, uploaded, or linked anywhere: repo, live site, YouTube, or Devpost.
- [ ] The description carries "Narration created with Grok." Add "Logo created with Grok." only if `public/logo.jpg` appears in the video or as the YouTube thumbnail. Drop the logo line if it does not.
- [ ] No third-party trademarks or logos on screen, including the xAI and Grok marks. Naming the tool in prose is the whole of the credit.
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
