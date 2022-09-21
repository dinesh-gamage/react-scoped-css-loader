import path = require('path');
import { createHash } from 'crypto';
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
  useGlobalHash?: boolean;
  /**
   * optional
   *
   * expected a list of classname preix. if not provided 'app' will be used as the default value
   * can use this to skip appending hash values to classnames
   *
   */
  exclude?: string[];
}

export type IClassNameExpression = string | { [key: string]: boolean };

export function generateHash(filePath: string, options: ILoaderOptions): string {
  let dirPath = path.relative(process.cwd(), filePath);
  const ext = path.extname(dirPath);
  dirPath = dirPath.replace(ext, '').trim().toLowerCase();

  const { salt, useGlobalHash } = options;

  let hashableString = dirPath + (salt || '');
  if (useGlobalHash) hashableString = salt || '';

  return createHash('md5').update(hashableString).digest('hex').slice(0, 10);
}

// Describe your loader's options in a JSON Schema.
const schema: any = {
  $id: 'http://json-schema.org/draft-06/schema#',
  $schema: 'http://json-schema.org/draft-06/schema#',
  $ref: '#/definitions/Options',
  definitions: {
    Options: {
      type: 'object',
      additionalProperties: false,
      properties: {
        salt: {
          type: 'string',
        },
        useGlobalHash: {
          type: 'boolean',
        },
        exclude: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: [],
      title: 'Options',
    },
  },
};

function isStringArray(array: any[]) {
  return array.every((val) => typeof val === 'string');
}

const keys = ['salt', 'useGlobalHash', 'exclude'];
function hasAdditionalParams(options: ILoaderOptions) {
  const optKeys = Object.keys(options);
  const extraKeys = optKeys.filter((k) => keys.indexOf(k) === -1);
  return { hasExtraParams: extraKeys.length > 0, extraKeys };
}

export function validateOptions(options: ILoaderOptions) {
  const { salt, useGlobalHash, exclude } = options;

  const { hasExtraParams, extraKeys } = hasAdditionalParams(options);
  if (hasExtraParams) {
    throw new Error(
      'Invalid configuration. allowed options are : ' +
        JSON.stringify(keys) +
        '. Remove these invalid options : ' +
        JSON.stringify(extraKeys),
    );
  }

  if (salt !== undefined && typeof salt !== 'string') {
    throw new Error('`salt` must be a string');
  }

  if (useGlobalHash !== undefined && typeof useGlobalHash !== 'boolean') {
    throw new Error('`useGlobalHash` must be a boolean');
  }

  if (exclude !== undefined && exclude.length > 0 && !isStringArray(exclude)) {
    throw new Error('`exclude` must be a array of strings');
  }

  if (useGlobalHash && (!salt || salt?.trim().length === 0)) {
    throw new Error('`salt` is required when `useGlobalHash` is enabled.');
  }
}
