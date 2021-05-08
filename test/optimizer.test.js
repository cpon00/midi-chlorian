import assert from 'assert'
import optimize from '../src/optimizer.js'
import * as ast from '../src/ast.js'

const x = new ast.Variable('x', false)
const xpp = new ast.Increment(x, '++')
const xmm = new ast.Increment(x, '--')
const return1p1 = new ast.Execute(new ast.BinaryExpression('+', 1, 1))
const return2 = new ast.Execute(2)
const returnX = new ast.Execute(x)
const onePlusTwo = new ast.BinaryExpression('+', 1, 2)
const dictCont = new ast.DictContent('a', 2)
const dictExp = new ast.DictExpression(dictCont)

//fix order params
const identity = Object.assign(new ast.Order('id'), { body: returnX })
const intFun = (body) => new ast.OrderDeclaration('f', body)
const callIdentity = (args) => new ast.Call(identity, args)
const or = (...d) => d.reduce((x, y) => new ast.BinaryExpression('or', x, y))
const and = (...c) => c.reduce((x, y) => new ast.BinaryExpression('and', x, y))
const less = (x, y) => new ast.BinaryExpression('<', x, y)
const eq = (x, y) => new ast.BinaryExpression('==', x, y)
const times = (x, y) => new ast.BinaryExpression('*', x, y)
const neg = (x) => new ast.UnaryExpression('-', x)

const array = (...elements) => new ast.ArrayExpression(elements)
//const emptyArray = new ast.EmptyArray(ast.Type.INT)
const sub = (a, e) => new ast.SubscriptExpression(a, e)
//const conditional = (x, y, z) => new ast.Conditional(x, y, z)
const some = (x) => new ast.UnaryExpression('some', x)

