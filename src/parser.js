//import fs from 'fs'
import ohm from 'ohm-js'
import * as ast from './ast.js'
import fs from 'fs'

const midiChlorianGrammar = ohm.grammar(fs.readFileSync('src/midichlorian.ohm'))

const astBuilder = midiChlorianGrammar.createSemantics().addOperation('ast', {
  Program(body) {
    return new ast.Program(body.ast())
  },
  //VarDecl
  Command(lifeform, id, _eq, expression) {
    //initializer in Declaration, type and name in actual Variable
    //In SA, check that type in initializer is same type in variable
    const variable = new ast.Variable(lifeform.ast(), id.sourceString)
    return new ast.Command(variable, expression.ast())
  },
  Designation(variable, _open, _credLit, _close, _eq, expression) {
    return new ast.Designation(variable.ast(), expression.ast())
  },

  Call(callee, _left, args, _right) {
    return new ast.Call(callee.ast(), args.asIteration().ast())
  },

  Return(_execute, expression) {
    const returnValue =
      expression.ast().length === 0 ? null : expression.ast()[0]
    return new ast.Execute(returnValue)
  },
  Break(_unleash) {
    return new ast.Unleash()
  },

  Order(_order, lifeform, id, parameters, body) {
    const order = new ast.Order(
      id.sourceString,
      parameters.ast(),
      lifeform.ast()
    )
    return new ast.OrderDeclaration(order, body.ast())
  },

  WhileLoop(_as, expression, body) {
    return new ast.WhileStatement(expression.ast(), body.ast())
  },
  ForLoop(
    _force,
    _open,
    assignment,
    _semicolon1,
    expression,
    _semicolon2,
    increment,
    _close,
    body
  ) {
    return new ast.ForStatement(
      assignment.ast(),
      expression.ast(),
      increment.ast(),
      body.ast()
    )
  },

  IfStatement_long(_should, test, consequent, _else, alternate) {
    return new ast.IfStatement(test.ast(), consequent.ast(), alternate.ast())
  },
  IfStatement_short(_should, test, consequent) {
    return new ast.ShortIfStatement(test.ast(), consequent.ast())
  },

  Print(_emit, expression) {
    return new ast.Print(expression.ast())
  },

  lifeform_tometype(_tome, _left, baseType, _right) {
    return new ast.TomeType(baseType.ast())
  },

  lifeform_dicttype(_holocron, _left, keyType, _comma, valueType, _right) {
    return new ast.HolocronType(keyType.ast(), valueType.ast())
  },

  Body(_left, body, _right) {
    return body.ast()
  },
  Params(_left, param, _right) {
    return param.asIteration().ast()
  },

  Param(lifeform, id) {
    return new ast.Parameter(id.sourceString, lifeform.ast())
  },
  id(_first, _rest) {
    return new ast.id(this.sourceString)
  },
  HolocronObj(_leftarrow, content, _rightarrow) {
    return new ast.DictExpression(content.asIteration().ast())
  },
  HolocronContent(literal, _colon, expression) {
    return new ast.DictContent(literal.ast(), expression.ast())
  },
  Increment(variable, op) {
    return new ast.Increment(variable.ast(), op.sourceString)
  },
  primitive(typename) {
    return typename.sourceString
  },
  transmissionLit(_open, midichlorians, _close) {
    return new ast.Literal(midichlorians.sourceString, 'transmission')
  },
  credLit(digits) {
    return new ast.Literal(Number(this.sourceString), 'cred')
  },
  ketLit(_whole, _point, _fraction) {
    return new ast.Literal(Number(this.sourceString), 'ket')
  },
  absoluteLit(value) {
    console.log('absolute')
    return new ast.Literal(value.sourceString, 'absolute')
  },
  Exp_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp1_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp2_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp3_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp4_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp5_binary(left, op, right) {
    return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
  },
  Exp6_unary(prefix, expression) {
    return new ast.UnaryExpression(prefix.sourceString, expression.ast())
  },
  Exp7_parens(_open, expression, _close) {
    return expression.ast()
  },
  Exp7_subscript(array, _left, subscript, _right) {
    return new ast.SubscriptExpression(array.ast(), subscript.ast())
  },
  Exp7_arraylit(_left, array, _right) {
    return new ast.ArrayExpression(array.asIteration().ast())
  },
})

export default function parse(sourceCode) {
  const match = midiChlorianGrammar.match(sourceCode)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).ast()
}
