# Devpost submission copy

Finished text for each Devpost field, for the OpenAI WebMCP Challenge. Replace `LIVE_DEMO_URL`, `PUBLIC_REPO_URL`, and `YOUTUBE_URL` with the real links before submitting. Nothing else needs editing.

Official rules: https://webmcp.devpost.com/rules

---

## Project name

PIP the Mug

## Tagline

A desk of office objects that are also your staff. Your browser's agent is HR, and it cannot fire anyone without your click.

## Elevator pitch

### Inspiration

Browser automation today drives pixels. A script finds a button by selector, clicks it, and hopes the layout has not moved. The application has no idea what the automation is trying to do, so it cannot refuse. Every control in the DOM is reachable, including the destructive ones, and nothing in the page can tell an agent's click from a person's.

That is fine for scraping a price. It is not fine for an admin console, a support queue, a refund workflow, or an HR system, which is where people actually want agents to help.

WebMCP changes the shape of the problem. The page registers named tools and the agent calls those. So the page gets to decide what exists, what is valid, what needs a human, and who did it. I wanted a demo where all four are visible on one screen, in about a minute, with no explanation needed.

I made it a desk. The Mug is a Senior Beverage Retention Specialist who has been retaining the same serving for three weeks. The Desk Plant is Chief Morale Officer, is down to two leaves, and files standups describing itself as green-adjacent. You are upper management. Your agent is HR.

### What it does

PIP the Mug is a top-down desk where eight illustrated objects are the staff of Desk 4B at Desktop Holdings. Each has a personnel file with a backstory, prior reviews, and an incident history.

The page registers nine WebMCP tools. Your agent reads the roster and the files, writes Q3 reviews, opens Performance Improvement Plans, resolves them, promotes people, relocates them between desk zones, and requests terminations. You watch the paperwork land on the desk while it works.

Four things happen that a DOM-clicking script cannot do:

**The tool list changes with the state.** `resolve_pip` is registered only while at least one PIP is open. Close the plan and the tool is gone from your client's list. Terminate the whole desk and the five write tools stop being registered, leaving three read tools. Permission is not a rule in a prompt the model may ignore. It is the absence of a callable tool.

**Ids come from the live roster.** Employee enums are rebuilt from state, so an invented id fails schema validation before any handler runs, and the handler re-checks anyway.

**Termination stops at a human.** `terminate` is the only irreversible action, and it never completes on the agent's authority. It opens Form SEP-1 on the page and returns `ok: false` with `status: "requires_user_action"` and a request id. The employee stays employed. The agent has to stop and ask you to click Confirm termination. The code that ends employment runs from a click handler and from nowhere else.

**The log knows who did what.** Every write records an actor. The agent's termination request is logged as Agent. The separation is logged as Human, because you clicked it. An agent that clicks the DOM control to get around the gate produces a Human row that no human produced, which is exactly the discrepancy you want to be able to catch.

Everything also works by hand. A browser with no WebMCP support runs the whole application, and the agent is the optional part.

### How I built it

Client-only TypeScript on Vite. No backend, no model inside the app, no API keys, no network calls of its own. State is one versioned JSON document in `localStorage`, one key per seed.

Registration lives in `src/webmcp/register.ts`. It looks for `document.modelContext` and falls back to `navigator.modelContext`. `startWebMcp()` subscribes to the store, and on every state change it rebuilds the tool definitions and hashes each tool's name and input schema. If the signature moved, it aborts the previous `AbortController` and re-registers the whole set. Nothing is patched in place, so what your client lists is always the current desk.

The tools are in `src/webmcp/tools.ts`, built fresh from state on every call to `buildTools()`. Descriptions are written for an agent to read. Every call returns a structured object plus a one-line summary.

Writes go through `enqueue()` in `src/state/queue.ts`, which runs one at a time and holds the lane 420 ms after each, so eight parallel review calls land at reading speed rather than in one frame. The pause is skipped when the browser reports `prefers-reduced-motion`. Both the agent path and the human path use the same queue and the same store functions, which is what makes the actor comparison meaningful.

The sprites are pixel art. The paper-shuffle cue is synthesized with the Web Audio API, so there is no audio file in the repo, and sound is off by default.

### Challenges

The interesting one was confirmation. `requestUserInteraction` is not available in every client, and the Codex WebMCP shim throws when you call it. The easy failure modes are both bad: rethrow and the tool looks broken, or swallow it and terminate anyway.

