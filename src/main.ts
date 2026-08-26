import "./styles.css";
import { mount } from "./app";
import { preloadSprites } from "./ui/sprites";

const root = document.querySelector<HTMLElement>("#app");
if (!root) {
  throw new Error("Missing #app");
}

void preloadSprites().then(() => {
  mount(root);
});
