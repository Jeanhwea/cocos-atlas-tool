import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';
import { parseAtlas } from '../parser/atlas.js';
import { frameRegion, restorePlacement } from '../core/layout.js';
import type { Atlas, AtlasFrame } from '../core/types.js';

export interface ExtractOptions {
  restoreOriginalSize?: boolean;
}

type ImageSource = string | Buffer;

async function loadBuffer(image: ImageSource): Promise<Buffer> {
  return typeof image === 'string' ? readFile(image) : image;
}

export async function extractFrame(
  image: ImageSource,
  frame: AtlasFrame,
  options: ExtractOptions = {},
): Promise<Buffer> {
  const { restoreOriginalSize = true } = options;
  const buffer = await loadBuffer(image);
  const region = frameRegion(frame);

  let sprite = sharp(buffer).extract({
    left: region.x,
    top: region.y,
    width: region.width,
    height: region.height,
  });

  if (frame.rotated) {
    sprite = sharp(await sprite.png().toBuffer()).rotate(-90);
  }

  const spriteBuffer = await sprite.png().toBuffer();

  if (!restoreOriginalSize) {
    return spriteBuffer;
  }

  const { x: left, y: top } = restorePlacement(frame);

  return sharp({
    create: {
      width: frame.sourceSize.width,
      height: frame.sourceSize.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: spriteBuffer, left, top }])
    .png()
    .toBuffer();
}

export async function extractAtlas(
  image: ImageSource,
  atlas: Atlas,
  outDir: string,
  options: ExtractOptions = {},
): Promise<string[]> {
  const buffer = await loadBuffer(image);
  await mkdir(outDir, { recursive: true });
  const outputs: string[] = [];
  for (const frame of atlas.frames) {
    const data = await extractFrame(buffer, frame, options);
    const fileName = frame.name.toLowerCase().endsWith('.png') ? frame.name : `${frame.name}.png`;
    const outPath = join(outDir, fileName);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, data);
    outputs.push(outPath);
  }
  return outputs;
}

export async function extractAtlasFromFile(
  plistPath: string,
  outDir: string,
  options: ExtractOptions & { pngPath?: string } = {},
): Promise<string[]> {
  const { pngPath, ...extractOptions } = options;
  const xml = await readFile(plistPath, 'utf-8');
  const atlas = parseAtlas(xml);
  const resolvedPng = pngPath
    ? resolve(pngPath)
    : resolve(dirname(plistPath), atlas.metadata.textureFileName);
  return extractAtlas(resolvedPng, atlas, outDir, extractOptions);
}
