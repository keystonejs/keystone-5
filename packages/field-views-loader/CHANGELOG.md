# @keystonejs/field-views-loader

## 6.1.2

### Patch Changes

- [#95](https://github.com/keystonejs/keystone-5/pull/95) [`c8ff78b95`](https://github.com/keystonejs/keystone-5/commit/c8ff78b95af5d56d44bbc11c51e7cf28b81323b4) Thanks [@bladey](https://github.com/bladey)! - Renamed branch `master` to `main`.

## 6.1.1

### Patch Changes

- [#95](https://github.com/keystonejs/keystone-5/pull/95) [`a890b0576`](https://github.com/keystonejs/keystone-5/commit/a890b057628b60c2d1870cc3f5afd8e87b03f7df) Thanks [@bladey](https://github.com/bladey)! - Renamed branch `master` to `main`.

## 6.1.0

### Minor Changes

- [`345a5f0f6`](https://github.com/keystonejs/keystone-5/commit/345a5f0f66a34c75696230ad2fcfb7a2eac86cb4) [#23](https://github.com/keystonejs/keystone-5/pull/23) Thanks [@bladey](https://github.com/bladey)! - Keystone 5 is now in a 6 to 12 month active maintenance phase, packages will no longer have active development releases. For more information please read our Keystone 5 and beyond post located here - https://github.com/keystonejs/keystone-5/issues/21

## 6.0.2

### Patch Changes

- [`04bf1e4bb`](https://github.com/keystonejs/keystone-5/commit/04bf1e4bb0223f4e2e06664bbc9e95c51118eb84) [#2](https://github.com/keystonejs/keystone-5/pull/2) Thanks [@bladey](https://github.com/bladey)! - Updated repository URL in package.json.

## 6.0.1

### Patch Changes

- [`4f6883dc3`](https://github.com/keystonejs/keystone-5/commit/4f6883dc38962805f96256f9fdf42fb77bb3326a) [#3610](https://github.com/keystonejs/keystone-5/pull/3610) Thanks [@renovate](https://github.com/apps/renovate)! - Updated dependency `prettier` to `^2.1.1`.

## 6.0.0

### Major Changes

- [`08087998`](https://github.com/keystonejs/keystone-5/commit/08087998af0045aa45b26d721f75639cd279ae1b) [#2881](https://github.com/keystonejs/keystone-5/pull/2881) Thanks [@timleslie](https://github.com/timleslie)! - The default function in `@keystonejs/field-views-loader` now takes `{ pages, hooks, listViews }` rather than `{ adminMeta }`.
  `AdminUIApp` now has a method `.getAdminViews({ keystone, includeLists })` which returns these values.
  `AdminUIApp.createDevMiddleware` now takes `{ adminMeta, keystone }` as arguments.
  These changes will only effect users who may have explicitly been using the `@keystone/fields-views-loader` packages or `.createDevMiddleware()`.

### Patch Changes

- [`5d1efd48`](https://github.com/keystonejs/keystone-5/commit/5d1efd48a11d7688b95cb51a949b039b030caf69) [#2918](https://github.com/keystonejs/keystone-5/pull/2918) Thanks [@timleslie](https://github.com/timleslie)! - Upgraded `loader-utils` to `2.0.0`.

## 5.2.1

### Patch Changes

- [`5ba330b8`](https://github.com/keystonejs/keystone-5/commit/5ba330b8b2609ea0033a636daf9a215a5a192c20) [#2487](https://github.com/keystonejs/keystone-5/pull/2487) Thanks [@Noviny](https://github.com/Noviny)! - Small changes to package.json (mostly adding a repository field)

## 5.2.0

### Minor Changes

- [`517b23e4`](https://github.com/keystonejs/keystone-5/commit/517b23e4b17414ed1807e8d7af1e67377ba3b7bf) [#2391](https://github.com/keystonejs/keystone-5/pull/2391) Thanks [@timleslie](https://github.com/timleslie)! - Removed support for Node 8.x, as it is [no longer in maintenance mode](https://nodejs.org/en/about/releases/).

## 5.1.0

### Minor Changes

- [`7c46673b`](https://github.com/keystonejs/keystone-5/commit/7c46673b927b08f3f7628ae2557156262f2e1049) [#2002](https://github.com/keystonejs/keystone-5/pull/2002) Thanks [@MadeByMike](https://github.com/MadeByMike)! - Added loading of hooks to `allViews`.

## 5.0.0

### Major Changes

- [`7b4ed362`](https://github.com/keystonejs/keystone-5/commit/7b4ed3623f5774d7783c39962bfa1ce97938e310) [#1821](https://github.com/keystonejs/keystone-5/pull/1821) Thanks [@jesstelford](https://github.com/jesstelford)! - Release @keystonejs/\* packages (つ＾ ◡ ＾)つ

  - This is the first release of `@keystonejs/*` packages (previously `@keystone-alpha/*`).
  - All packages in the `@keystone-alpha` namespace are now available in the `@keystonejs` namespace, starting at version `5.0.0`.
  - To upgrade your project you must update any `@keystone-alpha/*` dependencies in `package.json` to point to `"@keystonejs/*": "^5.0.0"` and update any `require`/`import` statements in your code.

# @keystone-alpha/field-views-loader

## 2.2.1

### Patch Changes

- [`68134f7a`](https://github.com/keystonejs/keystone-5/commit/68134f7ac6d56122640c42304ab8796c1aa2f17c) [#1760](https://github.com/keystonejs/keystone-5/pull/1760) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Don't serialize undefined values on objects

## 2.2.0

### Minor Changes

- [91fffa1e](https://github.com/keystonejs/keystone-5/commit/91fffa1e):

  `readViews()` can be passed a string for importing a known path.

## 2.1.2

### Patch Changes

- [19fe6c1b](https://github.com/keystonejs/keystone-5/commit/19fe6c1b):

  Move frontmatter in docs into comments

## 2.1.1

### Patch Changes

- [dfcabe6a](https://github.com/keystonejs/keystone-5/commit/dfcabe6a):

  Fix Admin UI building on Windows

## 2.1.0

### Minor Changes

- [22ec53a8](https://github.com/keystonejs/keystone-5/commit/22ec53a8):

  - Adding support for custom pages in Admin UI

### Patch Changes

- [c9102446](https://github.com/keystonejs/keystone-5/commit/c9102446):

  - Add a mechanism for loading multiple Suspense-aware components in parallel

## 2.0.0

- [major][4131e232](https://github.com/keystonejs/keystone-5/commit/4131e232):

  - Dynamically load Admin UI views with React Suspense

## 1.0.1

- [patch][1f0bc236](https://github.com/keystonejs/keystone-5/commit/1f0bc236):

  - Update the package.json author field to "The Keystone Development Team"

- [patch][9534f98f](https://github.com/keystonejs/keystone-5/commit/9534f98f):

  - Add README.md to package

## 1.0.0

- [major] 8b6734ae:

  - This is the first release of keystone-alpha (previously voussoir).
    All packages in the `@voussoir` namespace are now available in the `@keystone-alpha` namespace, starting at version `1.0.0`.
    To upgrade your project you must update any `@voussoir/<foo>` dependencies in `package.json` to point to `@keystone-alpha/<foo>: "^1.0.0"` and update any `require`/`import` statements in your code.

# @voussoir/field-views-loader

## 0.3.0

- [patch] ca1f0ad3:

  - Update to latest webpack packages

- [minor] eaab547c:

  - Allow adding related items from the Relationship field

## 0.2.0

- [minor] 47c7dcf6"
  :

  - Bump all packages with a minor version to set a new baseline

## 0.1.3

- [patch] Bump all packages for Babel config fixes [d51c833](d51c833)

## 0.1.2

- [patch] Rename readme files [a8b995e](a8b995e)

## 0.1.1

- [patch] Remove tests and markdown from npm [dc3ee7d](dc3ee7d)
