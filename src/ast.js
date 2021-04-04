// from https://github.com/rtoal/ael-ohm/blob/master/src/ast.js
// also from https://github.com/rtoal/carlos-compiler/blob/11-strings/src/ast.js

//Abstract Syntax Tree Nodes
//
// This module defines classes for the AST nodes. Only the constructors are
// defined here. Semantic analysis methods, optimization methods, and code
// generation are handled by other modules. This keeps the compiler organized
// by phase.
//
// The root (Program) node has a custom inspect method, so you can console.log
// the root node and you'll get a lovely formatted string with details on the
// entire AST. It even works well if you analyze the AST and turn it into a
// graph with cycles.

import util from "util";

export class Program {
  constructor(statements) {
    this.statements = statements;
  }
}

export class Type {
  constructor(name) {
    this.name = name;
  }
  static ABSOLUTE = new Type("absolute");
  static CRED = new Type("cred");
  static TRANSMISSION = new Type("transmission");
  static KET = new Type("ket");
  static MIDICHLORIAN = new Type("midichlorian");
  static TYPE = new Type("type");
}

export class TypeName {
  constructor(name) {
    this.name = name;
  }
}

export class Command {
  constructor(variables, initializers) {
    Object.assign(this, { variables, initializers });
  }
}

export class FunctionType {
  constructor(parameterTypes, returnType) {
    Object.assign(this, { parameterTypes, returnType });
  }
  get name() {
    return `(${this.parameterTypes.map((t) => t.name).join(",")})->${
      this.returnType.name
    }`;
  }
}

export class TomeType {
  constructor(baseType) {
    this.baseType = baseType;
  }
  get name() {
    return `[${this.baseType.name}]`;
  }
}

export class Variable {
  constructor(name, readOnly) {
    Object.assign(this, { name, readOnly });
  }
}

export class Order {
  constructor(id, parameters, body) {
    Object.assign(this, { id, parameters, body });
  }
}

export class Designation {
  constructor(targets, sources) {
    Object.assign(this, { targets, sources });
  }
}

export class WhileLoop {
  constructor(test, body) {
    Object.assign(this, { test, body });
  }
}

export class Param {
  constructor(name, type) {
    Object.assign(this, { name, type });
  }
}

export class ForLoop {
  constructor(iterator, range, body) {
    Object.assign(this, { iterator, range, body });
  }
}

export class Print {
  constructor(argument) {
    this.argument = argument;
  }
}
export class HolocronContent {
  constructor(literal, expression) {
    Object.assign(this, { literal, expression });
  }
}

export class HolocronObj {
  constructor(content) {
    this.content = content;
  }
}

export class Return {
  constructor(returnValue) {
    this.returnValue = returnValue;
  }
}

export class Unleash {
  //intentionally empty
}

export class IfStatement {
  constructor(condition, execution) {
    Object.assign(this, { condition, execution });
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand });
  }
}

export class SubscriptExpression {
  constructor(array, index) {
    Object.assign(this, { array, index });
  }
}

export class ArrayExp {
  constructor(elements) {
    this.elements = elements;
  }
}

export class Increment {
  constructor(id, operation) {
    Object.assign(this, { id, operation });
  }
}
export class id {
  constructor(expression) {
    this.expression = expression;
  }
}

export class Arg {
  constructor(expression) {
    this.expression = expression;
  }
}
export class Args {
  constructor(argumentList) {
    this.argumentList = argumentList;
  }
}
export class Call {
  constructor(callee, args) {
    console.log("test");
    Object.assign(this, { callee, args });
  }
}

export class Literal {
  constructor(type) {
    this.type = type;
  }
}
export class LitList {
  constructor(type) {
    this.type = type;
  }
}
