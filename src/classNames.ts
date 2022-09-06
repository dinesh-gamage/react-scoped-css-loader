import { IClassNameExpression } from './utils';

export function classNames(...expressions: IClassNameExpression[]) {
  return expressions
    .map((exp) => {
      if (typeof exp === 'string') {
        return exp;
      } else {
        const classes: string[] = [];
        for (const key of Object.keys(exp)) {
          if (exp[key]) classes.push(key);
        }
        return classes.join(' ');
      }
    })
    .join(' ');
}
