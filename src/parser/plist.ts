import { parse, type PlistValue } from 'plist';

export type { PlistValue };

export function parsePlist(xml: string): PlistValue {
  return parse(xml);
}
