//Imported from https://github.com/rtoal/carlos-compiler/blob/11-strings/test/analyzer.test.js

import assert from 'assert'
import util from 'util'
import parse from '../src/parser.js'
import analyze from '../src/analyzer.js'

const source = `
cred x = 1024
order tome<cred> next(cred n) {
    tome<cred> a = [1, 2, 3]
    a[1] = 100
    execute a
  }
  as x > 3 {
    absolute y = dark and (light or 2 >= x)
    cred x = (0 + x) / 2 ** next[0]
    should dark {
      cred hello = 5
      order cred g() { emit hello execute }
      unleash
    } altshould light {
      next(a : 99)   >< call statement
      cred hello = y >< a different hello
    } elseshould {
    }
    emit x   >< TADA 🥑
  }
`

//don't need readonly
//initializer is initial value
//

const expectedAst = `
Program {
    statements: [
      Command { variable: 'x', initializers: Literal { type: 1024 } },
      Order {
        name: 'next',
        parameters: [ Parameter { name: 'n', type: 'cred' } ],
        returnType: [
          Command {
            variable: 'a',
            initializers: ArrayExpression {
              elements: [
                Literal { type: 1 },
                Literal { type: 2 },
                Literal { type: 3 }
              ]
            }
          },
          Designation {
            target: id { expression: 'a' },
            source: Literal { type: 100 }
          },
          Execute { returnValue: [ id { expression: 'a' } ] }
        ]
      },
      WhileStatement {
        test: BinaryExpression {
          op: id { expression: 'x' },
          left: Literal { type: 3 },
          right: undefined
        },
        body: [
          Command {
            variable: 'y',
            initializers: BinaryExpression {
              op: Literal { type: 'dark' },
              left: BinaryExpression {
                op: Literal { type: 'light' },
                left: BinaryExpression {
                  op: Literal { type: 2 },
                  left: id { expression: 'x' },
                  right: undefined
                },
                right: undefined
              },
              right: undefined
            }
          },
          Command {
            variable: 'x',
            initializers: BinaryExpression {
              op: BinaryExpression {
                op: Literal { type: 0 },
                left: id { expression: 'x' },
                right: undefined
              },
              left: BinaryExpression {
                op: Literal { type: 2 },
                left: SubscriptExpression {
                  array: id { expression: 'next' },
                  index: Literal { type: 0 }
                },
                right: undefined
              },
              right: undefined
            }
          },
          IfStatement {
            test: Literal { type: 'dark' },
            consequent: [
              Command {
                variable: 'hello',
                initializers: Literal { type: 5 }
              },
              Order {
                name: 'g',
                parameters: [],
                returnType: [
                  Program { statements: id { expression: 'hello' } },
                  Execute { returnValue: [] }
                ]
              },
              Unleash {}
            ],
            alternate: [ Literal { type: 'light' } ]
          },
          Program { statements: id { expression: 'x' } }
        ]
      }
    ]
  }
`.slice(1, -1)

const semanticChecks = []

const successfulTests = [
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
]

const semanticErrors = [
  // ['redeclarations', 'emit x', /Identifier x not declared/],
  // [
  //   'non declared ids',
  //   'cred x = 1\ncred x = 1',
  //   /Identifier x already declared/,
  // ],
  // ['assign to const', 'const x = 1\nx = 2', /Cannot assign to constant x/],
  // [
  //   'assign bad type',
  //   'cred x=1\nx=light',
  //   /Cannot assign a absolute to a cred/,
  // ],
  // ['bad types for ||', 'emit dark||1', /expected a absolute but got a cred/],
  // ['bad types for &&', 'emit dark&&1', /expected a absolute but got a cred/],
  // ['bad types for ==', 'emit dark==1', /Operands do not have the same type/],
  // ['bad types for !=', 'emit dark==1', /Operands do not have the same type/],
  // ['bad types for +', 'emit dark+1', /expected a cred but got a absolute/],
  // ['bad types for -', 'emit dark-1', /expected a cred but got a absolute/],
  // ['bad types for *', 'emit dark*1', /expected a cred but got a absolute/],
  // ['bad types for /', 'emit dark/1', /expected a cred but got a absolute/],
  // ['bad types for **', 'emit dark**1', /expected a cred but got a absolute/],
  // ['bad types for <', 'emit dark<1', /expected a cred but got a absolute/],
  // ['bad types for <=', 'emit dark<=1', /expected a cred but got a absolute/],
  // ['bad types for >', 'emit dark>1', /expected a cred but got a absolute/],
  // ['bad types for >=', 'emit dark>=1', /expected a cred but got a absolute/],
  // [
  //   'bad types for negation',
  //   'emit -light',
  //   /expected a cred but got a absolute/,
  // ],
  // ['non-boolean if test', 'should 1 {}', /expected a absolute but got a cred/],
  // ['non-boolean while test', 'as 1 {}', /expected a absolute but got a cred/],
  // [
  //   'shadowing',
  //   'cred x = 1\nshould light {cred x = 1}',
  //   /Identifier x already declared/,
  // ],
  // ['break outside loop', 'unleash', /'unleash' can only appear in a loop/],
  // ['continue outside loop', 'continue', /'continue' can only appear in a loop/],
  // [
  //   'break inside order',
  //   'should light {order f() {unleash}}',
  //   /'unleash' can only appear in a loop/,
  // ],
  // [
  //   'continue inside order',
  //   'should light {order f() {continue}}',
  //   /'continue' can only appear in a loop/,
  // ],
  // [
  //   'return expression from void order',
  //   'order f() {execute 1}',
  //   /Cannot execute a value here/,
  // ], //void?
  // [
  //   'return nothing when should have',
  //   'order cred f() {execute}',
  //   /Something should be executed here/,
  // ],
  // [
  //   'Too many args',
  //   'order f(x: cred) {}\nf(1,2)',
  //   /1 parameter\(s\) required but 2 argument\(s\) passed/,
  // ],
  // [
  //   'Too few args',
  //   'order f(x: cred) {}\nf()',
  //   /1 parameter\(s\) required but 0 argument\(s\) passed/,
  // ],
  // [
  //   'Parameter type mismatch',
  //   'order f(x: cred) {}\nf(dark)',
  //   /Cannot assign a absolute to a cred/,
  // ],
  // ['call of non-function', 'cred x = 1\nemit x()', /Call of non-order/],
  // [
  //   'function type mismatch',
  //   `order f(x: cred, y: (absolute)->void): cred { execute 1 }
  //    order g(z: absolute): cred { execute 5 }
  //    f(2, g)`,
  //   /Cannot assign a \(absolute\)->cred to a \(absolute\)->void/,
  // ],
  // [
  //   'bad call to a standard library function',
  //   'emit(sin(light))',
  //   /Cannot assign a absolute to a cred/,
  // ],
]

describe('The analyzer', () => {
  for (const [scenario, source] of successfulTests) {
    it(`recognizes ${scenario}`, () => {
      //console.log(util.inspect(parse(source), { depth: null }))
      //console.log(parse(source))
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      //console.log(parse(source))
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
  // it('can analyze all the nodes', () => {
  //   console.log(parse(source))
  //   assert.deepStrictEqual(util.format(analyze(parse(source))), expectedAst)
  // })
})
