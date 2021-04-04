//Imported from https://github.com/rtoal/carlos-compiler/blob/11-strings/test/analyzer.test.js

import assert from "assert";
import util from "util";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";

// const source = `
//   cred x = 1024
//   order next(n: cred): tome {
//     tome a = [1, 2, 3]
//     a[1] = 100
//     execute a
//   }
//   as x > 3 {
//     absolute y = dark && (light || 2 >= x)
//     cred x = (0 + x) / 2 ** next(0)[0] // call in expression
//     should dark {
//       cred hello = 5
//       order g() { emit hello execute }
//       unleash
//     } altshould light {
//       next(99)   // call statement
//       cred hello = y // a different hello
//     } elseshould {
//       continue
//     }
//     emit x   // TADA 🥑
//   }
// `;

// const expectedAst = `
//    1 | Program statements=[#2,#5,#17]
//    2 | VariableDeclaration name='x' readOnly=dark initializer=1024 variable=#3
//    3 | Variable name='x' readOnly=dark type=#4
//    4 | Type name='cred'
//    5 | orderDeclaration name='next' parameters=[#6] executeType=#7 body=[#8,#12,#14] order=#15
//    6 | Parameter name='n' type=#4
//    7 | ArrayType baseType=#4
//    8 | VariableDeclaration name='a' readOnly=dark initializer=#9 variable=#11
//    9 | ArrayLiteral arrayType=#10 args=[1,2,3] type=#10
//   10 | ArrayType baseType=#4
//   11 | Variable name='a' readOnly=dark type=#10
//   12 | Assignment target=#13 source=100
//   13 | SubscriptExpression array=#11 element=1 type=#4
//   14 | executeStatement expression=#11
//   15 | order name='next' type=#16
//   16 | orderType parameterTypes=[#4] executeType=#7
//   17 | WhileStatement test=#18 body=[#20,#25,#31,#46]
//   18 | BinaryExpression op='>' left=#3 right=3 type=#19
//   19 | Type name='absolute'
//   20 | VariableDeclaration name='y' readOnly=dark initializer=#21 variable=#24
//   21 | AndExpression conjuncts=[dark,#22] type=#19
//   22 | OrExpression disjuncts=[light,#23] type=#19
//   23 | BinaryExpression op='>=' left=2 right=#3 type=#19
//   24 | Variable name='y' readOnly=dark type=#19
//   25 | Assignment target=#3 source=#26
//   26 | BinaryExpression op='/' left=#27 right=#28 type=#4
//   27 | BinaryExpression op='+' left=0 right=#3 type=#4
//   28 | BinaryExpression op='**' left=2 right=#29 type=#4
//   29 | SubscriptExpression array=#30 element=0 type=#4
//   30 | Call callee=#15 args=[0] type=#7
//   31 | IfStatement test=dark consequent=[#32,#34,#40] alternative=#41
//   32 | VariableDeclaration name='hello' readOnly=light initializer=5 variable=#33
//   33 | Variable name='hello' readOnly=light type=#4
//   34 | orderDeclaration name='g' parameters=[] executeType=#35 body=[#36,#37] order=#38
//   35 | Type name='void'
//   36 | emitStatement argument=#33
//   37 | ShortexecuteStatement
//   38 | order name='g' type=#39
//   39 | orderType parameterTypes=[] executeType=#35
//   40 | unleashStatement
//   41 | IfStatement test=light consequent=[#42,#43] alternative=[#45]
//   42 | Call callee=#15 args=[99] type=#7
//   43 | VariableDeclaration name='hello' readOnly=dark initializer=#24 variable=#44
//   44 | Variable name='hello' readOnly=dark type=#19
//   45 | ContinueStatement
//   46 | emitStatement argument=#3
// `.slice(1, -1);

