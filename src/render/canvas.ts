import { frameRegion, restorePlacement } from '../core/layout.js';
import type { AtlasFrame } from '../core/types.js';

export type CanvasImageSource =
  HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas;

export interface CropOptions {
  restoreOriginalSize?: boolean;
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  throw new Error('当前环境不支持 Canvas，cropFrameToCanvas 仅可在浏览器中使用');
}

function context2d(canvas: AnyCanvas): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) {
    throw new Error('无法获取 2D 渲染上下文');
  }
  return ctx;
}

function drawUpright(image: CanvasImageSource, frame: AtlasFrame): AnyCanvas {
  const region = frameRegion(frame);
  const { width, height } = frame.trimmedSize;
  const canvas = createCanvas(width, height);
  const ctx = context2d(canvas);

  if (frame.rotated) {
    ctx.translate(0, height);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(
      image,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height,
    );
  } else {
    ctx.drawImage(image, region.x, region.y, region.width, region.height, 0, 0, width, height);
  }

  return canvas;
}

export function cropFrameToCanvas(
  image: CanvasImageSource,
  frame: AtlasFrame,
  options: CropOptions = {},
): AnyCanvas {
  const { restoreOriginalSize = true } = options;
  const upright = drawUpright(image, frame);

  if (!restoreOriginalSize) {
    return upright;
  }

  const canvas = createCanvas(frame.sourceSize.width, frame.sourceSize.height);
  const ctx = context2d(canvas);
  const { x, y } = restorePlacement(frame);
  ctx.drawImage(upright as CanvasImageSource, x, y);
  return canvas;
}
