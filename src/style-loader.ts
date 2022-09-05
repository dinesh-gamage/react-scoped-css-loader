import { LoaderContext } from "webpack"
import { generateHash, ILoaderOptions } from "./utils"


module.exports = function (this: LoaderContext<ILoaderOptions>, source: string): string {

    let options = this.getOptions()

    let validClassNameRegexp = /\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g
    let hashValue = generateHash(this.resourcePath, options.salt)

    let updatedSource = source.replace(validClassNameRegexp, (match, contents) => {
        return match.trim() + '-' + hashValue
    })

    return updatedSource
}