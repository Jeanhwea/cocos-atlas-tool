import { describe, expect, it } from "vitest";
import { parsePoint, parseRect, parseSize } from "../src/geometry.js";

describe("geometry", () => {
  it("parsePoint 解析带负数的坐标", () => {
    expect(parsePoint("{-3,-3}")).toEqual({ x: -3, y: -3 });
  });

  it("parseSize 解析尺寸", () => {
    expect(parseSize("{181,130}")).toEqual({ width: 181, height: 130 });
  });

  it("parseRect 解析嵌套矩形", () => {
    expect(parseRect("{{0,453},{105,84}}")).toEqual({
      x: 0,
      y: 453,
      width: 105,
      height: 84
    });
  });

  it("解析小数", () => {
    expect(parsePoint("{1.5,-2.25}")).toEqual({ x: 1.5, y: -2.25 });
  });

  it("空字符串回退为零", () => {
    expect(parseRect("")).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });
});
