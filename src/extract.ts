import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import sharp from 'sharp';
import { parseAtlas } from './atlas.js';
import type { Atlas, AtlasFrame } from './types.js';

export interface ExtractOptions {
  restoreOriginalSize?: boolean;
}

type ImageSource = string | Buffer;

async function loadBuffer(image: ImageSource): Promise<Buffer> {
  return typeof image === 'string' ? readFile(image) : image;
}

function regionSize(frame: AtlasFrame): { width: number; height: number } {
  const { width, height } = frame.trimmedSize;
  return frame.rotated ? { width: height, height: width } : { width, height };
}

export async function extractFrame(
  image: ImageSource,
  frame: AtlasFrame,
  options: ExtractOptions = {},
): Promise<Buffer> {
  const { restoreOriginalSize = true } = options;
  const buffer = await loadBuffer(image);
  const region = regionSize(frame);

  let sprite = sharp(buffer).extract({
    left: frame.frame.x,
    top: frame.frame.y,
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

  const left = Math.round((frame.sourceSize.width - frame.trimmedSize.width) / 2 + frame.offset.x);
  const top = Math.round((frame.sourceSize.height - frame.trimmedSize.height) / 2 - frame.offset.y);

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
