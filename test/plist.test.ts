import { describe, expect, it } from 'vitest';
import { parsePlist } from '../src/plist.js';

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>name</key>
    <string>hello</string>
    <key>count</key>
    <integer>3</integer>
    <key>ratio</key>
    <real>1.5</real>
    <key>enabled</key>
    <true/>
    <key>disabled</key>
    <false/>
    <key>list</key>
    <array>
        <string>a</string>
        <string>b</string>
    </array>
    <key>nested</key>
    <dict>
        <key>x</key>
        <integer>1</integer>
    </dict>
</dict>
</plist>`;

describe('parsePlist', () => {
  it('解析各种类型并保持 dict 键值配对', () => {
    expect(parsePlist(XML)).toEqual({
      name: 'hello',
      count: 3,
      ratio: 1.5,
      enabled: true,
      disabled: false,
      list: ['a', 'b'],
      nested: { x: 1 },
    });
  });

  it('缺少 plist 根节点时抛错', () => {
    expect(() => parsePlist('<foo/>')).toThrow();
  });
});
