# PIP the Mug

PIP the Mug is a top-down desk. Thirteen objects on it are the staff of Desk 4B at Desktop Holdings, and each one has a personnel file with a backstory, old reviews, and a short incident history. You are upper management. Your browser's agent is HR. It reads files, writes Q3 reviews, issues Performance Improvement Plans, promotes, moves people between desk zones, and, if you confirm, terminates them. The Mug has been retaining the same serving for three weeks. The Desk Plant is Chief Morale Officer, is down to two leaves, and reports that it is still green-adjacent.

The tools run in the page. There is no backend, no model, and no API key anywhere in this repo. Company state is one versioned JSON document in `localStorage` under `pip-the-mug:v1`, and the Reset company button in the top bar clears it back to a fresh quarter. Every HR action also works by hand: click an object to open its file, fill the form, drag it to another zone. So a browser with no WebMCP support still runs the whole thing, and the agent is the optional part.

## WebMCP

At startup the app looks for `document.modelContext` and uses it if `registerTool` is a function. If that is missing it falls back to `navigator.modelContext`. If neither exists, a banner at the top of the page says so, points at Chrome 146 with `chrome://flags/#enable-webmcp-testing`, links the origin trial, and reminds you that manual mode still works. When a context is found, the same banner names which one.

Tools are registered with JSON Schema inputs and descriptions written for an agent to read, not for a docs page. Every call returns a structured object plus a one-line `summary`. The whole set is torn down and rebuilt on every state change, because which tools exist depends on what has happened at the desk.

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

`resolve_pip` is only registered while at least one PIP is open. No plans, no tool.

`terminate` disappears for anyone promoted in the current quarter. HR cannot fire someone it just promoted, at least not until Q4.

Once an object is terminated it keeps showing up in `list_staff` as alumni, but every write tool refuses it. Alumni are read-only.

`terminate` carries `destructiveHint` and asks for confirmation before it does anything. It routes through the client's `requestUserInteraction` when the agent runtime offers one, which is what puts the consent prompt in front of you rather than in front of the model, and falls back to `window.confirm` otherwise. Cancel and the tool returns a refusal the agent can read.

## Try it

### Without an agent

```bash
pnpm i && pnpm dev
```

Click the Mug. Read the file, note the film. File a review from the panel, drag the Second Ballpoint Pen into the drawer, put the Plant on a 60 day plan. Terminate still opens the Form SEP-1 dialog and waits for you.

### With an agent

1. Chrome 146 or newer.
2. Turn on `chrome://flags/#enable-webmcp-testing` and relaunch the browser.
3. Install a WebMCP inspector extension so you can see and call the registered tools.
4. Open the page on `localhost` or over https. The banner should read "WebMCP is available", and the inspector should list nine tools, or eight if nobody is on a PIP.
5. Ask for something HR-shaped: "Run Q3 performance reviews on Desk 4B."

Origin trial registration: https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241

## Local dev

```bash
pnpm i
pnpm dev      # vite dev server
pnpm build    # tsc --noEmit, then a static build into dist/
```

Vite and TypeScript are the only dependencies. For a desk that already has history on it, open `/demo` or add `?demo=1`: the Pen has a 5, the Mug has a 2, the Second Pen has a 3, and the Plant is 60 days into a plan it is not going to pass. The demo seed replaces whatever is in `localStorage`, so do not load it over a state you wanted to keep.

## Deploy

Netlify, static, no functions. `netlify.toml` sets `pnpm build` as the command and `dist` as the publish directory, rewrites `/demo` and everything else to `index.html`, and sends `Origin-Agent-Cluster: ?1`. Any static host works if you copy those two redirects. Serve it over https or WebMCP will not be there to detect.

## Demo script

Forty seconds, from a fresh `/demo`.

**0:00** Open `/demo`. Point out the desk, the ticker, and that the Plant is already wearing a yellow PIP sticker.

**0:05** Tell the agent: "Run Q3 performance reviews on Desk 4B." It calls `list_staff`, reads a few files with `get_personnel_file`, then starts filing.

**0:12** Reviews land. Open the HR Activity Log at the bottom and every entry is tagged Agent. Click an employee and the filled Form PR-12 is in the panel.

**0:20** The Mug scores a 2. The agent calls `put_on_pip` on its own, or you ask it to. A second yellow sticker appears, and `resolve_pip` shows up in the inspector now that a plan is open.

**0:26** Say: "Terminate the mug." The browser puts up its own consent dialog naming the Mug and the Donated / Sink box. The model cannot click it. You can.

**0:32** Confirm. The Mug slides into the Donated / Sink box, its name goes on the alumni wall, and its write tools vanish from the tool list.

**0:36** Say: "Promote the pen." The Ballpoint Pen moves to the prime spot by the monitor with a new title, and `terminate` is now unavailable for it until next quarter. End on the org chart.

Reset company puts everyone back.

## License

MIT. See `LICENSE`.
