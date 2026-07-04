import type { AtlasFrame, Point, Rect } from './types.js';

export function frameRegion(frame: AtlasFrame): Rect {
  const { width, height } = frame.trimmedSize;
  return {
    x: frame.frame.x,
    y: frame.frame.y,
    width: frame.rotated ? height : width,
    height: frame.rotated ? width : height,
  };
}

export function restorePlacement(frame: AtlasFrame): Point {
  return {
    x: Math.round((frame.sourceSize.width - frame.trimmedSize.width) / 2 + frame.offset.x),
    y: Math.round((frame.sourceSize.height - frame.trimmedSize.height) / 2 - frame.offset.y),
  };
}
