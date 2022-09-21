# react-scoped-css-loader
A webpack loader to build scoped css for react applications



# Objective
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
In simple terms `react-scoped-css-loader` identifies the valid classNames and append a hash value generated based on the configurations (check the configuration section for more details).

Basic configuration will generate a hash value based on the file path (Ex: `./index`) and append that hash at the end of the class name. Ex: `container-816e6e0ba3` 

If you want to share your component across multiple projects you can pass a `salt`(a unique string) and generate a unique hash value. 


## Configurations 
There are three configuration options. values for these options must be same for the both loaders. 

1. `salt` - a unique string - If you want to share your components across multiple projects make sure to pass a different salt for each project
2. `useGlobalHash` - accepts boolean value - default is false - if the value is true, you must pass a `salt`. When this option is enabled it will use the given salt to generate the hash (file path will not be used here). you will have a one global hash for the entire project
3. `exclude` - a list (array) of class name prefixes. if not provided library will use `app` as default value. This option will exclude class names that are prefixed with the given prefixes from appending the hash value. 


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
                            salt: "some random/unique string",
                            useGlobalHash: true,
                            exclude: ['app']
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
                            salt: "some random/unique string",
                            useGlobalHash: true,
                            exclude: ['app']
                        }
                    },
                    'ts-loader',
                ]
            },
        
        
        ]
    }


```

# Limitations 
Library will not evaluate the variables when excluding. instead it will use interpolations to append the hash value. So do not use variables if you want to exclude the classname assigned to that variable. 

This limitation is only if you want to exclude a classname form appending the hash value. example usage(usecase) will be to have some global styles for the project (check the global styles section for more details) .

```
// index.tsx 

// below code will not exclude the 'app-container' class and it will be appended with the hash value.

const appContainer = 'app-container'
<div className={appContainer}> 


// instead of above code use the classname directly 
<div className={'app-container'}> 

// you can do the same with other options (interpolation and classNames function) as well. They also will not be able to evealuate the varibles

```


# Global styles 
You can use `exclude` option in the configuration to have some global styles in your project. 

Update the configuration and pass the prefixes you want to use for global styling. Ex. `app` 

```
// webpack.config.js

...
{
    loader:  "react-scoped-css-loader/lib/script-loader",
    options: {
        exclude: ['app']
    }
},

```

then in you style sheet write your styles. prefix the classnames with `app` 

```
// global.scss 

.app-container {
    // your styles 
}

.app-header {
    // your styles
}

```

then use those styles anywhere 

```
// index.tsx

<div className='app-container'> </div>

```

```
// header.tsx 

<div claName='app-header'> </div>

```


# Contributing and Issues 
Feel free to report any issues or open a PR. 

This is a free and open source application. Just doing this for following reasons 

1. for anyone who is facing the same issues (scoped css in react) and couldn't find a better solution (including me :smiley: ) 
2. just to have fun, to understand how things work 

so enjoy. use, modify, re-destribute do what ever you want. 

just be civil :wink:!
