import assert from 'assert'
import optimize from '../src/optimizer.js'
import * as ast from '../src/ast.js'
import util from 'util'
import { AsyncLocalStorage } from 'async_hooks'

const x = new ast.Variable('cred', 'x')
const c = new ast.Variable('absolute', 'c')
const xpp = new ast.Increment(x, '++')
const next = new ast.Next(x, '++')
const xmm = new ast.Increment(x, '--')
const return1p1 = new ast.Execute(new ast.BinaryExpression('+', 1, 1))
const return2 = new ast.Execute(2)
const returnX = new ast.Execute(x)
const onePlusTwo = new ast.BinaryExpression('+', 1, 2)
const dictCont = new ast.DictContent('a', 2)
const dictExp = new ast.DictExpression(dictCont)
const param = new ast.Parameter('x', 'cred')
const tt = new ast.TomeType('cred')

const identity = Object.assign(new ast.Order('id'), { body: returnX })
const intFun = (body) => new ast.OrderDeclaration('f', body)
const callIdentity = (args) => new ast.Call(identity, args)
const or = (...d) => d.reduce((x, y) => new ast.BinaryExpression('or', x, y))
const and = (...c) => c.reduce((x, y) => new ast.BinaryExpression('and', x, y))
const less = (x, y) => new ast.BinaryExpression('<', x, y)
const eq = (x, y) => new ast.BinaryExpression('onewith', x, y)
const times = (x, y) => new ast.BinaryExpression('*', x, y)
const neg = (x) => new ast.UnaryExpression('-', x)
const htype = new ast.HolocronType('cred', 'transmission')
const dictcont = new ast.DictContent(
  new ast.Literal(3, 'cred'),
  new ast.Literal('nice', 'transmission')
)

const dictexp = new ast.DictExpression(dictcont)
const dictvar = new ast.Variable(htype, dictexp)

const array = (...elements) => new ast.ArrayExpression(elements)
const sub = (a, e) => new ast.SubscriptExpression(a, e)
const some = (x) => new ast.UnaryExpression('some', x)

const tests = [
  ['folds +', new ast.BinaryExpression('+', 5, 8), 13],
  ['folds -', new ast.BinaryExpression('-', 5, 8), -3],
  ['folds *', new ast.BinaryExpression('*', 5, 8), 40],
  ['folds /', new ast.BinaryExpression('/', 5, 8), 0.625],
  ['folds **', new ast.BinaryExpression('**', 5, 8), 390625],
  ['folds <', new ast.BinaryExpression('<', 5, 8), true],
  ['folds <=', new ast.BinaryExpression('<=', 5, 8), true],
  ['folds ==', new ast.BinaryExpression('onewith', 5, 8), false],
  ['folds !=', new ast.BinaryExpression('!onewith', 5, 8), true],
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
  ['optimizes darth', new ast.UnaryExpression('darth', 'light'), false],
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
    'optimizable for-loop',
    new ast.ForStatement(
      new ast.Command('y', 5),
      new ast.BinaryExpression('>=', 5, 8),
      new ast.Next(x, '++'),
      new ast.Print('nice')
    ),
    [], //do not remove this lol
  ],
  [
    'passes through nonoptimizable constructs',
    ...Array(2).fill([
      new ast.Program([new ast.Execute('nice')]),
      new ast.Command('x', true, 'z'),
      new ast.Designation(x, new ast.BinaryExpression('*', x, 'z')),
      new ast.Designation(x, new ast.UnaryExpression('not', x)),
      new ast.WhileStatement(true, [new ast.Unleash()]),
      new ast.IfStatement(x, [], []),
      new ast.ShortIfStatement(x, []),
      new ast.HolocronType('cred', 'transmission'),
      new ast.Call(new ast.Order('x', 'cred'), x),
      new ast.CallStmt(new ast.Order('x', 'cred'), x),
      new ast.ForStatement(
        new ast.Command('y', 5),
        eq(1, 'y'),
        new ast.Next(x, '++'),
        new ast.Print('nice')
      ),
      dictvar,
      dictexp,
      dictcont,
      next,
      param,
      tt,
    ]),
  ],
]

describe('The optimizer', () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepStrictEqual(optimize(before), after)
    })
  }
})
