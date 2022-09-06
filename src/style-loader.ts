import { LoaderContext } from 'webpack';
import { generateHash, ILoaderOptions } from './utils';

module.exports = function (this: LoaderContext<ILoaderOptions>, source: string): string {
  const options = this.getOptions();

  const validClassNameRegexp = /\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
  const hashValue = generateHash(this.resourcePath, options.salt);

  const updatedSource = source.replace(validClassNameRegexp, (match, contents) => {
    return match.trim() + '-' + hashValue;
  });

  return updatedSource;
};
