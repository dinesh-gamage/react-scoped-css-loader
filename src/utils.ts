const path = require('path');
const { createHash } = require('crypto');

export interface ILoaderOptions {
    salt?: string
}

export type IClassNameExpression = string | { [key: string]: boolean }

export function generateHash(filePath: string, salt?: string): string {

    let dirPath = path.relative(process.cwd(), filePath)
    let ext = path.extname(dirPath)
    dirPath = dirPath.replace(ext, '').trim().toLowerCase()

    let hash = createHash('md5')
        .update(dirPath + (salt || ''))
        .digest('hex')
        .slice(0, 10)

    return hash
}
