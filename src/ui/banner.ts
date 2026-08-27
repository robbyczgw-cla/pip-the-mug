import { detectWebMcp } from "../webmcp/detect";

export function renderBanner(canRestore = false): string {
  const detected = detectWebMcp();
  const restore = canRestore
    ? ` <button type="button" class="ghost-btn" data-action="restore-desk">Restore previous desk</button>`
    : "";
  if (detected.available) {
    return `
      <p class="banner" role="status">
        WebMCP is available via <code>${detected.source}</code>. HR tools are registered for your browser agent.${restore}
      </p>
    `;
  }
  return `
    <p class="banner" role="status">
      This browser has no WebMCP (<code>document.modelContext</code>).
      Manual mode still works: click objects, file reviews, drag between zones.
      To try agent HR, use Chrome 146+ with
      <code>chrome://flags/#enable-webmcp-testing</code> enabled, or join the
      <a href="https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241">WebMCP origin trial</a>.${restore}
    </p>
  `;
}
