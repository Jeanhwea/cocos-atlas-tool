import type { Point, Rect, Size } from './types.js';

const NUMBER_PATTERN = /-?\d+(?:\.\d+)?/g;

function extractNumbers(value: string): number[] {
  const matches = value.match(NUMBER_PATTERN);
  if (!matches) {
    return [];
  }
  return matches.map((item) => Number(item));
}

export function parsePoint(value: string): Point {
  const [x = 0, y = 0] = extractNumbers(value);
  return { x, y };
}

export function parseSize(value: string): Size {
  const [width = 0, height = 0] = extractNumbers(value);
  return { width, height };
}

export function parseRect(value: string): Rect {
  const [x = 0, y = 0, width = 0, height = 0] = extractNumbers(value);
  return { x, y, width, height };
}