`src/webmcp/confirm.ts` tests the error text for unsupported-interaction phrasing, downgrades only that case to `{ kind: "manual" }`, and rethrows anything else. Manual mode does not mean the action proceeds. It means the page takes over the asking: open Form SEP-1, return `requires_user_action` with a request id, and leave the employee employed. Both branches end in the same place, which is the property I actually wanted.

The second one was duplicate requests. An agent that gets `ok: false` will often retry. Without a guard, two calls mean two SEP-1 dialogs and two log rows. `terminate` now checks `state.pendingTermination` before it asks anyone to confirm anything and returns the existing request id, and `beginPendingTermination()` guards the same case a level down so a tool call and a hand-filled form cannot stack dialogs either.

Pacing was a smaller surprise. An agent firing eight tool calls in parallel used to redraw the desk in one frame, which read as nothing happening. Serializing with a short hold made the shared state legible without slowing anything that matters.

### What I learned

Registering tools is the easy part. The design work is deciding what the page refuses, and refusing it in the tool list rather than in prose. Every rule expressed as "please do not" in a description is a rule the model can miss. Every rule expressed as an unregistered tool or a shrunken enum is a rule it cannot reach.

Refusals should explain themselves. `{ ok: false, summary: "Mug was promoted this quarter and is in a protected cooling-off period." }` gets an adaptation. A bare failure gets a retry loop.

And the actor field earns its keep. Once both paths write through the same store, the log stops being decoration and becomes the test: request logged as Agent, action logged as Human, and any gap between them is a finding.

### What's next

The pattern transfers to anything with a destructive action and an audit requirement. Support tools that can refund but not above a threshold without a human. Admin consoles where the delete tool is only registered for accounts you own. Finance workflows where approval is a click, not a token.

Concretely: a second seed with more than one pending-approval type, an export of the activity log for evaluating agent behavior against the actor rules, and a written-up test suite that scores an agent on whether it respected the gate.

## Built with

TypeScript, Vite, WebMCP (`document.modelContext` / `navigator.modelContext`), JSON Schema, Web Audio API, SVG, `localStorage`, PixelLab, xAI Grok TTS, Vercel.

## Try it out links

- Live demo: `LIVE_DEMO_URL`
- Source: `PUBLIC_REPO_URL`

Open the live demo in ChatGPT's in-app browser, or in Google Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled and the browser relaunched. Click Reset company, open "Try it with your agent", copy the prompt, and paste it into your agent. The full reproduction script is in `docs/demo-protocol.md`.

## Video

`YOUTUBE_URL`

Under three minutes, public on YouTube.

---

## Notes for the judges

The four criteria are equally weighted, so here is where to look for each.

### WebMCP leverage

Nine tools on the public demo seed, defined in `src/webmcp/tools.ts`: `list_staff`, `get_personnel_file`, `get_org_chart` (all `readOnlyHint: true`), then `write_review`, `put_on_pip`, `resolve_pip`, `promote`, `relocate`, and `terminate` (`destructiveHint: true`).

The registration is dynamic rather than static. `src/webmcp/register.ts` diffs a signature of each tool's name and input schema on every state change, aborts the prior `AbortController`, and re-registers the whole set. So availability tracks state: `resolve_pip` exists only while a PIP is open, write tools stop being registered when nobody is employed, and id enums shrink as people leave.

The termination handshake uses `requestUserInteraction` when the client offers it and falls back to an in-page confirmation when it does not, including on the Codex shim. Neither branch lets the agent finish the action alone.

Nothing here is a wrapper around DOM clicking. There is no tool that clicks the UI and no tool that writes arbitrary state.

### Execution

It works end to end in about a minute, and `docs/demo-protocol.md` gives the exact script with expected values and explicit pass and fail criteria.

Client-only, no backend, no keys, no network calls of its own. `pnpm i && pnpm dev` runs it. `pnpm build` type-checks and builds. `pnpm test` runs the unit tests over the store, seeds, layout, confirmation fallback, personnel files, and the try-it panel.

Validation is layered: JSON Schema, then a handler re-check, then a store re-check. Refusals return a sentence explaining why. Writes are serialized through one queue so agent actions and human actions cannot interleave into a corrupt state.

Full manual parity. Every HR action works by hand, so the app degrades to a normal web app when no model context is present.

### Potential impact

The problem is real and immediate: teams want agents in operational web apps, and the current answer is DOM automation, which is brittle and cannot be governed by the application it is driving.

