import { XMLParser } from 'fast-xml-parser';

export type PlistValue = string | number | boolean | PlistValue[] | { [key: string]: PlistValue };

interface OrderedNode {
  [tag: string]: unknown;
  ':@'?: Record<string, string>;
  '#text'?: string | number;
}

const parser = new XMLParser({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: '',
  parseTagValue: false,
  trimValues: true,
});

function nodeTag(node: OrderedNode): string {
  const keys = Object.keys(node).filter((key) => key !== ':@');
  return keys[0] ?? '';
}

function nodeChildren(node: OrderedNode, tag: string): OrderedNode[] {
  const value = node[tag];
  return Array.isArray(value) ? (value as OrderedNode[]) : [];
}

function nodeText(node: OrderedNode, tag: string): string {
  const children = nodeChildren(node, tag);
  const text = children.find((child) => '#text' in child)?.['#text'];
  return text === undefined ? '' : String(text);
}

function convertValue(node: OrderedNode): PlistValue {
  const tag = nodeTag(node);
  switch (tag) {
    case 'dict':
      return convertDict(node);
    case 'array':
      return convertArray(node);
    case 'string':
      return nodeText(node, tag);
    case 'integer':
      return parseInt(nodeText(node, tag), 10);
    case 'real':
      return parseFloat(nodeText(node, tag));
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return nodeText(node, tag);
  }
}

function convertDict(node: OrderedNode): Record<string, PlistValue> {
  const children = nodeChildren(node, 'dict');
  const result: Record<string, PlistValue> = {};
  let pendingKey: string | null = null;
  for (const child of children) {
    const tag = nodeTag(child);
    if (!tag) {
      continue;
    }
    if (tag === 'key') {
      pendingKey = nodeText(child, tag);
      continue;
    }
    if (pendingKey !== null) {
      result[pendingKey] = convertValue(child);
      pendingKey = null;
    }
  }
  return result;
}

function convertArray(node: OrderedNode): PlistValue[] {
  const children = nodeChildren(node, 'array');
  const result: PlistValue[] = [];
  for (const child of children) {
    if (!nodeTag(child)) {
      continue;
    }
    result.push(convertValue(child));
  }
  return result;
}

export function parsePlist(xml: string): PlistValue {
  const tree = parser.parse(xml) as OrderedNode[];
  const plistNode = tree.find((node) => nodeTag(node) === 'plist');
  if (!plistNode) {
    throw new Error('无效的 plist 文件: 未找到 <plist> 根节点');
  }
  const rootChildren = nodeChildren(plistNode, 'plist').filter((child) => nodeTag(child));
  const rootValue = rootChildren[0];
  if (!rootValue) {
    throw new Error('无效的 plist 文件: <plist> 节点为空');
  }
  return convertValue(rootValue);
}
