# PIP the Mug

MIT licensed. The `LICENSE` file at the repo root is the open source license. On GitHub it must show as MIT in the About box at the top of the repository page.

This repository is the full project: TypeScript source under `src/`, PixelLab sprites under `public/sprites/`, the Vite app shell in `index.html`, and the instructions in this README. `pnpm i && pnpm dev` is enough to run it. There is no backend, no model, and no API key.

PIP the Mug is a top-down desk. Thirteen objects on it are the staff of Desk 4B at Desktop Holdings, and each one has a personnel file with a backstory, old reviews, and a short incident history. You are upper management. Your browser's agent is HR. It reads files, writes Q3 reviews, issues Performance Improvement Plans, promotes, moves people between desk zones, and, if you confirm, terminates them. The Mug has been retaining the same serving for three weeks. The Desk Plant is Chief Morale Officer, is down to two leaves, and reports that it is still green-adjacent.

Company state is one versioned JSON document in `localStorage` per seed (`pip-the-mug:v2:open`, `pip-the-mug:v2:demo`, `pip-the-mug:v2:qa`). Reset company clears only the seed you are looking at. Every HR action also works by hand: click an object to open its file, fill the form, drag it to another zone. So a browser with no WebMCP support still runs the whole thing, and the agent is the optional part.

## Seeds

The full 13-person dataset stays in the source. What you see on the desk is the selected seed, not a CSS hide.

| URL | Seed | Roster | Starting plot |
| --- | --- | --- | --- |
| `/`, `/demo`, or `?demo=1` | `demo` | 8 contemporary objects | Mug 2, Pen 5, Plant on a 60-day PIP |
| `/qa` or `?qa=1` | `qa` | All 13 | Mug 2, Pen 5, Second Pen 3, Plant on a 60-day PIP |

Public demo roster: Monitor, Mug, Ballpoint Pen, Desk Plant, USB Hub, Phone Charger, Webcam Cover, Stress Ball.

QA-only: Coaster, Second Ballpoint Pen, Sticky Notes, Scissors, Stapler. Their biographies stay in the QA seed.

Demo reporting lines: Monitor is Interim Desk Lead. Mug, Plant, USB Hub, Webcam Cover, and Stress Ball report to Monitor. Ballpoint Pen and Phone Charger report to USB Hub.

Each seed has its own `localStorage` key. Opening `/` does not overwrite a QA desk. Reset company rebuilds the current seed only.

## WebMCP

At startup the app looks for `document.modelContext` and uses it if `registerTool` is a function. If that is missing it falls back to `navigator.modelContext`. If neither exists, a banner at the top of the page says so, points at Chrome 146 with `chrome://flags/#enable-webmcp-testing`, links the origin trial, and reminds you that manual mode still works. When a context is found, the same banner names which one.

Registration is the standard WebMCP call, from `src/webmcp/register.ts`:

```js
document.modelContext.registerTool({
  name: "list_staff",
  description: "List current Desk 4B staff",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  execute: async (input) => {
    /* returns { ok, summary, staff } */
  },
});
```

The live page registers nine tools that way: `list_staff`, `get_personnel_file`, `get_org_chart`, `write_review`, `put_on_pip`, `resolve_pip`, `promote`, `relocate`, `terminate`.

Tools are registered with JSON Schema inputs and descriptions written for an agent to read, not for a docs page. Employee id enums come from the live roster. Every call returns a structured object plus a one-line `summary`. The whole set is torn down and rebuilt on every state change, because which tools exist depends on what has happened at the desk.

| Tool | What it does |
| --- | --- |
| `list_staff` | Roster with title, department, tenure, standing, zone, last rating |
| `get_personnel_file` | One employee: backstory, past and live reviews, incidents, open PIP |
| `write_review` | Files a Q3 review, rating 1 to 5, with strengths and concerns. Form PR-12 appears in the personnel panel |
| `put_on_pip` | Opens a 30, 60, or 90 day plan with goals. Yellow sticker on the object |
| `resolve_pip` | Closes an open plan as `passed` or `failed` |
| `promote` | New title, and the object moves to the prime spot by the monitor |
| `relocate` | Moves to `prime`, `standard`, `drawer`, or `shelf` |
| `terminate` | Sensitive. Object goes into the Donated / Sink box, name goes on the alumni wall |
| `get_org_chart` | Reporting lines. Someone is always Interim Desk Lead |

Four availability rules matter before you point an agent at this.

`resolve_pip` is only registered while at least one PIP is open. No plans, no tool. The public demo starts Plant on a 60-day PIP, so all nine tools are present.

`terminate` stays registered after a same-quarter promotion. Calling it on that employee returns `ok: false` with a cooling-off explanation and does not open SEP-1. Alumni also return `ok: false`.

Once an object is terminated it keeps showing up in `list_staff` as alumni, but every write tool refuses it. Alumni are read-only.

`terminate` is destructive. If the client has a working confirmation callback, the tool waits for it. If that method is missing or throws unsupported, including the Codex WebMCP shim, the tool does not fire anyone. It opens Form SEP-1 on the page and returns `requires_user_action`. The agent must stop and ask you to click Confirm termination. It must not click that control.

## Try it

### Without an agent

```bash
pnpm i && pnpm dev
```

Open `/`. Click the Mug. Read the file, note the film. File a review from the panel, drag the Pen, put the Plant's PIP through. Terminate still opens the Form SEP-1 dialog and waits for you. Open `/qa` if you want Coaster and the rest of the 13.

### With an agent

1. Chrome 146 or newer.
2. Turn on `chrome://flags/#enable-webmcp-testing` and relaunch the browser.
3. Install a WebMCP inspector extension so you can see and call the registered tools.
4. Open `/` on `localhost` or over https. The banner should read "WebMCP is available", and the inspector should list nine tools.
5. Ask for something HR-shaped: "Run Q3 performance reviews on Desk 4B."

Origin trial registration: https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241

## Local dev

```bash
pnpm i
pnpm dev      # vite dev server
pnpm build    # tsc --noEmit, then a static build into dist/
```

Vite and TypeScript are the only dependencies.

## Deploy

Vercel, static, no functions. Vite builds into `dist`. `vercel.json` rewrites `/demo`, `/qa`, and other app routes to `index.html`, and sends `Origin-Agent-Cluster: ?1` so WebMCP can run. Serve it over https or the browser will not expose a model context.

## License

MIT. See `LICENSE`.
