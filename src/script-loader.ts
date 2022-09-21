import { LoaderContext } from 'webpack';
import { generateHash, ILoaderOptions, validateOptions } from './utils';

module.exports = function (this: LoaderContext<ILoaderOptions>, source: string): string {
  const options = this.getOptions();

  validateOptions(options);

  const validCSSClassNameRegexp = /\-?[_a-zA-Z]+[_a-zA-Z0-9-]*/;
  const classNameVariableRegexp = /className:\s([a-zA-Z_$][0-9a-zA-Z_$]*)\s/g;
  const classNamesFunctionRegexp = /className:\s[a-zA-Z_$][0-9a-zA-Z_$]*.classNames\((.*?)\)/g;
  const simpleClassNameStringRegexp = /className:\s["'](.*?)["']/g;
  const interpollatedClassNameRegexp = /className:\s[`](.*?)[`]/g;
  const expressionRegexp = /\${(.*?)}/g;
  const stringRegex = /["'](.*?)["']/;
  const objectRegex = /\{(.*?)\}/;
  const classNamesRegex = /.classNames\((.*?)\)/;
  const ternaryRegex = /{(.*?)\?(.*?):(.*?)}/g;

  const hashValue = generateHash(this.resourcePath, options);

  let updatedSource = source;

  let exclude = options.exclude || [];
  if (exclude.length === 0) exclude = ['app'];

  /**
   * className attribute can contains
   * - variables
   * - strings
   * - interpolations (conditional classes)
   *
   * let's handle them :)
   */

  /**
   * handle strings/simple class names
   * Ex : className={'container has-header'}
   */

  updatedSource = updatedSource.replace(simpleClassNameStringRegexp, (match, content) => {
    const updatedNames = findValidNamesAndAppendHash(content);
    return 'className: "' + updatedNames + '"';
  });

  /**
   * handl interpolations
   * Ex: className={'container {hasHeader: 'has-header': ''} ${theme} '}
   *
   * Here we won't evaluate the interpolation.
   * we are removeing all the white spaces from the matched content and append the hash value at the end.
   *
   * If we dont have a value/classname in any of the conditions it will just append the class
   */

  updatedSource = updatedSource.replace(interpollatedClassNameRegexp, (match: string, content: string) => {
    // find and replace expressions with white space
    const { expressions, remainingContent } = filterExpressions(content, expressionRegexp);
    const updatedNames = findValidNamesAndAppendHash(remainingContent).split(' ');

    for (const exp of expressions) {
      // extract groups from expression
      const matches = ternaryRegex.exec(exp);
      if (matches) {
        const condition = matches[1]?.replace(/"/g, '').trim();
        const trueValue = findVariblesAndNamesAndAppendHash(matches[2]?.replace(/"/g, '').trim());
        const falseValue = findVariblesAndNamesAndAppendHash(matches[3]?.replace(/"/g, '').trim());

        updatedNames.push(`\${${condition}? ${trueValue}: ${falseValue}}`);
      } else {
        // if not groups found
        // hack to avoid processing interpolations :D
        updatedNames.push(appendHash(exp.replace(/ /g, '')));
      }
    }

    return 'className: `' + updatedNames.join(' ').replace(/  +/g, ' ') + '`';
  });

  /**
   * handle variables
   *
   * Ex: className={theme}
   *
   */
  updatedSource = updatedSource.replace(classNameVariableRegexp, (match: string, content: string) => {
    const updatedName = appendHash(`\${${content}}`);
    return 'className: `' + updatedName + '`';
  });

  /**
   * classNames function
   *
   * Ex: className={classNames('container', theme, {'has-header': hasHeader})}
   */
  updatedSource = updatedSource.replace(classNamesFunctionRegexp, (match: string, content: string) => {
    const updated: string = match.replace(classNamesRegex, (classMatch: string, classContent: string) => {
      const { expressions, remainingContent } = filterExpressions(content, objectRegex);
      const updatedNames = remainingContent
        .split(',')
        .map((name) => {
          if (name.trim().length === 0) return;
          return findVariblesAndNamesAndAppendHash(name);
        })
        .filter((name) => !!name);

      for (const exp of expressions) {
        const updatedExpressions = exp.replace(objectRegex, (objExpMatch: string, objExpContent: string) => {
          const names = objExpContent
            .split(',')
            .map((keyValue) => {
              const [name, condition] = keyValue.split(':', 2);
              if (name.trim().length === 0) return;
              // string
              if (stringRegex.test(name)) {
                return name.replace(stringRegex, (objMatch, objContent) => {
                  if (canExclude(objContent))
                    return "'" + findValidNamesAndAppendHash(objContent.trim()) + "':" + condition;
                  return "'" + appendHash(findValidNamesAndAppendHash(objContent.trim())) + "':" + condition;
                });
              }
              // variable
              return '[`' + appendHash('${' + name.trim() + '}') + '`]:' + condition;
            })
            .filter((name) => !!name)
            .join(', ');

          return '{' + names + '}';
        });

        updatedNames.push(updatedExpressions);
      }

      return '.classNames(' + updatedNames.join(', ') + ')';
    });
    return updated;
  });

  function canExclude(name: string) {
    let canExcludeName = false;
    for (const prefix of exclude) {
      if (name.startsWith(`${prefix.trim()}-`)) {
        canExcludeName = true;
        break;
      }
    }
    return canExcludeName;
  }

  function appendHash(className: string) {
    return (className = className + '-' + hashValue);
  }

  function findValidNamesAndAppendHash(content: string) {
    const updated = content
      .split(' ')
      .map((className) => {
        // check if a valid css classname and append hash
        if (!!className && validCSSClassNameRegexp.test(className.trim())) {
          if (!canExclude(className)) className = appendHash(className);
        }
        return className.trim();
      })
      .join(' ');

    return updated;
  }

  function findVariblesAndNamesAndAppendHash(content: string) {
    if (stringRegex.test(content)) {
      content = content.replace(stringRegex, (match, className) => {
        return "'" + findValidNamesAndAppendHash(className) + "'";
      });
    } else {
      content = '`' + appendHash('${' + content.trim() + '}') + '`';
    }
    return content;
  }

  function filterExpressions(content: string, expRegex: RegExp) {
    const expressions: string[] = [];
    const remainingContent = content.replace(expRegex, (expMatch: string, expContent: string) => {
      expressions.push(expMatch);
      return '';
    });

    return { expressions, remainingContent };
  }

  return updatedSource;
};
