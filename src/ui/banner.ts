import { detectWebMcp } from "../webmcp/detect";

export function renderBanner(): string {
  const detected = detectWebMcp();
  const status = detected.available
    ? `WebMCP on via <code>${detected.source}</code>.`
    : `No WebMCP. Manual mode still works.`;
  return `
    <div class="banner" role="status">
      <p class="banner-ask">Ask your agent to inspect and tidy Desk 4B using the page’s WebMCP tools. Destructive actions still require your confirmation.</p>
      <p class="banner-status">${status}</p>
    </div>
  `;
}
