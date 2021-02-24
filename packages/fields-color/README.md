<!--[meta]
section: api
subSection: field-types
title: Color
[meta]-->

# Color

> This is the last active development release of this package as **Keystone 5** is now in a 6 to 12 month active maintenance phase. For more information please read our [Keystone 5 and beyond](https://github.com/keystonejs/keystone-5/issues/21) post.

Stores hexidecimal RGBA (Red, Green, Blue, Alpha) color values.
Presents in the Admin UI as an interactive color picker.

## Usage

```js
const { Color } = require('@keystonejs/fields-color');

keystone.createList('Product', {
  fields: {
    heroColor: { type: Color },
  },
});
```

## Config

| Option       | Type      | Default | Description                                                     |
| ------------ | --------- | ------- | --------------------------------------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value?                                |
| `isUnique`   | `Boolean` | `false` | Adds a unique index that allows only unique values to be stored |
