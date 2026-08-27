import type { EmployeeId } from "../types.ts";

type Opener = (id: EmployeeId) => void;

let opener: Opener | null = null;

export function setPersonnelFileOpener(fn: Opener | null): void {
  opener = fn;
}

/** Same action as clicking a desk object. Does not write company state. */
export function openPersonnelFile(id: EmployeeId): void {
  opener?.(id);
}
