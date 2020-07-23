# mfive-cw

Easier web compiler

## Background

By default when you want to use next dev tools like, es6, ts, pug or whatever it is. Is very annoying to setup. With this tools, we want to make it easy

## Install & require

- node & yarn
- `yarn add -D mfive-cw` or
- `npm install -D mfive-cw`

## Usage

on `package.json` add this

```
  ...
  "scripts": {
    "mfive": "yarn mfive",
    "start": "yarn mfive watch",
  },
```

Then, to watch use this
`yarn mfive watch`

or `yarn mfive build` to build

## Setup

!important, by default app will create auto-config `mfive.config.json` after scan src dir then create. But You can change your src dir & build target

## How it work?

By default, this app will scan `src` directory then create automatic setup base on type file. Example, will find js, will create babel compiler, also when find scss or pug file, will create automatic setup

## TODO

- Optimize Build
- Instal Global
- Custom Config

## Change Log & Version

1.0.0

- initial beta release
