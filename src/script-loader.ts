import { LoaderContext } from "webpack";
import { generateHash, ILoaderOptions } from "./utils";

module.exports = function (this: LoaderContext<ILoaderOptions>, source: string): string {
    let options = this.getOptions()

    const validCSSClassNameRegexp = /\-?[_a-zA-Z]+[_a-zA-Z0-9-]*/
    const classNameVariableRegexp = /className:\s([a-zA-Z_$][0-9a-zA-Z_$]*)\s/g
    const classNamesFunctionRegexp = /className:\s[a-zA-Z_$][0-9a-zA-Z_$]*.classNames\((.*?)\)/g
    const simpleClassNameStringRegexp = /className:\s["'](.*?)["']/g
    const interpollatedClassNameRegexp = /className:\s[`](.*?)[`]/g
    const expressionRegexp = /\${(.*?)}/g
    const stringRegex = /["'](.*?)["']/
    const objectRegex = /\{(.*?)\}/
    const classNamesRegex = /.classNames\((.*?)\)/

    let hashValue = generateHash(this.resourcePath, options.salt)

    let updatedSource = source

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
        let updatedNames = findValidNamesAndAppendHash(content)
        return 'className: "' + updatedNames + '"'
    })

    /**
     * handl interpolations 
     * Ex: className={'container {hasHeader: 'has-header': ''} ${theme} '}
     * 
     * Here we won't evaluate the interpolation.
     * we are removeing all the white spaces from the matched content and append the hash value at the end.
     * 
     * If we dont have a value/classname in any of the conditions it will just append the class 
     */

    updatedSource = updatedSource.replace(interpollatedClassNameRegexp, (match, content) => {

        // find and replace expressions with white space 
        let expressions: string[] = []

        content = (content as string).replace(expressionRegexp, (match, content) => {
            expressions.push(match)
            return ''
        })

        let updatedNames = findValidNamesAndAppendHash(content).split(' ')

        for (let exp of expressions) {
            // hack to avoid processing interpolations :D
            updatedNames.push(appendHash(exp.replace(/ /g, '')))
        }

        return 'className: `' + updatedNames.join(' ') + '`'
    })

    /**
     * handle variables 
     * 
     * Ex: className={theme}
     * 
     */
    updatedSource = updatedSource.replace(classNameVariableRegexp, (match, content) => {
        console.log('match', match);
        let updatedName = appendHash(`\${${content}}`)
        return 'className: `' + updatedName + '`'
    })


    /**
     * classNames function 
     * 
     * Ex: className={classNames('container', theme, {'has-header': hasHeader})}
     */
    updatedSource = updatedSource.replace(classNamesFunctionRegexp, (match, content) => {

        let expressions: string[] = []

        let updated: string = match.replace(classNamesRegex, (match: string, content: string) => {

            // find objects and replace with white space 
            content = content.replace(objectRegex, (match) => {
                expressions.push(match)
                return ''
            })

            let updatedNames = content.split(",")
                .map(name => {
                    if (name.trim().length == 0) return
                    if (stringRegex.test(name)) {
                        return name.replace(stringRegex, (match, content) => {
                            return '\'' + appendHash(content) + '\''
                        })
                    }
                    return '`' + appendHash('${' + name.trim() + '}') + '`'
                })
                .filter(name => !!name)

            for (let exp of expressions) {
                let updatedExpressions = exp.replace(objectRegex, (match: string, content: string) => {

                    let names = content.split(",")
                        .map(keyValue => {
                            let [name, condition] = keyValue.split(":", 2)
                            if (name.trim().length == 0) return
                            if (stringRegex.test(name)) {
                                return name.replace(stringRegex, (match, content) => {
                                    return '\'' + appendHash(content.trim()) + '\':' + condition
                                })
                            }
                            return '[`' + appendHash('${' + name.trim() + '}') + '`]:' + condition
                        })
                        .filter(name => !!name)
                        .join(", ")

                    return '{' + names + '}'
                })

                updatedNames.push(updatedExpressions)
            }

            return '.classNames(' + updatedNames.join(', ') + ')'
        })
        return updated
    })


    function appendHash(className: string) {
        return className = className + '-' + hashValue
    }

    function findValidNamesAndAppendHash(content: string) {
        let updated = content.split(' ')
            .map(className => {
                // check if a valid css classname and append hash
                if (!!className && validCSSClassNameRegexp.test(className.trim())) {
                    className = appendHash(className)
                }
                return className.trim()
            })
            .join(" ")

        return updated
    }


    return updatedSource
}