//sourced from https://github.com/rtoal/carlos-compiler/blob/11-strings/test/analyzer.test.js

import assert from 'assert'
import util from 'util'
import parse from '../src/parser.js'
import analyze from '../src/analyzer.js'

const semanticChecks = [
  ['hello', 'emit "hello"'],
  ['assign', 'cred x = 1'],
  ['negation', 'cred x = -7'],
  ['boolean not', 'absolute a = darth dark'],
  ['multiply', 'cred x = 7 * 5 '],
  ['divide', 'cred x = 7 / 5 '],
  ['mod', 'cred x = 7 % 5 '],
  ['plus', 'cred x = 7 + 5 '],
  ['minus', 'cred x = 7 - 5 '],
  ['power', 'cred x = 7 ** 5 '],

  ['increment', 'cred x = 7 x++'],
  ['decrement', 'cred x = 7  x-- '],
  [
    'Order fibonacci',
    `order cred fibonacci (cred count) {
      should (count <= 1) {
        execute 1
      }
      execute fibonacci(count-1) + fibonacci(count-2)
    }
  `,
  ],
  [
    'function return types',
    `order cred square(cred x) { execute x }
     order cred fncall() {emit(square(2))}
     `,
  ],
  [
    'all basic types',
    `
    cred x = 70
    ket y = 99.99
    absolute z = light
    transmission abc = "You are my only hope"
  `,
  ],
  [
    'Return a holocron',
    `
    order holocron<cred, cred> z() {
    }
    `,
  ],
]

const semanticErrors = [
  ['redeclarations', 'emit x', /Identifier x not declared/],
  [
    'type mismatch',
    'cred x = "uh-oh"',
    /Cannot assign a cred to a transmission/,
  ],
]

describe('The analyzer', () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
})
