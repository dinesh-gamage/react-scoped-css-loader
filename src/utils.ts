import path = require('path');
import { createHash } from 'crypto';
import { exit } from 'process';
const { validate } = require('schema-utils')

export interface ILoaderOptions {
  /**
   * optional
   * unique string to use in the hasing function 
   */
  salt?: string;
  /**
   * optional 
   * default is false 
   * 
   * if the value is true library will skip filename hashing and will use the salt value instead 
   * salt is required if the value is true
   */
  useGlobalHash?: boolean,
  /**
   * optional 
   * 
   * expected a list of classname preix. if not provided 'app' will be used as the default value  
   * can use this to skip appending hash values to classnames  
   *  
   */
  exclude?: Array<string>
}

export type IClassNameExpression = string | { [key: string]: boolean };

export function generateHash(filePath: string, options: ILoaderOptions): string {
  let dirPath = path.relative(process.cwd(), filePath);
  const ext = path.extname(dirPath);
  dirPath = dirPath.replace(ext, '').trim().toLowerCase();

  const { salt, useGlobalHash } = options

  let hashableString = dirPath + (salt || '')
  if (useGlobalHash) hashableString = salt || ''

  return createHash('md5')
    .update(hashableString)
    .digest('hex')
    .slice(0, 10);
}

// Describe your loader's options in a JSON Schema.
const schema = {
  properties: {
    salt: {
      type: "string"
    },
    useGlobalHash: {
      type: "boolean"
    },
    exclude: {
      type: "array",
      items: [
        {
          type: "string"
        }
      ]
    }
  },
  required: [
  ]
}

export function validateOptions(options: ILoaderOptions, logger: any) {

  validate(schema, options)

  const { salt, useGlobalHash } = options
  if (useGlobalHash && (!salt || salt?.trim().length == 0)) {
    throw new Error("`salt` is required when `useGlobalHash` is enabled.")
  }
}