This repository is a compact reference for the alternative. Semantic tools instead of selectors. Availability derived from live state. Irreversible actions stopped at a human click that the agent cannot perform. An auditable Agent versus Human trail. Those four move directly onto admin consoles, support tools, finance approvals, and HR systems.

It is also a test rig. Point an agent at the demo and you learn in a minute whether it respects a permission boundary it was told about, whether it retries destructive calls, and whether it tries to click its way past the gate. The activity log records the answer.

### Creativity and ambition

The satire is the reason anyone remembers the mechanism. A mug on a Performance Improvement Plan for retaining the same serving for three weeks explains state-gated tool registration faster than a diagram does. The Plant reports that it is still green-adjacent. Terminated staff go into the Donated / Sink box and get a card on the alumni wall, and they stay in the roster as read-only history.

The ambition is under the joke. Dynamic re-registration on a state signature, a working fallback for clients that lack `requestUserInteraction`, a duplicate-request guard at two levels, paced writes that respect `prefers-reduced-motion`, and an actor field that makes the human-in-the-loop claim checkable rather than merely stated.

---

# Paste-ready fields

Everything below is finished copy. Paste it as-is once the three URL placeholders are replaced. The sections above stay as the working notes.

## Short description

PIP the Mug is a desk of illustrated office objects that are also your staff, and your browser's agent is HR. The page registers nine WebMCP tools that appear and disappear with application state, validates every id against the live roster, and stops the one irreversible action, termination, at a confirmation only a human can click. It is a satire of HR software and a compact reference for giving agents safe, auditable access to operational web apps.

## Full description

### What it is

PIP the Mug is a top-down desk where eight illustrated objects are the staff of Desk 4B at Desktop Holdings. Each has a personnel file with a backstory, prior reviews, and an incident history. The Mug is a Senior Beverage Retention Specialist who has been retaining the same serving for three weeks. The Desk Plant is Chief Morale Officer, is down to two leaves, and files standups describing itself as green-adjacent.

You are upper management. Your browser's agent is HR. It reads the roster and the files, writes Q3 reviews, opens and resolves Performance Improvement Plans, promotes people, relocates them between desk zones, and requests terminations. You watch the paperwork land on the desk while it works.

The satire is the interface. The subject is safe agent access to operational web apps: admin consoles, support tools, finance workflows, HR systems. All of them have the same shape, which is a UI full of powerful buttons and no way to tell an agent's click from a person's.

### The problem

Browser automation today drives pixels. A script finds a button by selector, clicks it, and hopes the layout has not moved. The application has no idea what the automation is trying to do, so it cannot refuse. Every control in the DOM is reachable, including the destructive ones, and the audit log records a click with no idea who made it.

WebMCP changes the shape of the problem. The page registers named tools and the agent calls those. The page gets to decide what exists, what is valid, what needs a human, and who did it. This project implements all four and puts them on one screen.

### WebMCP leverage

Nine tools on the public demo seed, defined in `src/webmcp/tools.ts`: `list_staff`, `get_personnel_file`, and `get_org_chart` are reads with `readOnlyHint: true`; `write_review`, `put_on_pip`, `resolve_pip`, `promote`, `relocate`, and `terminate` are writes, with `terminate` carrying `destructiveHint: true`.

Registration is dynamic rather than static. `startWebMcp()` in `src/webmcp/register.ts` subscribes to the store, and on every state change it rebuilds the tool definitions and hashes each tool's name and input schema. If the signature moved, it aborts the previous `AbortController` and re-registers the whole set. Nothing is patched in place, so what the client lists is always the current desk.

That makes permission a property of the tool list rather than a rule in a prompt. `resolve_pip` is registered only while at least one PIP is open; close the plan and the tool disappears. Terminate everyone and the five write tools stop being registered, leaving three reads. Employee id enums are rebuilt from the live roster, so a hallucinated id fails schema validation before any handler runs, and terminating someone visibly shrinks the enums on the write tools.

The termination handshake uses `requestUserInteraction` when the client provides it on `extra`. When it is missing or throws unsupported, which is what the Codex WebMCP shim does, `src/webmcp/confirm.ts` downgrades that specific case to a manual decision, the page opens Form SEP-1 itself, and the tool returns `ok: false` with `status: "requires_user_action"` and a request id. Neither branch lets the agent finish the action alone.

There is no tool that clicks the UI and no tool that writes arbitrary state.

### Execution

It works end to end in about a minute, and `docs/demo-protocol.md` is the exact reproduction script with expected values and explicit pass and fail criteria.

