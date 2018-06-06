# babel-plugin-private-underscores

> Make _classMembers 'private' using symbols

- {feature1}
- {feature2}
- {feature3}

## Install

```sh
yarn add --dev babel-plugin-private-underscores
```

## Example

**Input**

```js
class Foo {
  constructor() {
    this._method();
  }

  _method() {
    // ...
  }
}
```

**Output**

```js
let _method = Symbol('_method');
class Foo {
  constructor() {
    this[_method]();
  }

  [_method]() {
    // ...
  }
}
```

## Usage

```js
{
  "plugins": [
    "private-underscores"
  ]
}
```

> **Note:** This is not *real* private, it just makes it a lot harder for
> people to accidentally use methods with underscores.
