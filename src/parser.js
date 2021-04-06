//import fs from 'fs'
import ohm from "ohm-js";
import * as ast from "./ast.js";
import fs from "fs";

const midiChlorianGrammar = ohm.grammar(
  fs.readFileSync("src/midichlorian.ohm")
);

const astBuilder = midiChlorianGrammar.createSemantics().addOperation("ast", {
  Program(body) {
    return new ast.Program(body.ast());
  },
  Command(_lifeform, id, _eq, expression) {
    return new ast.Command(id.sourceString, expression.ast());
  },
  Designation(id, _eq, expression) {
    return new ast.Designation(id.ast(), expression.ast());
  },

  Call(id, _left, args, _right) {
    return new ast.Call(id.ast(), args.ast());
  },

  Return(_execute, expression) {
    return new ast.Execute(expression.ast());
  },
  Break(_unleash) {
    return new ast.Unleash();
  },

  Order(_order, _lifeform, id, parameters, body) {
    return new ast.Order(id.sourceString, parameters.ast(), body.ast());
  },

  WhileLoop(_as, expression, body) {
    return new ast.WhileLoop(expression.ast(), body.ast());
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
    return new ast.ForLoop(
      assignment.ast(),
      expression.ast(),
      increment.ast(),
      body.ast()
    );
  },

  IfStatement(
    _should,
    expression1,
    body1,
    _altshould,
    expression2,
    body2,
    _elseshould,
    body3
  ) {
    return new ast.IfStatement(
      expression1.ast(),
      body1.ast(),
      expression2.ast(),
      body2.ast(),
      body3.ast()
    );
  },
  Print(_emit, expression) {
    return new ast.Emit(expression.ast());
  },
  Body(_left, body, _right) {
    return body.ast();
  },
  Params(_left, param, _right) {
    return param.asIteration().ast();
  },
  Param(lifeform, id) {
    return new ast.Param(id.sourceString, lifeform.ast());
  },
  Args(expressions) {
    return new ast.Args(expressions.asIteration().ast());
  },
  Arg(id, _colon, expression) {
    return new ast.Arg(id.sourceString, expression.ast());
  },
  id(_first, _rest) {
    return new ast.id(this.sourceString);
  },
  LitList(_leftarrow, content, _rightarrow) {
    return new ast.LitList(content.asIteration().ast());
  },
  HolocronObj(_leftarrow, content, _rightarrow) {
    return new ast.HolocronObj(content.asIteration().ast());
  },
  HolocronContent(literal, _colon, expression) {
    return new ast.HolocronContent(literal.sourceString, expression.ast());
  },
  Increment(id, sign) {
    return new ast.Increment(id.ast(), sign.ast());
  },
  Literal(type) {
    return new ast.Literal(type.ast());
  },
  primitive(typename) {
    return typename.sourceString;
  },
  transmissionLit(_open, midichlorians, _close) {
    return midichlorians.sourceString;
  },
  credLit(_digits) {
    return Number(this.sourceString);
  },
  ketLit(_whole, _point, _fraction) {
    return Number(this.sourceString);
  },
  absoluteLit(value) {
    return value.sourceString;
  },
  Exp_binary(left, _op, right) {
    return new ast.BinaryExpression(left.ast(), right.ast());
  },
  Exp1_binary(left, _op, right) {
    return new ast.BinaryExpression(left.ast(), right.ast());
  },
  Exp2_binary(left, _op, right) {
    return new ast.BinaryExpression(left.ast(), right.ast());
  },
  Exp3_binary(left, _op, right) {
    return new ast.BinaryExpression(left.ast(), right.ast());
  },
  Exp4_binary(left, _op, right) {
    return new ast.BinaryExpression(left.ast(), right.ast());
  },
  Exp5_binary(left, _op, right) {
    return new ast.BinaryExpression(left.ast(), right.ast());
  },
  Exp6_unary(_prefix, expression) {
    return new ast.UnaryExpression(expression.ast());
  },
  Exp7_parens(_open, expression, _close) {
    return expression.ast();
  },
  Exp7_subscript(array, _left, subscript, _right) {
    return new ast.SubscriptExpression(array.ast(), subscript.ast());
  },
  Exp7_arraylit(_left, array, _right) {
    return new ast.ArrayExp(array.asIteration().ast());
  },
  _terminal() {
    this.sourceString;
  },
});

export default function parse(sourceCode) {
  const match = midiChlorianGrammar.match(sourceCode);
  if (!match.succeeded()) {
    throw new Error(match.message);
  }
  return astBuilder(match).ast();
}
