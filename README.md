# react-scoped-css-loader

> **This package is deprecated.**
>
> Please migrate to [react-scoped-css](https://github.com/dinesh-gamage/react-scoped-css) — the v2 rewrite.

---

## Migrating to v2

v2 is a full rewrite with a better architecture, broader bundler support, and correct handling of all className patterns.

**What's different:**

| | v1 (`react-scoped-css-loader`) | v2 (`react-scoped-css`) |
|---|---|---|
| Approach | webpack-only custom loaders | Babel plugin + PostCSS plugin |
| Bundler support | webpack only | Vite, Next.js, webpack |
| className patterns | string literals, basic interpolation | all patterns — variables, ternaries, classNames(), template literals |
| SCSS | via sass-loader | auto-detected, no extra config |
| CSS Modules | may double-process | `.module.*` files skipped automatically |
| Hash stability | absolute file path | relative path — identical on all machines and in CI |
| Runtime helper | included in JSX output always | injected only when needed (static = zero runtime) |

**Migration steps:**

```bash
npm uninstall react-scoped-css-loader
npm install @dinesh-gamage/react-scoped-css
npx @dinesh-gamage/react-scoped-css init
```

`npx react-scoped-css init` detects your bundler (Vite, Next.js, or webpack) and prints the exact config snippet to add. No code changes needed in your components or stylesheets.

---

## v1 docs (archived)

The original v1 documentation is preserved below for reference.

<details>
<summary>Show v1 docs</summary>

### Objective

React is lacking the scoped css/styling feature. Even though there are other ways to achieve the scoped styling, there are bit tedious to implement.

Objective of this library is to give the developer a simple way to implement scoped css/styling to their react applications. You can keep working on the application and styles as you did earlier, `react-scoped-css-loader` will take care of the scoping.

### Usage

Install the library: `npm i react-scoped-css-loader`

Then update `webpack.config.js`:

```js
module: {
    rules: [
        {
            test: /\.(sa|sc|c)ss$/,
            use: [
                "style-loader",
                "css-loader",
                "react-scoped-css-loader/lib/style-loader",
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

### Configuration

```js
{
    loader: "react-scoped-css-loader/lib/script-loader",
    options: {
        salt: "some unique string",   // for sharing components across projects
        useGlobalHash: false,          // true = one hash for the whole project
        exclude: ['app']              // class name prefixes to leave unscoped
    }
}
```

Options must be the same for both loaders.

</details>

---

## License

ISC