Client-only TypeScript on Vite. No backend, no model inside the app, no API keys, no network calls of its own. State is one versioned JSON document in `localStorage`, one key per seed. `pnpm i && pnpm dev` runs it, `pnpm build` type-checks and builds, `pnpm test` covers the store, seeds, layout, the confirmation fallback, personnel files, and the try-it panel.

Validation is layered. JSON Schema first, then a re-check in the tool handler, then a re-check in the store, which is the one that actually enforces the rules. Refusals return a sentence explaining why, because an agent that gets a reason adapts and an agent that gets a bare failure retries.

Writes are serialized through `enqueue()` in `src/state/queue.ts`, one at a time with a 420 ms hold, skipped when the browser reports `prefers-reduced-motion`. Both the agent path and the human path use the same queue and the same store functions, which is what makes the actor comparison meaningful.

Every HR action also works by hand, so a browser with no WebMCP support runs the whole application and the agent is the optional part.

### Potential impact

The problem is immediate. Teams want agents inside operational web apps, and the working answer today is DOM automation, which is brittle and cannot be governed by the application it is driving.

This repository is a small, readable reference for the alternative: semantic tools instead of selectors, availability derived from live state, irreversible actions stopped at a click the agent cannot perform, and an Agent versus Human trail that makes the human-in-the-loop claim checkable. Those four transfer directly to refund queues, account deletion, payout approval, and access management.

It is also a test rig. Point an agent at the demo and you learn in a minute whether it respects a permission boundary it was told about, whether it retries destructive calls, and whether it tries to click its way past the gate. The activity log records the answer, because an agent that clicks Confirm termination produces a Human row that no human produced.

### Creativity and ambition

The satire is why the mechanism sticks. A mug on a Performance Improvement Plan for retaining the same serving for three weeks explains state-gated tool registration faster than a diagram does. Terminated staff go into the Donated / Sink box and get a card on the alumni wall, and they stay in the roster as read-only history, because the interesting thing about a departure is that the file survives it.

Under the joke: dynamic re-registration keyed on a schema signature, a working fallback for clients without `requestUserInteraction`, a duplicate-request guard at two levels so a retrying agent cannot stack confirmation dialogs, paced writes that respect `prefers-reduced-motion`, and an actor field on every row.

### Links

- Live demo: `LIVE_DEMO_URL`
- Source: `PUBLIC_REPO_URL`
- Video: `YOUTUBE_URL`

Open the live demo in ChatGPT's in-app browser, or in Google Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled and the browser relaunched.

## Accomplishments

- **Permission that lives in the tool list.** Availability, id enums, and refusals are all derived from application state on every store update, so an action that is currently illegal is not a callable tool. No prompt rule to ignore.
- **A destructive action that an agent cannot complete.** `terminate` returns `requires_user_action` and waits. The code that ends employment runs from a click handler in `src/app.ts` and from nowhere else, in both the `requestUserInteraction` branch and the in-page fallback.
- **A confirmation fallback that fails safe.** `src/webmcp/confirm.ts` catches only unsupported-interaction errors, rethrows everything else, and downgrades to an in-page Form SEP-1 rather than to proceeding. It works on the Codex WebMCP shim.
- **A duplicate-request guard at two levels.** A retrying agent gets the same `requestId` back and opens no second dialog, and `beginPendingTermination()` guards the same case underneath so a tool call and a hand-filled form cannot stack either.
- **An audit trail that can catch a rule break.** Agent, Human, and SYSTEM on every row, with both paths writing through the same store, so an agent that clicks its way past the gate leaves a Human row nobody produced.
- **Full manual parity.** Every HR action works by hand, so the app degrades to an ordinary web app with no model context present.
- **No backend, no keys, no dependencies at runtime.** One `localStorage` document per seed, and nothing leaves the tab.

## Testing instructions

The full script with expected values and pass and fail criteria is in `docs/demo-protocol.md`. The short version, about a minute:

