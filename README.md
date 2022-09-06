# react-scoped-css-loader
A webpack loader to build scoped css for react applications



# Ojective
React is lacking the scoped css/styling feature. Even though there are other ways to achive the scoped styling, there are bit tedious to implement.

I'm working with react applications on daily basis and couldn't find a better sollution. I wanted to build a simple solution. This has only been tested (so far) with a react/typescript application which uses sass.


Object of this library to give the developer a simple way to implement scoped css/styling to their react applications. You can keep working on the applcation and styles as you did earlier, `react-scope-css-loader` will take care of the scoping :smiley:


# Usage 

Install the library `npm i react-scoped-css-loader`

Then update the `webpack.config.js` file.

This has two loaders 

1. style-loader (react-scoped-css-loader/lib/style-loader) 
2. script-loader (react-scoped-css-loader/lib/script-loader) 


## style-loader 
`style-loader` will handle the style sheets (tested with sass). Add the loader after `css-loader` and before `sass-loader`

## script-loader 
`script-loader` will handle the scripts (tested with typescript). Add the loader before the `ts-loader`


## example 
```
// webpack.config.js

 module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "react-scoped-css-loader/lib/style-loader"
                    "sass-loader"
                ],
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    "react-scoped-css-loader/lib/script-loader",
                    'ts-loader',
                ]
            },
        
        
        ]
    }


```

now create a stylesheet with the same file name as `.tsx` file and start writing your styles. 


### basic usage
```
// index.tsx 

<div className="container"> </div>


// or you can use variables  
const containerClass = "container" 

<div className={containerClass}></div>

```


```
// index.scss

.conatainer {
    // your styles
}
```


### with interpolation

```
// index.tsx 

const [hasHeader, setHasHeader] = useState(false);

<div className={`container ${hasHeader ? 'has-header' : ''}`}>


// or 

const containerClass = "container" 
const [hasHeader, setHasHeader] = useState(false);

<div className={`${containerClass} ${hasHeader ? 'has-header' : ''}`}>

```

```
// index.scss

.conatainer {
    // your styles

    &.has-header {
        // your styles
    }
}

```


### use classNames function 
`react-scoped-css-loader` has a `classNames` functiction to apply class names conditionally

```
// index.tsx 

import { classNames } from "react-scoped-css-loader";

const [hasHeader, setHasHeader] = useState(false);

<div className={classNames("container", { "has-header": hasHeader })}> </div>

```


## How this works  
`react-scoped-css-loader` will generate a hash value based on the file path (Ex: `./index`) and append that hash at the end of the class name. Ex: `container-816e6e0ba3` 

So if you are sharing your components across multiple projects/applications hash value could be the same if the file paths are same. Project A can have a index.tsx and Project B can have a index.tsx, so the hash will be same. to avoid colitions we can pass a unique key as a configuration. Please check the configurations section.

## Configurations 
`react-scoped-css-loader`  allows you to configure a `salt` - a unique key (can be any string values. make sure to use different salt in different projects)

Make sure that you pass the same `salt` value to both loader 


```
// webpack.config.js

 module: {
        rules: [
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader:  "react-scoped-css-loader/lib/style-loader",
                        options: {
                            salt: "some random/unique string "
                        }
                    },
                   
                    "sass-loader"
                ],
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader:  "react-scoped-css-loader/lib/script-loader",
                        options: {
                            salt: "some random/unique string "
                        }
                    },
                    'ts-loader',
                ]
            },
        
        
        ]
    }


```


# Contributing and Issues 
Feel free to report any issues or open a PR. 

This is a free and open source application. Just doing this for following reasons 

1. for anyone who is facing the same issues (scoped css in react) and couldn't find a better solution (including me :smiley: ) 
2. just to have fun, to understand how things work 

so enjoy. use, modify, re-destribute do what ever you want. 

just be civil :wink:!
