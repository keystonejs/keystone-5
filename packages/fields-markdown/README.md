<!--[meta]
section: api
subSection: field-types
title: Markdown
[meta]-->

# Markdown

> This is the last active development release of this package as **Keystone 5** is now in a 6 to 12 month active maintenance phase. For more information please read our [Keystone 5 and beyond](https://github.com/keystonejs/keystone-5/issues/21) post.

This field inserts a string path into your schema based on the `Text` field type implementation, and renders a Markdown editor using [CodeMirror](https://codemirror.net/).

## Usage

This package isn't included with the keystone fields package and needs to be installed:

```shell allowCopy=false showLanguage=false
yarn add @keystonejs/fields-markdown
# or
npm install @keystonejs/fields-markdown
```

Then import it, and use it like any other field:

```js
const { Markdown } = require('@keystonejs/fields-markdown');

keystone.createList('Post', {
  fields: {
    content: {
      type: Markdown,
    },
  },
});
```

## Credit

The `Editor` implementation is based on [SquidDev/MirrorMark](https://github.com/SquidDev/MirrorMark).
