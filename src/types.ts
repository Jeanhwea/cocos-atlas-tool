export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AtlasFrame {
  name: string;
  frame: Rect;
  rotated: boolean;
  offset: Point;
  sourceColorRect: Rect;
  sourceSize: Size;
}

export interface AtlasMetadata {
  format: number;
  size: Size;
  textureFileName: string;
  realTextureFileName?: string;
}

export interface Atlas {
  frames: AtlasFrame[];
  metadata: AtlasMetadata;
}
