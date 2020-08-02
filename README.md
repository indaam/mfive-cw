# mfive-cw

Easier web compiler

## Background

By default when you want to use next dev tools like, es6, ts, pug or whatever it is. Is very annoying to setup. With this tools, we want to make it easy

## Install & require

- Require : node & npm or yarn
- Install : `npm install -g mfive-cw`

## Setup

### Setup New Project

For new project, just

- `npm init`, then
- `mfive init`

Will automaticly create config and source directory.
default directory for `source` is `src` and default `dev` is `public` and `build` for `build`

This is folder tree when run `mfive init`

### Setup Existing Project

If your source directory project is `src` just try `mfive -w`, it will scan your directory then automaticly create configuration.

But, if project doesnt have `src` directory, create `mfive.config.json` like this

```JSON
{
  "js": {
    "src": "your/js/source/path",
    "destination": "path/to/dest",
    "outputType": "js",
    "isAssets": false
  },
  "pug": {
    "src": "your/pug/source/path",
    "destination": "path/to/dest",
    "outputType": "html",
    "isAssets": false,
  },
  "sass": {
    "src": "your/sass/source/path",
    "destination": "path/to/dest",
    "outputType": "css",
    "isAssets": false
  },
  "images": {
    "src": "your/images/source/path",
    "destination": "path/to/dest",
    "outputType": "images",
    "isAssets": true // no complie, just copy & optimize on build
  },
}

```

## Config Options

[TODO]

### LOCAL Install & Usage

- `npm install -D mfive-cw` or
- `yarn add -D mfive-cw` or

on `package.json` add this

```
  ...
  "scripts": {
    "mfive": "yarn mfive",
    "start": "yarn mfive watch",
  },
```

Then, to watch type this
`yarn mfive -w`

## How it work?

By default it use default cli each tools, for example

- sass, use https://sass-lang.com/documentation/cli/dart-sass

This app, just make it simple. Read CONFIG DEFAULT

### CONFIG DEFAULT

#### saas

mfive.config.json

```
  ...
  "sass": {
    "src": "src/scss", // source of sass
    "destination": "dist/assets/css", // output target
  }
```

CLI output
`sass src/scss/*.scss dist/assets/css/[filename].css`

## CUSTOM SCRIPT?

On this version not support API, but can eject the scripts. When run `mfive eject[TODO]` it will move script to `your-project-dir/mfive-script` and can update it.
Then to watch, use `node mfive-script/index.js -w`

## mfive command

type `mfive -h` for command information

## TODO

- Optimize Build : minifiy js, css, compress images
- Custom Config

## Change Log & Version

1.0.0

- initial beta release
