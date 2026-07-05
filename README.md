# @jeansoft/cocos-atlas-tool

[![npm version](https://img.shields.io/npm/v/@jeansoft/cocos-atlas-tool.svg)](https://www.npmjs.com/package/@jeansoft/cocos-atlas-tool)
[![license](https://img.shields.io/npm/l/@jeansoft/cocos-atlas-tool.svg)](https://github.com/Jeanhwea/cocos-atlas-tool/blob/master/LICENSE)

解析 [Cocos Creator 图集(Atlas)](https://docs.cocos.com/creator/3.8/manual/zh/asset/atlas.html) 的工具库，将 cocos2d-x 的 `plist` 解析为结构化数据，兼容 format 0/1/2/3。

## 安装

```bash
pnpm add @jeansoft/cocos-atlas-tool
```

## 两个入口

- 主入口 `@jeansoft/cocos-atlas-tool`：纯解析 + 浏览器 Canvas 裁剪，**不依赖 sharp**，可用于浏览器 / Electron 渲染进程。
- Node 入口 `@jeansoft/cocos-atlas-tool/node`：基于 [sharp](https://sharp.pixelplumbing.com/) 的服务端批量导出，仅限 Node。

## 解析

```ts
import { readFileSync } from 'node:fs';
import { parseAtlas } from '@jeansoft/cocos-atlas-tool';

const atlas = parseAtlas(readFileSync('sheep.plist', 'utf-8'));
console.log(atlas.metadata.textureFileName);
for (const frame of atlas.frames) {
  console.log(frame.name, frame.frame, frame.rotated);
}
```

## 浏览器裁剪

```ts
import { parseAtlas, cropFrameToCanvas } from '@jeansoft/cocos-atlas-tool';

const atlas = parseAtlas(plistText);
const image = new Image();
image.src = pngObjectUrl;
await image.decode();

const canvas = cropFrameToCanvas(image, atlas.frames[0]);
document.body.appendChild(canvas as HTMLCanvasElement);
```

`cropFrameToCanvas(image, frame, options?)` 自动处理旋转帧，默认按 `offset` 还原到原始 `sourceSize`（`restoreOriginalSize: false` 则只裁剪实际像素）。`image` 支持 `HTMLImageElement` / `HTMLCanvasElement` / `ImageBitmap` / `OffscreenCanvas`。

## Node 导出

```ts
import { extractAtlasFromFile } from '@jeansoft/cocos-atlas-tool/node';

const files = await extractAtlasFromFile('车/车.plist', 'out');
console.log(`共导出 ${files.length} 张图片`);
```

导出自动处理旋转帧，默认按 `offset` 还原到原始 `sourceSize`。

## API

主入口（浏览器安全）：

- `parseAtlas(xml): Atlas` 解析 plist 文本。
- `cropFrameToCanvas(image, frame, options?)` Canvas 裁剪单帧。
- `frameRegion(frame): Rect` 返回帧在图集中的实际区域。
- `parsePlist(xml)` / `parseRect` / `parseSize` / `parsePoint` 底层解析辅助。

Node 入口（依赖 sharp）：

- `extractAtlasFromFile(plistPath, outDir, options?)` 读取 plist 与 png 并批量导出。
- `extractAtlas(image, atlas, outDir, options?)` 用已解析的 `Atlas` 批量导出。
- `extractFrame(image, frame, options?)` 导出单帧，返回 png `Buffer`。

## 数据结构

```ts
interface Atlas {
  frames: AtlasFrame[];
  metadata: AtlasMetadata;
}

interface AtlasFrame {
  name: string;
  frame: Rect;
  rotated: boolean;
  offset: Point;
  trimmedSize: Size;
  sourceSize: Size;
}
```

## 开发

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
pnpm format
```

## License

MIT
