# Public release record

Final release state for the PIP the Mug entry in The WebMCP Challenge.

## Submission

| Item | Recorded value |
| --- | --- |
| Devpost project | https://devpost.com/software/pip-the-mug |
| Submitted | 2026-08-29 at 14:37:20 EDT, 20:37:20 CEST |
| Submitted commit | `a4f64e5287fb5e7df82a651a492dd9b21b0a0afa` |
| Public repository | https://github.com/robbyczgw-cla/pip-the-mug |
| Live demo | https://pip-the-mug.vercel.app/ |
| Demo video | https://youtu.be/Hvzt2VUO43U |
| Production deployment | `dpl_7fguX4fZRhscBAqBTcLbzt2BZ3uL` |
| Production JavaScript | `assets/index-BIqWE3sm.js` |

Devpost reported `submitted_at: 2026-08-29T14:37:20.059-04:00` for the `webmcp` challenge. The production deployment was created from a clean checkout at the submitted commit and aliased to the live URL before submission.

## Verified release gates

- [x] The GitHub repository is public, uses the MIT license, and exposes the live demo in its About section.
- [x] The repository contains the complete TypeScript and Vite source, tests, static deployment configuration, screenshots, architecture notes, demo protocol, and asset provenance.
- [x] `pnpm test` passes 25 of 25 tests.
- [x] `pnpm build` passes TypeScript checking and the Vite production build.
- [x] The tree and history scans found no credentials, tokens, private preview hostnames, `.env` files, audio files, or video files.
- [x] The PixelLab sprites, OpenAI ImageGen logo, ElevenLabs narration, and ElevenLabs soundtrack have provenance and usage terms recorded in `docs/asset-provenance.md`.
- [x] The three screenshots in `docs/demo/` show the final logo and verified WebMCP states: reset desk, pending SEP-1, and confirmed separation.
- [x] The Devpost project is public and includes the live demo, public repository, YouTube video, project description, and PIP logo as its project image.
- [x] The repository, live demo, Devpost project, and video endpoints were reachable without a signed-in session on 2026-08-29.
- [x] The live site serves `/`, `/demo`, and `/qa` over HTTPS with the SPA rewrite and `Origin-Agent-Cluster: ?1`.

## Verified WebMCP behavior

- [x] ChatGPT's in-app browser discovered all nine registered tools on the public demo.
- [x] The public seed contains eight employees. Plant begins on a PIP, Mug has rating 2, and Pen has rating 5.
- [x] Agent writes open the matching personnel file and place paperwork on the desk.
- [x] `terminate` returns `requires_user_action` when the client lacks `requestUserInteraction`, opens one SEP-1 form, and leaves employment unchanged.
- [x] A human confirmation moves Mug to the Donated / Sink area and creates the alumni record.
- [x] The activity log separates the pending Agent request from the Human confirmation.
- [x] Registration metadata includes name, title, description, input schema, and annotations. Read tools that may return authored text carry `untrustedContentHint`.

## Compatibility boundary

The final release was verified in ChatGPT's in-app browser. Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` is documented as an additional client path, but that path was not independently re-run after the final metadata-only commit. The website remains fully usable by hand when WebMCP is unavailable.

## Judging freeze

Do not push, redeploy, change repository visibility, rewrite history, or edit the Devpost entry during judging unless a confirmed defect makes a correction necessary. If a correction is unavoidable, record the commit, deployment, reason, and timestamp here.
