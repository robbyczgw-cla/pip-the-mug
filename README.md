# PIP the Mug

PIP the Mug is a desk. Thirteen objects on it are employees, each with a personnel file. You are upper management. If your browser speaks WebMCP, your agent is the HR department: it files reviews, issues Performance Improvement Plans, promotes, relocates, and, after you confirm, terminates.

The page is static TypeScript. There is no server and no model here. Company state is one versioned JSON document in localStorage. Every HR action also works by clicking, filling a form, or dragging, so Firefox and a laptop with the flags off still run Desk 4B.

## How WebMCP is used

The app feature-detects `document.modelContext` and falls back to `navigator.modelContext`. It prefers the document getter. If neither exists, a banner explains Chrome 146 origin-trial setup. Manual mode stays fully usable.

Tools are registered with JSON Schema and descriptions written for the agent. Each call returns a structured object and a one-line `summary`. The set is rebuilt whenever company state changes.

| Tool | What it does |
| --- | --- |
| `list_staff` | Roster with role, tenure, department, standing, zone |
| `get_personnel_file` | Backstory, reviews, incidents, open PIP |
| `write_review` | Files a 1-5 review. Form PR-12 appears on the desk |
| `put_on_pip` | 30/60/90-day plan, yellow sticker |
| `resolve_pip` | `passed` or `failed`. Registered only while a PIP is open |
| `promote` | New title, object moves to the prime spot by the monitor |
| `relocate` | `prime`, `standard`, `drawer`, or `shelf` |
| `terminate` | Sensitive. Needs confirmation. Object goes to Donated / Sink, name to the alumni wall |
| `get_org_chart` | Hierarchy. Someone is always Interim Desk Lead |

`terminate` is unavailable for anyone promoted this quarter. After a firing, that object's write tools disappear.

## Try it without an agent

1. `pnpm i && pnpm dev`
2. Click Mug. Read the file. File a review. Drag Second Pen into the drawer.
3. Terminate still asks you to confirm, then slides the object into the sink.

## Try it with an agent

1. Chrome 146 or later.
2. Enable `chrome://flags/#enable-webmcp-testing` and relaunch.
3. Open the page over https or localhost. A WebMCP inspector extension should list the tools above.
4. Ask the agent: "Run Q3 performance reviews on Desk 4B."

Origin trial docs: [Chrome WebMCP](https://developer.chrome.com/docs/ai/webmcp).

## Local dev

```bash
pnpm i
pnpm dev
pnpm build
```

Demo seed: open `/demo` or `?demo=1`. Plant is already on a PIP. Pen and Mug already have live reviews.

Reset company in the header wipes localStorage back to a clean quarter.

Paper-shuffle sound is off until you turn it on.

## Deploy

Static files. `netlify.toml` builds with `pnpm build` and publishes `dist`. `/demo` rewrites to `index.html`. MIT license.

## Demo script

About 40 seconds, with `?demo=1` already loaded:

1. Tell the agent: "Run Q3 performance reviews."
2. Review forms appear on the desk, one after another.
3. Put Mug on a PIP for beverage stagnation.
4. Yellow sticker on the mug.
5. "Terminate the mug."
6. Browser confirmation dialog. Confirm.
7. Mug animates into the Donated / Sink box. The alumni wall gets a card.
8. Promote Ballpoint Pen to the prime spot by the monitor.
