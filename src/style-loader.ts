import { LoaderContext } from 'webpack';
import { generateHash, ILoaderOptions, validateOptions } from './utils';

module.exports = function (this: LoaderContext<ILoaderOptions>, source: string): string {
  const options = this.getOptions();
  const logger = this.getLogger()

  validateOptions(options, logger)

  const validClassNameRegexp = /\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g;
  const hashValue = generateHash(this.resourcePath, options);

  const updatedSource = source.replace(validClassNameRegexp, (match, contents) => {

    let exclude = options.exclude || []
    if(exclude.length == 0) exclude = ['app']

    for(const prefix of exclude){
      if(match.startsWith(`.${prefix.trim()}-`)) {
        return match
      }
    }

    return match.trim() + '-' + hashValue;
  });

  return updatedSource;
};