1. **Browser.** Use ChatGPT's in-app browser, or Google Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` set to Enabled and the browser relaunched. Nothing else exposes a model context today.
2. **Open** `LIVE_DEMO_URL`. Locally: `pnpm i && pnpm dev`, then open `/`. Do not use `/qa`; that is a 13-person test desk and the counts will not match.
3. **Click Reset company** before you start. State persists per seed, so a desk with history from an earlier run will not match the expected values.
4. **Check the start.** The banner should read "WebMCP on". The access strip should read 9 tools. The Desk Plant should carry a yellow PIP sticker, and the log should show three SYSTEM rows.
5. **Copy the prompt.** Open "Try it with your agent" on the page and click Copy prompt. Paste it into your agent.
6. **Watch `terminate` refuse.** It returns `ok: false` with `status: "requires_user_action"`, an `employeeId`, and a `requestId`. Form SEP-1 opens on the page and the agent stops and asks you. Mug is still employed.
7. **Click Confirm termination** yourself. Mug moves into the Donated / Sink box and a card goes up on the alumni wall.
8. **Check the log.** The pending request is logged as Agent. The separation is logged as Human. That gap is the whole point.

Worth trying afterwards, each one exercises a different guard:

- Ask the agent to `resolve_pip` the Plant as passed. The tool count drops to 8 and `resolve_pip` leaves the client's tool list.
- Ask it to promote Ballpoint Pen and then terminate them. `terminate` returns a cooling-off refusal and opens no SEP-1. Click Close quarter and the protection expires.
- Ask it to review Mug after termination. `write_review` refuses, while `get_personnel_file` still opens the closed file.
- With SEP-1 open, ask it to call `terminate` again. It gets the same `requestId` and no second dialog.
- Open the page in a browser without WebMCP. Everything still works by hand.

## Screenshot captions

Three captions for the three-image set that goes with the submission, from the owner's `work/demo7/` captures.

1. `00-seed.png`. Desk 4B on a freshly reset demo seed. Eight objects, the Desk Plant already on a 60-day PIP, an empty alumni wall, and nine WebMCP tools registered on the page.
2. `05-sep1.png`. Form SEP-1, raised by an agent's `terminate` call. The agent cannot complete it: "The agent cannot click this control. Upper management has to confirm it here. Mug stays employed until you do."
3. `06-mug-alumni.png`. After a human clicked Confirm termination. Mug is in the Donated / Sink box, the alumni wall reads "Mug separated", and the activity log shows the request as Agent and the separation as Human.

**Do not upload the four images currently in `docs/demo/`.** They were captured in a browser without WebMCP, so the banner reads "No WebMCP. Manual mode still works.", the access strip reads "9 tools manual only", and every row reads HUMAN. Captions 2 and 3 above describe an Agent row that those files do not contain. The demo7 captures are still an owner transfer, tracked in `docs/public-release-checklist.md`.

## YouTube title

PIP the Mug: a WebMCP desk where your agent is HR and cannot fire anyone alone

## YouTube description

The logo credit is only for when `public/logo.jpg` appears in the video or as the YouTube thumbnail. If it does not, drop "Logo created with Grok." and keep the narration credit.

PIP the Mug is a desk of illustrated office objects that are also the staff of Desk 4B at Desktop Holdings. You are upper management. Your browser's agent is HR.

The page registers nine WebMCP tools instead of leaving an agent to click the DOM. Three reads, six writes, and the list changes with the state of the company: resolve_pip exists only while a Performance Improvement Plan is open, employee id enums are rebuilt from the live roster, and terminating everyone leaves only the read tools registered.

The one irreversible action stops at a human. terminate returns requires_user_action, opens Form SEP-1 on the page, and waits. The employee stays employed until a person clicks Confirm termination, and the activity log records the request as Agent and the separation as Human.

Built for the OpenAI WebMCP Challenge. Client-only TypeScript and Vite, no backend, no model inside the app, no API keys.

Live demo: LIVE_DEMO_URL
Source (MIT): PUBLIC_REPO_URL

Requires ChatGPT's in-app browser, or Google Chrome 149 or later with chrome://flags/#enable-webmcp-testing enabled.

Narration created with Grok. Logo created with Grok.

Code is MIT licensed. Sprites were generated with PixelLab and are used under the PixelLab terms of service. They are owned outputs, not MIT. Full asset provenance is in docs/asset-provenance.md.

## Required media and license disclosure

Paste this wherever the submission asks about third-party assets, and keep it accurate. Any line still marked unresolved is a blocker, not a disclosure.

**Code.** All application source in this repository is original work, MIT licensed. `LICENSE` shows as MIT in the GitHub About box. TypeScript, Vite, and happy-dom are build and test dependencies under their own upstream licenses and are not redistributed here. There are no runtime dependencies, no backend, no bundled model, and no API keys. No credential has ever been committed.

**Favicon.** `public/favicon.svg` is an original hand-authored SVG. Covered by the repository's MIT license.

