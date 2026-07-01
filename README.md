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

## 导出单张图片

从图集 png 中切割导出每个 SpriteFrame 为独立的 png 文件(基于 [sharp](https://sharp.pixelplumbing.com/)，仅支持 Node 环境）：

```ts
import { extractAtlasFromFile } from "@jeansoft/cocos-atlas-tool";

const files = await extractAtlasFromFile("车1/车1.plist", "out");
console.log(`共导出 ${files.length} 张图片`);
```

也可以手动控制数据来源：

```ts
import { readFileSync } from "node:fs";
import { parseAtlas, extractAtlas, extractFrame } from "@jeansoft/cocos-atlas-tool";

const atlas = parseAtlas(readFileSync("车1/车1.plist", "utf-8"));

await extractAtlas("车1/车1.png", atlas, "out");

const buffer = await extractFrame("车1/车1.png", atlas.frames[0]);
```

导出行为：

- 默认 `restoreOriginalSize: true`，会把裁剪后的图片按 `offset` 还原到原始 `sourceSize` 尺寸(带透明边距)。设为 `false` 则只导出图集中裁剪后的实际像素。
- 自动处理 `rotated` 旋转帧，导出时会转回正确方向。

## API

- `parseAtlas(xml): Atlas` 解析图集 plist 文本为结构化的 `Atlas` 对象。
- `extractAtlasFromFile(plistPath, outDir, options?)` 读取 plist 与 png 并批量导出，返回输出文件路径数组。
- `extractAtlas(image, atlas, outDir, options?)` 用已解析的 `Atlas` 批量导出，`image` 支持文件路径或 `Buffer`。
- `extractFrame(image, frame, options?)` 导出单个帧，返回 png `Buffer`。
- `parsePlist(xml): PlistValue` 将 Apple plist XML 解析为普通 JS 值。
- `parseRect / parseSize / parsePoint` 解析 cocos2d-x 的几何字符串，如 `{{0,0},{100,100}}`。

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
