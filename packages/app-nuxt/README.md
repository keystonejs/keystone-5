<!--[meta]
section: api
subSection: apps
title: Nuxt.js app
[meta]-->

# Nuxt.js app

> This is the last active development release of this package as **Keystone 5** is now in a 6 to 12 month active maintenance phase. For more information please read our [Keystone 5 and beyond](https://github.com/keystonejs/keystone-5/issues/21) post.

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-nuxt)

## Usage

```javascript
const { NuxtApp } = require('@keystonejs/app-nuxt');

const config = {
  srcDir: 'src',
  buildDir: 'dist',
};

module.exports = {
  keystone,
  apps: [new GraphQLApp(), new AdminUIApp(), new NuxtApp(config)],
};
```

### Config

A config object can be passed to the `NuxtApp` instance. Documentation for the `nuxtConfig` options is available on the [NuxtJS documentation website](https://nuxtjs.org/guide/configuration).
