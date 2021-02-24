<!--[meta]
section: api
subSection: apps
title: Next.js app
[meta]-->

# Next.js app

> This is the last active development release of this package as **Keystone 5** is now in a 6 to 12 month active maintenance phase. For more information please read our [Keystone 5 and beyond](https://github.com/keystonejs/keystone-5/issues/21) post.

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-next)

A KeystoneJS app for serving a [Next.js](https://nextjs.org/) application.

## Usage

```javascript
const { NextApp } = require('@keystonejs/app-next');

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({ enableDefaultRoute: false }),
    new NextApp({ dir: 'app' }),
  ],
  distDir,
};
```

### Config

| Option | Type     | Default | Required | Description                       |
| ------ | -------- | ------- | -------- | --------------------------------- |
| `dir`  | `String` | `null`  | `true`   | The directory of the Next.js app. |
