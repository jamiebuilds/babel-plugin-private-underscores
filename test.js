// @flow
'use strict';
const test = require('ava');
const babel = require('babel-core');
const stripIndent = require('strip-indent');
const classProperties = require('babel-plugin-syntax-class-properties');
const plugin = require('./');

function testPluginMacro(t, { input, expected }) {
  input = stripIndent(input).trim();
  expected = stripIndent(expected).trim();

  let code = babel.transform(input, {
    plugins: [plugin, classProperties],
  }).code.trim();

  t.is(code, expected);
}

test('none', testPluginMacro, {
  input: `
    class Foo {}
  `,
  expected: `
    class Foo {}
  `
});

test('normal', testPluginMacro, {
  input: `
    class Foo {
      constructor() {
        this.method();
      }

      method() {
        // ...
      }
    }
  `,
  expected: `
    class Foo {
      constructor() {
        this.method();
      }

      method() {
        // ...
      }
    }
  `
});

test('method', testPluginMacro, {
  input: `
    class Foo {
      constructor() {
        this._method();
      }

      _method() {
        // ...
      }
    }
  `,
  expected: `
    let _method = Symbol("_method");

    class Foo {
      constructor() {
        this[_method]();
      }

      [_method]() {
        // ...
      }
    }
  `
});

test('property', testPluginMacro, {
  input: `
    class Foo {
      constructor() {
        this._prop;
      }

      _prop = true;
    }
  `,
  expected: `
    let _prop = Symbol("_prop");

    class Foo {
      constructor() {
        this[_prop];
      }

      [_prop] = true;
    }
  `
});

test('expression', testPluginMacro, {
  input: `
    function createFoo() {
      return class Foo {
        constructor() {
          this._method();
        }

        _method() {
          // ...
        }
      };
    }
  `,
  expected: `
    let _method = Symbol("_method");

    function createFoo() {
      return class Foo {
        constructor() {
          this[_method]();
        }

        [_method]() {
          // ...
        }
      };
    }
  `
});

test('missing refs', testPluginMacro, {
  input: `
    class Foo {
      constructor() {
        this._method();
      }
    }
  `,
  expected: `
    class Foo {
      constructor() {
        this._method();
      }
    }
  `
});

test('subclass', testPluginMacro, {
  input: `
    class Foo {
      constructor() {
        this._method();
      }

      _method() {
        // ...
      }
    }

    class Bar extends Foo {
      constructor() {
        this._method();
      }
    }
  `,
  expected: `
    let _method = Symbol("_method");

    class Foo {
      constructor() {
        this[_method]();
      }

      [_method]() {
        // ...
      }
    }

    class Bar extends Foo {
      constructor() {
        this._method();
      }
    }
  `
});
