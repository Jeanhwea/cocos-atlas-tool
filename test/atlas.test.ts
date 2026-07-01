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

const FORMAT_1 = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>frames</key>
    <dict>
        <key>b.png</key>
        <dict>
            <key>frame</key>
            <string>{{10,20},{30,40}}</string>
            <key>offset</key>
            <string>{0,0}</string>
            <key>sourceSize</key>
            <string>{30,40}</string>
        </dict>
    </dict>
    <key>metadata</key>
    <dict>
        <key>format</key>
        <integer>1</integer>
        <key>size</key>
        <string>{128,128}</string>
        <key>textureFileName</key>
        <string>b.png</string>
    </dict>
</dict>
</plist>`;

const FORMAT_0 = `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>frames</key>
    <dict>
        <key>c.png</key>
        <dict>
            <key>x</key>
            <integer>5</integer>
            <key>y</key>
            <integer>6</integer>
            <key>width</key>
            <integer>20</integer>
            <key>height</key>
            <integer>30</integer>
            <key>offsetX</key>
            <integer>1</integer>
            <key>offsetY</key>
            <integer>2</integer>
            <key>originalWidth</key>
            <integer>25</integer>
            <key>originalHeight</key>
            <integer>35</integer>
        </dict>
    </dict>
    <key>metadata</key>
    <dict>
        <key>format</key>
        <integer>0</integer>
        <key>size</key>
        <string>{64,64}</string>
        <key>textureFileName</key>
        <string>c.png</string>
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

  it('解析 format 1 图集', () => {
    const atlas = parseAtlas(FORMAT_1);
    expect(atlas.metadata.format).toBe(1);
    expect(atlas.frames[0]).toEqual({
      name: 'b.png',
      frame: { x: 10, y: 20, width: 30, height: 40 },
      rotated: false,
      offset: { x: 0, y: 0 },
      trimmedSize: { width: 30, height: 40 },
      sourceSize: { width: 30, height: 40 },
    });
  });

  it('解析 format 0 图集', () => {
    const atlas = parseAtlas(FORMAT_0);
    expect(atlas.metadata.format).toBe(0);
    expect(atlas.frames[0]).toEqual({
      name: 'c.png',
      frame: { x: 5, y: 6, width: 20, height: 30 },
      rotated: false,
      offset: { x: 1, y: 2 },
      trimmedSize: { width: 20, height: 30 },
      sourceSize: { width: 25, height: 35 },
    });
  });
});
