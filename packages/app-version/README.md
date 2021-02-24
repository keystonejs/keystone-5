<!--[meta]
section: api
subSection: utilities
title: App version plugin
[meta]-->

# App version plugin

> This is the last active development release of this package as **Keystone 5** is now in a 6 to 12 month active maintenance phase. For more information please read our [Keystone 5 and beyond](https://github.com/keystonejs/keystone-5/issues/21) post.

[![View changelog](https://img.shields.io/badge/changelogs.xyz-Explore%20Changelog-brightgreen)](https://changelogs.xyz/@keystonejs/app-version)

This package provides support for including a version string both as an HTTP response header and as a graphQL query.

The function `appVersionMiddleware(version)` will return a piece of middleware which will set the `X-Keystone-App-Version` response header to `version` on all HTTP requests.

The graphQL provider `AppVersionProvider` will add an `{ appVersion }` query to your graphQL API which returns `version` as a string.

## Usage

### Indirectly

This package is designed to be used indirectly via the conveniance API on the `Keystone` class:

```javascript
const keystone = new Keystone({
  appVersion: {
    version: '1.0.0',
    addVersionToHttpHeaders: true,
    access: true,
  },
});
```

### Directly

It can also be used directly if you would like to manually manage your middleware stack of graphQL providers.

```javascript
const { AppVersionProvider, appVersionMiddleware } = require('@keystonejs/app-version');

const version = '1.0.0';

app.use(appVersionMiddleware(version));

keystone._providers.push(
  new AppVersionProvider({
    version,
    access: true,
    schemaNames: ['public'],
  })
);
```
