import { parsePoint, parseRect, parseSize } from "./geometry.js";
import { parsePlist, type PlistValue } from "./plist.js";
import type { Atlas, AtlasFrame, AtlasMetadata, Rect, Size } from "./types.js";

type PlistDict = Record<string, PlistValue>;

function asDict(value: PlistValue | undefined): PlistDict {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as PlistDict;
  }
  return {};
}

function asString(value: PlistValue | undefined): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: PlistValue | undefined): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function asBoolean(value: PlistValue | undefined): boolean {
  return value === true;
}

function parseFrameEntry(name: string, raw: PlistDict): AtlasFrame {
  if ("frame" in raw) {
    const frame = parseRect(asString(raw.frame));
    const rotated = asBoolean(raw.rotated);
    const offset = parsePoint(asString(raw.offset));
    const sourceColorRect = "sourceColorRect" in raw
      ? parseRect(asString(raw.sourceColorRect))
      : { x: 0, y: 0, width: frame.width, height: frame.height };
    const sourceSize = parseSize(asString(raw.sourceSize));
    return { name, frame, rotated, offset, sourceColorRect, sourceSize };
  }

  if ("textureRect" in raw) {
    const frame = parseRect(asString(raw.textureRect));
    const rotated = asBoolean(raw.textureRotated);
    const offset = parsePoint(asString(raw.spriteOffset));
    const sourceColorRect = parseRect(asString(raw.spriteSourceSize));
    const sourceSize = parseSize(asString(raw.spriteSize));
    return { name, frame, rotated, offset, sourceColorRect, sourceSize };
  }

  const frame: Rect = {
    x: asNumber(raw.x),
    y: asNumber(raw.y),
    width: asNumber(raw.width),
    height: asNumber(raw.height)
  };
  const offset = { x: asNumber(raw.offsetX), y: asNumber(raw.offsetY) };
  const sourceSize: Size = {
    width: asNumber(raw.originalWidth),
    height: asNumber(raw.originalHeight)
  };
  return {
    name,
    frame,
    rotated: false,
    offset,
    sourceColorRect: { x: 0, y: 0, width: frame.width, height: frame.height },
    sourceSize
  };
}

function parseMetadata(raw: PlistDict): AtlasMetadata {
  return {
    format: asNumber(raw.format),
    size: parseSize(asString(raw.size)),
    textureFileName: asString(raw.textureFileName),
    realTextureFileName: raw.realTextureFileName
      ? asString(raw.realTextureFileName)
      : undefined
  };
}

export function parseAtlas(xml: string): Atlas {
  const root = asDict(parsePlist(xml));
  const framesDict = asDict(root.frames);
  const frames: AtlasFrame[] = Object.keys(framesDict).map((name) =>
    parseFrameEntry(name, asDict(framesDict[name]))
  );
  const metadata = parseMetadata(asDict(root.metadata));
  return { frames, metadata };
}