const tests = [
  ['folds +', new ast.BinaryExpression('+', 5, 8), 13],
  ['folds -', new ast.BinaryExpression('-', 5n, 8n), -3n],
  ['folds *', new ast.BinaryExpression('*', 5, 8), 40],
  ['folds /', new ast.BinaryExpression('/', 5, 8), 0.625],
  ['folds **', new ast.BinaryExpression('**', 5, 8), 390625],
  ['folds <', new ast.BinaryExpression('<', 5, 8), true],
  ['folds <=', new ast.BinaryExpression('<=', 5, 8), true],
  ['folds ==', new ast.BinaryExpression('==', 5, 8), false],
  ['folds !=', new ast.BinaryExpression('!=', 5, 8), true],
  ['folds >=', new ast.BinaryExpression('>=', 5, 8), false],
  ['folds >', new ast.BinaryExpression('>', 5, 8), false],
  ['optimizes +0', new ast.BinaryExpression('+', x, 0), x],
  ['optimizes -0', new ast.BinaryExpression('-', x, 0), x],
  ['optimizes *1', new ast.BinaryExpression('*', x, 1), x],
  ['optimizes /1', new ast.BinaryExpression('/', x, 1), x],
  ['optimizes *0', new ast.BinaryExpression('*', x, 0), 0],
  ['optimizes 0*', new ast.BinaryExpression('*', 0, x), 0],
  ['optimizes 0/', new ast.BinaryExpression('/', 0, x), 0],
  ['optimizes 0+', new ast.BinaryExpression('+', 0, x), x],
  ['optimizes 0-', new ast.BinaryExpression('-', 0, x), neg(x)],
  ['optimizes 1*', new ast.BinaryExpression('*', 1, x), x],
  ['folds negation', new ast.UnaryExpression('-', 8), -8],
  ['optimizes 1**', new ast.BinaryExpression('**', 1, x), 1],
  ['optimizes **0', new ast.BinaryExpression('**', x, 0), 1],
  ['removes left false from ||', or(false, less(x, 1)), less(x, 1)],
  ['removes right false from ||', or(less(x, 1), false), less(x, 1)],
  ['removes left true from &&', and(true, less(x, 1)), less(x, 1)],
  ['removes right true from &&', and(less(x, 1), true), less(x, 1)],
  ['removes x=x at beginning', [new ast.Designation(x, x), xpp], [xpp]],
  ['removes x=x at end', [xpp, new ast.Designation(x, x)], [xpp]],
  ['removes x=x in middle', [xpp, new ast.Designation(x, x), xpp], [xpp, xpp]],
  ['optimizes if-true', new ast.IfStatement(true, xpp, []), xpp],
  ['optimizes if-false', new ast.IfStatement(false, [], xpp), xpp],
  ['optimizes short-if-true', new ast.ShortIfStatement(true, xmm), xmm],
  ['optimizes short-if-false', [new ast.ShortIfStatement(false, xpp)], []],
  ['optimizes while-false', [new ast.WhileStatement(false, xpp)], []],
  [
    'applies if-false after folding',
    new ast.ShortIfStatement(eq(1, 1), xpp),
    xpp,
  ],
  ['optimizes in functions', intFun(return1p1), intFun(return2)],
  ['optimizes in subscripts', sub(x, onePlusTwo), sub(x, 3)],
  ['optimizes in array literals', array(0, onePlusTwo, 9), array(0, 3, 9)],
  ['optimizes in arguments', callIdentity([times(3, 5)]), callIdentity([15])],
  [
    'passes through nonoptimizable constructs',
    ...Array(2).fill([
      new ast.Program([new ast.Execute()]),
      new ast.Command('x', true, 'z'),
      new ast.Designation(x, new ast.BinaryExpression('*', x, 'z')),
      new ast.Designation(x, new ast.UnaryExpression('not', x)),
      new ast.WhileStatement(true, [new ast.Unleash()]),
      new ast.IfStatement(x, [], []),
      new ast.ShortIfStatement(x, []),
      new ast.ForStatement(x, array(1, 2, 3), []),
    ]),
  ],

  //   [
  //     `force(cred i = 0; i < 10; i++){
  //     cred x = 1

  //     emit(x+x+x+x+x+x+x+x+x)
  //   }
  // `,
  //   ],
  //   [
  //     `absolute x = light
  //  if(light || x){
  //      emit(x)
  //  }`,
  //   ],
  //   [
  //     `absolute x = light
  //     if(x || light){
  //         emit(x)
  //     }`,
  //   ],
  // [
  //   `cred x = 5
  //   emit(x+0)`
  // ],
  // [
  //   `cred x = 5
  //    emit(x-0)`
  // ],
  //  [
  //    `cred x = 0
  // cred y = 1
  //  cred z = 0
  //  emit(x+y+z)`,
  // ],
  //   [
  //     `if(dark){
  //       emit('error')
  //   }`,
  //   ],
  //   [
  //     `order cred sayHello() {
  //       execute('1')
  //       emit('hello, Coruscant')
  //   }`,
  //   ],
  //   [
  //     `cred y = 15
  //     y = y`,
  //   ],
  //   [
  //     `cred x = 9
  //     emit(x+0)`,
  //   ],
  //   [
  //     `cred x = 0
  //     emit(darth x)`,
  //   ],
  //   [`1**`],
  //   [
  //     `cred x = 5
  //     0**x`,
  //   ],
  //   [
  //     `cred x = 15
  //       emit(x*1)`,
  //   ],
  //   [
  //     `cred y = 15
  //     emit(y/1)`,
  //   ],
  //   [
  //     `force(cred i = 0; i < 0; i++){
  //         emit("I dont like sand")
  //     }`,
  //   ],
  //   [
  //     `absolute x = light
  //       should(x && light)`,
  //   ],
  //   [
  //     `absolute x = light
  //     should(light && x)`,
  //   ],
  //   [`0*`],
  //   [`-0`],
  //   [`+0`],
  //   [`as(dark){
  //     emit('hello')
  //}`]
]

describe('The optimizer', () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepStrictEqual(optimize(before), after)
    })
  }
})
