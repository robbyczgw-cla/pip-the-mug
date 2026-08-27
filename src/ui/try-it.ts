import { escapeHtml } from "../lib/dom.ts";

export const DEMO_PROMPT = `You are HR at Desktop Holdings, Desk 4B. I am upper management. Use only the WebMCP tools this page registered. Do not click DOM controls, invent employees, or reset the company.

1. Call list_staff. Expect 8 IDs: monitor, mug, pen, plant, usb-hub, charger, webcam-cover, stress-ball. Plant is on_pip. Mug’s last rating is 2.
2. Open Mug’s file with get_personnel_file.
3. put_on_pip for Mug, 60 days, reason about the three-week serving, two goals about emptying and fresh coffee.
4. terminate Mug with reason: Contents have outlasted two project kickoffs.
5. If the result has status requires_user_action: Mug stays employed. Form SEP-1 is on the page. Say: “Please click Confirm termination in Form SEP-1. I will not click it.” Stop. Do not click Confirm.
6. After I confirm, list_staff. Mug must be terminated, in the sink, and alumni.`;

export async function copyDemoPrompt(): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(DEMO_PROMPT);
      return true;
    }
  } catch {
    /* fall through to execCommand */
  }
  const field = document.createElement("textarea");
  field.value = DEMO_PROMPT;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  return ok;
}

export function renderTryIt(open: boolean): string {
  const body = open
    ? `
      <div class="try-it-body">
        <p>Your agent should call the named WebMCP tools on this page (<code>list_staff</code>, <code>get_personnel_file</code>, and the rest). It should not click the desk or fill the HR forms in the DOM.</p>
        <p class="try-it-warn">Terminating Mug opens Form SEP-1. Mug stays employed until you click Confirm termination. The agent must not click that control.</p>
        <label class="try-it-prompt-label" for="demo-prompt">Demo prompt</label>
        <textarea id="demo-prompt" class="try-it-prompt" readonly rows="12">${escapeHtml(DEMO_PROMPT)}</textarea>
        <div class="try-it-actions">
          <button type="button" class="solid-btn" data-action="copy-demo-prompt">Copy prompt</button>
          <button type="button" class="ghost-btn" data-action="reset-company">Reset company</button>
        </div>
      </div>`
    : "";

  return `
    <section class="try-it${open ? " is-open" : ""}">
      <button type="button" class="try-it-toggle" data-action="toggle-try-it" aria-expanded="${open ? "true" : "false"}">
        Try it with your agent · about 1 minute
      </button>
      ${body}
    </section>
  `;
}