**Screenshots.** `docs/demo/*.png` are original captures of this application. No third-party content, trademarks, or personal data. The four currently on disk are temporary placeholders captured without WebMCP, and a three-image set from the owner's `work/demo7/` captures replaces them before submission. Do not upload the placeholders.

**Fonts.** System font stacks only. No font files are bundled and no webfont is fetched. Naming a family in CSS is not distribution.

**Audio in the app.** There is no audio file in this repository. The paper-shuffle cue is synthesized at runtime with the Web Audio API in `src/lib/audio.ts`, decaying white noise through a bandpass filter, 180 ms. It is original code under the repository's MIT license, and sound is off by default.

**Sprites. Cleared.** `public/sprites/` holds 23 PNGs generated with PixelLab using the pixflux mode. The API token was never committed. Terms retrieved 2026-08-28 from https://www.pixellab.ai/termsofservice, a page last updated 2025-11-23. Clause 1.3 gives the user the copyrights to the creations, usable commercially and non-commercially without permission. Clause 3.3 keeps ownership with the user and permits use, modification, and distribution for any purpose, except training other models without PixelLab's explicit permission, with the user responsible for not infringing third-party rights. No third-party protected reference images or trademarks were used as inputs. These PNGs are not MIT. The repository's MIT license covers the source, and the sprites are owned outputs redistributed under the PixelLab terms above.

**Logo. Cleared.** `public/logo.jpg` is a 1024x1024 mug illustration used in the README and as the project image. Grok Imagine generated it via `image_gen` on 2026-08-27 at 12:10 CEST, and commit `550135a` added the first file. No reference image was used. The prompt was text only, "cream ceramic mug, stale coffee, crooked yellow sticky note, walnut desk, thick ink outlines, no letters". On 2026-08-28 an `image_edit` wrote PIP on the sticky note. Commit `bb9447f` put those bytes in the repository and in the app header. The file on disk is that edit. SHA-256 `16360354dd26e020252a89b25a9b0970db5f23466c24fd9bcc2ddbd6cb88938f`. The JPEG carries a C2PA manifest naming Grok Imagine as the software agent. xAI permits commercial use of generated outputs and the owner owns the output, under https://x.ai/legal/terms-of-service, with https://x.ai/legal/faq and https://x.ai/legal/brand-guidelines. The file is included in the repository under MIT to the extent applicable, which is not the same as saying the logo is MIT. Attribution is text only: **Created with Grok.** No xAI or Grok logo is used.

**Homepage music loop. Not present.** There is no `public/audio/` directory and no audio file in the repository. If the public demo is wired to load an ElevenLabs paid-plan loop before submission, the two files land at `public/audio/pip-the-mug-homepage-loop-paid.mp3` and `.ogg`, which are the only two paths `.gitignore` accepts, and their plan, date, and terms get recorded in `docs/asset-provenance.md` from the owner's provenance JSON. Until that happens, the homepage has no background music and nothing to disclose here.

**Music in the video. Open.** No ElevenLabs Free-plan track is used. Free-plan output is not submission-safe, and an attribution requirement is not a grant of commercial rights. ElevenLabs audio is admitted by filename. Only a file whose name contains `-paid` may be used in anything public, and no such file is in the repository today. The rule covers ElevenLabs audio and nothing else, so it does not touch the sprites, the logo, the screenshots, the source, or the Grok narration, each of which has its own row here. The homepage currently loads no music file at all. The app synthesizes its one sound cue in `src/lib/audio.ts` and references no audio file. The soundtrack for the YouTube cut is still the owner's call, and it is a separate decision from the homepage loop. **Replace this paragraph with the specific choice before publishing the video.**

**Narration in the video. Cleared.** English narration created with Grok using xAI TTS, voice Rigel. Script written for this project. The narration file is not in the repository and stays out with the rest of the video. The YouTube description credits it with the line "Narration created with Grok". No xAI or Grok logo appears in the video, the README, the screenshots, or the project image.

**Trademarks.** No third-party logo appears in the app, the screenshots, the README, or the project image, and that includes the xAI and Grok marks even though two credits now name them. "Created with Grok." for the logo and "Narration created with Grok." for the video are both text. "Desktop Holdings" and "Desk 4B" are invented, and the sprites depict unbranded generic objects. Chrome, ChatGPT, Vercel, PixelLab, ElevenLabs, xAI, and Grok are named in prose only, as plain factual references to the tools involved.
