export const nowMs = (): number => Date.now();

export const createId = (): string =>
  `${nowMs()}-${Math.random().toString(36).slice(2, 9)}`;
