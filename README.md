# @jeansoft/cocos-atlas-tool

解析 [Cocos Creator 图集(Atlas)](https://docs.cocos.com/creator/3.8/manual/zh/asset/atlas.html) 资源的工具库。

Cocos Creator 的图集资源由 `plist` 和 `png` 文件组成，`plist` 使用 cocos2d-x 格式索引图集中每个 `SpriteFrame` 的位置信息。本库负责将 `plist` 文件解析为结构化数据，兼容 cocos2d-x 的 format 0/1/2/3。

## 安装

```bash
pnpm add @jeansoft/cocos-atlas-tool
```

## 使用

```ts
import { readFileSync } from "node:fs";
import { parseAtlas } from "@jeansoft/cocos-atlas-tool";

const xml = readFileSync("sheep.plist", "utf-8");
const atlas = parseAtlas(xml);

console.log(atlas.metadata.textureFileName);
for (const frame of atlas.frames) {
  console.log(frame.name, frame.frame, frame.rotated);
}
```

## 入口划分（重要）

本库拆分为两个入口，确保 `sharp` 不会被打进前端包：

- 主入口 `@jeansoft/cocos-atlas-tool`：纯解析 + 浏览器 Canvas 裁剪，**不依赖 sharp**，可安全用于浏览器 / Electron 渲染进程。
- Node 入口 `@jeansoft/cocos-atlas-tool/node`：基于 `sharp` 的服务端批量导出，仅可在 Node / 主进程使用。

前端只从主入口导入时，打包器在依赖解析阶段完全不会触及 `sharp`。

## 浏览器 Canvas 裁剪

在浏览器 / 渲染进程中用 `parseAtlas` 解析 plist，再用 Canvas 裁剪：

```ts
import { parseAtlas, cropFrameToCanvas } from "@jeansoft/cocos-atlas-tool";

const atlas = parseAtlas(plistText);

const image = new Image();
image.src = pngObjectUrl;
await image.decode();

const first = atlas.frames[0];
const canvas = cropFrameToCanvas(image, first);
document.body.appendChild(canvas as HTMLCanvasElement);
```

`cropFrameToCanvas(image, frame, options?)`：

- `image` 可为 `HTMLImageElement` / `HTMLCanvasElement` / `ImageBitmap` / `OffscreenCanvas`。
- 默认 `restoreOriginalSize: true`，按 `offset` 还原到原始 `sourceSize`；设为 `false` 只裁剪实际像素。
- 自动处理 `rotated` 旋转帧。
- 环境支持 `OffscreenCanvas` 时优先使用，否则回退到 `document.createElement("canvas")`。
- `frameRegion(frame)` 返回该帧在图集 png 中的实际区域（已考虑旋转），方便自定义绘制。

## Node 导出单张图片

从图集 png 中切割导出每个 SpriteFrame 为独立的 png 文件(基于 [sharp](https://sharp.pixelplumbing.com/)，仅 Node)：

```ts
import { extractAtlasFromFile } from "@jeansoft/cocos-atlas-tool/node";

const files = await extractAtlasFromFile("车1/车1.plist", "out");
console.log(`共导出 ${files.length} 张图片`);
```

也可以手动控制数据来源：

```ts
import { readFileSync } from "node:fs";
import { parseAtlas } from "@jeansoft/cocos-atlas-tool";
import { extractAtlas, extractFrame } from "@jeansoft/cocos-atlas-tool/node";

const atlas = parseAtlas(readFileSync("车1/车1.plist", "utf-8"));

await extractAtlas("车1/车1.png", atlas, "out");

const buffer = await extractFrame("车1/车1.png", atlas.frames[0]);
```

导出行为：

- 默认 `restoreOriginalSize: true`，会把裁剪后的图片按 `offset` 还原到原始 `sourceSize` 尺寸(带透明边距)。设为 `false` 则只导出图集中裁剪后的实际像素。
- 自动处理 `rotated` 旋转帧，导出时会转回正确方向。

## API

主入口 `@jeansoft/cocos-atlas-tool`（浏览器安全，无 sharp）：

- `parseAtlas(xml): Atlas` 解析图集 plist 文本为结构化的 `Atlas` 对象。
- `cropFrameToCanvas(image, frame, options?)` 浏览器 Canvas 裁剪单帧，返回 canvas。
- `frameRegion(frame): Rect` 返回帧在图集中的实际区域。
- `parsePlist(xml): PlistValue` 将 Apple plist XML 解析为普通 JS 值。
- `parseRect / parseSize / parsePoint` 解析 cocos2d-x 的几何字符串，如 `{{0,0},{100,100}}`。

Node 入口 `@jeansoft/cocos-atlas-tool/node`（依赖 sharp）：

- `extractAtlasFromFile(plistPath, outDir, options?)` 读取 plist 与 png 并批量导出，返回输出文件路径数组。
- `extractAtlas(image, atlas, outDir, options?)` 用已解析的 `Atlas` 批量导出，`image` 支持文件路径或 `Buffer`。
- `extractFrame(image, frame, options?)` 导出单个帧，返回 png `Buffer`。

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
```

## License

MIT
