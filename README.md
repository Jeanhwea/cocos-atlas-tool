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

## API

- `parseAtlas(xml: string): Atlas` 解析图集 plist 文本为结构化的 `Atlas` 对象。
- `parsePlist(xml: string): PlistValue` 将 Apple plist XML 解析为普通 JS 值。
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
