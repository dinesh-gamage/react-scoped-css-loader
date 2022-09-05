import { IClassNameExpression } from "./utils";

export function classNames(...expressions: IClassNameExpression[]) {
    let names = expressions.map(exp => {
        if (typeof exp == 'string') {
            return exp
        }
        else {
            let classes: string[] = []
            for (let key of Object.keys(exp)) {
                if (exp[key]) classes.push(key)
            }
            return classes.join(' ')
        }
    })
        .join(' ')

    return names
}