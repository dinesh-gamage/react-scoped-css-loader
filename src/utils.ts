import path = require('path');
import { createHash } from 'crypto';

export interface ILoaderOptions {
  salt?: string;
}

export type IClassNameExpression = string | { [key: string]: boolean };

export function generateHash(filePath: string, salt?: string): string {
  let dirPath = path.relative(process.cwd(), filePath);
  const ext = path.extname(dirPath);
  dirPath = dirPath.replace(ext, '').trim().toLowerCase();

  return createHash('md5')
    .update(dirPath + (salt || ''))
    .digest('hex')
    .slice(0, 10);
}
