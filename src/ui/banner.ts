import { detectWebMcp } from "../webmcp/detect";

export function renderBanner(): string {
  const detected = detectWebMcp();
  if (detected.available) {
    return `
      <p class="banner" role="status">
        WebMCP is available via <code>${detected.source}</code>. HR tools are registered for your browser agent.
      </p>
    `;
  }
  return `
    <p class="banner" role="status">
      This browser has no WebMCP (<code>document.modelContext</code>).
      Manual mode still works: click objects, file reviews, drag between zones.
      To try agent HR, use Chrome 146+ with
      <code>chrome://flags/#enable-webmcp-testing</code> enabled, or join the
      <a href="https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241">WebMCP origin trial</a>.
    </p>
  `;
}