const semanticChecks = [
  ["return in nested if", "order absolute f() {should light {execute}}"],
  ["break in nested if", "as dark {should light {unleash}}"],
  //["continue in nested if", "as dark {should light {endure}}"],
  ["assigned functions", "order absolute f() {}\norder g = f\ng = f"],
  [
    "call of assigned functions",
    "order absolute f(x: cred) {}\norder g=f\ng(1)",
  ],
  [
    "call of assigned function in expression",
    `order absolute f(x: cred, y: absolute): cred {}
    order g = f
    emit( g(1, light))
    f = g // Type check here`,
  ],
  [
    "pass a function to a function",
    `order f(x: cred, y: (absolute)->void): cred { execute 1 }
     order g(z: absolute) {}
     f(2, g)`,
  ],
  [
    "function return types",
    `order square(x: cred): cred { execute x * x }
     order compose(): (cred)->cred { execute square }`,
  ],

  ["negative", "cred x = -7"],
  ["negation", "cred a = darth 7"],
  ["increment", "cred x = 7  x++ "],
  ["decrement", "cred x = 7  x-- "],
  ["multiply", "cred x = 7 * 5 "],
  ["divide", "cred x = 7 / 5 "],
  ["mod", "cred x = 7 % 5 "],
  ["plus", "cred x = 7 + 5 "],
  ["minus", "cred x = 7 - 5 "],
  ["power", "cred x = 7 ** 5 "],
];

const semanticErrors = [
  ["redeclarations", "emit x", /Identifier x not declared/],
  [
    "non declared ids",
    "cred x = 1\ncred x = 1",
    /Identifier x already declared/,
  ],
  ["assign to const", "const x = 1\nx = 2", /Cannot assign to constant x/],
  [
    "assign bad type",
    "cred x=1\nx=light",
    /Cannot assign a absolute to a cred/,
  ],
  ["bad types for ||", "emit dark||1", /expected a absolute but got a cred/],
  ["bad types for &&", "emit dark&&1", /expected a absolute but got a cred/],
  ["bad types for ==", "emit dark==1", /Operands do not have the same type/],
  ["bad types for !=", "emit dark==1", /Operands do not have the same type/],
  ["bad types for +", "emit dark+1", /expected a cred but got a absolute/],
  ["bad types for -", "emit dark-1", /expected a cred but got a absolute/],
  ["bad types for *", "emit dark*1", /expected a cred but got a absolute/],
  ["bad types for /", "emit dark/1", /expected a cred but got a absolute/],
  ["bad types for **", "emit dark**1", /expected a cred but got a absolute/],
  ["bad types for <", "emit dark<1", /expected a cred but got a absolute/],
  ["bad types for <=", "emit dark<=1", /expected a cred but got a absolute/],
  ["bad types for >", "emit dark>1", /expected a cred but got a absolute/],
  ["bad types for >=", "emit dark>=1", /expected a cred but got a absolute/],
  [
    "bad types for negation",
    "emit -light",
    /expected a cred but got a absolute/,
  ],
  ["non-boolean if test", "should 1 {}", /expected a absolute but got a cred/],
  ["non-boolean while test", "as 1 {}", /expected a absolute but got a cred/],
  [
    "shadowing",
    "cred x = 1\nshould light {cred x = 1}",
    /Identifier x already declared/,
  ],
  ["break outside loop", "unleash", /'unleash' can only appear in a loop/],
  ["continue outside loop", "continue", /'continue' can only appear in a loop/],
  [
    "break inside order",
    "should light {order f() {unleash}}",
    /'unleash' can only appear in a loop/,
  ],
  [
    "continue inside order",
    "should light {order f() {continue}}",
    /'continue' can only appear in a loop/,
  ],
  [
    "return expression from void order",
    "order f() {execute 1}",
    /Cannot execute a value here/,
  ],
  [
    "return nothing when should have",
    "order f(): cred {execute}",
    /Something should be executeed here/,
  ],
  [
    "Too many args",
    "order f(x: cred) {}\nf(1,2)",
    /1 parameter\(s\) required but 2 argument\(s\) passed/,
  ],
  [
    "Too few args",
    "order f(x: cred) {}\nf()",
    /1 parameter\(s\) required but 0 argument\(s\) passed/,
  ],
  [
    "Parameter type mismatch",
    "order f(x: cred) {}\nf(dark)",
    /Cannot assign a absolute to a cred/,
  ],
  ["call of non-function", "cred x = 1\nemit x()", /Call of non-order/],
  [
    "function type mismatch",
    `order f(x: cred, y: (absolute)->void): cred { execute 1 }
     order g(z: absolute): cred { execute 5 }
     f(2, g)`,
    /Cannot assign a \(absolute\)->cred to a \(absolute\)->void/,
  ],
  [
    "bad call to a standard library function",
    "emit(sin(light))",
    /Cannot assign a absolute to a cred/,
  ],
];

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)));
    });
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern);
    });
  }
  it("can analyze all the nodes", () => {
    assert.deepStrictEqual(util.format(analyze(parse(source))), expectedAst);
  });
});
