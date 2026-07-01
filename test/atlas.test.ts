import { describe, expect, it } from 'vitest';
import { parseAtlas } from '../src/atlas.js';

const FORMAT_3 = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>frames</key>
    <dict>
        <key>car_01.png</key>
        <dict>
            <key>aliases</key>
            <array/>
            <key>spriteOffset</key>
            <string>{-3,-3}</string>
            <key>spriteSize</key>
            <string>{105,84}</string>
            <key>spriteSourceSize</key>
            <string>{181,130}</string>
            <key>textureRect</key>
            <string>{{0,453},{105,84}}</string>
            <key>textureRotated</key>
            <false/>
        </dict>
    </dict>
    <key>metadata</key>
    <dict>
        <key>format</key>
        <integer>3</integer>
        <key>realTextureFileName</key>
        <string>car.png</string>
        <key>size</key>
        <string>{512,1024}</string>
        <key>textureFileName</key>
        <string>car.png</string>
    </dict>
</dict>
</plist>`;

const FORMAT_2 = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>frames</key>
    <dict>
        <key>a.png</key>
        <dict>
            <key>frame</key>
            <string>{{10,20},{30,40}}</string>
            <key>offset</key>
            <string>{1,-2}</string>
            <key>rotated</key>
            <true/>
            <key>sourceColorRect</key>
            <string>{{0,0},{40,30}}</string>
            <key>sourceSize</key>
            <string>{50,60}</string>
        </dict>
    </dict>
    <key>metadata</key>
    <dict>
        <key>format</key>
        <integer>2</integer>
        <key>size</key>
        <string>{256,256}</string>
        <key>textureFileName</key>
        <string>a.png</string>
    </dict>
</dict>
</plist>`;

describe('parseAtlas', () => {
  it('解析 format 3 图集', () => {
    const atlas = parseAtlas(FORMAT_3);
    expect(atlas.metadata).toEqual({
      format: 3,
      size: { width: 512, height: 1024 },
      textureFileName: 'car.png',
      realTextureFileName: 'car.png',
    });
    expect(atlas.frames).toHaveLength(1);
    expect(atlas.frames[0]).toEqual({
      name: 'car_01.png',
      frame: { x: 0, y: 453, width: 105, height: 84 },
      rotated: false,
      offset: { x: -3, y: -3 },
      trimmedSize: { width: 105, height: 84 },
      sourceSize: { width: 181, height: 130 },
    });
  });

  it('解析 format 2 图集并处理旋转帧的裁剪尺寸', () => {
    const atlas = parseAtlas(FORMAT_2);
    expect(atlas.metadata.format).toBe(2);
    expect(atlas.frames[0]).toEqual({
      name: 'a.png',
      frame: { x: 10, y: 20, width: 30, height: 40 },
      rotated: true,
      offset: { x: 1, y: -2 },
      trimmedSize: { width: 40, height: 30 },
      sourceSize: { width: 50, height: 60 },
    });
  });
});
