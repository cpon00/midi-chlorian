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

import util from 'util'

//Program
export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

//Assignment
export class Command {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer })
  }
}

export class Variable {
  constructor(type, name) {
    Object.assign(this, { type, name })
  }
}

//TODO: Designation? Reassignment?

//Type of primitive lifeform: transmission, ket, cred, absolute, superclass of other types
export class Type {
  constructor(name) {
    this.name = name
  }
  static BOOLEAN = new Type('absolute')
  static INT = new Type('cred')
  static FLOAT = new Type('ket')
  static STRING = new Type('transmission')

  isEquivalentTo(target) {
    return this == target
  }

  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  }
}

//Function Declaration
export class OrderDeclaration {
  constructor(fun, body) {
    Object.assign(this, { fun, body })
  }
}

//Function
export class Order {
  constructor(name, parameters, returnType) {
    Object.assign(this, { name, parameters, returnType })
  }
}

//Parameter
export class Parameter {
  constructor(name, type) {
    Object.assign(this, { name, type })
  }
}

//Array Type
export class TomeType extends Type {
  constructor(baseType) {
    super(`[${baseType}]`)
    this.baseType = baseType
  }
}

//Dictionary Type
export class HolocronType extends Type {
  constructor(keyType, valueType) {
    super(`[${keyType}], [${valueType}]`)
    this.keyType = keyType
    this.valueType = valueType
  }
}

//Increment
export class Increment {
  constructor(variable) {
    this.variable = variable
  }
}

//Assignment
export class Designation {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

//Return
export class Execute {
  constructor(returnValue) {
    this.returnValue = returnValue
    //Object.assign(this, { returnValue })
  }
}

//Break
export class Unleash {
  //intentionally empty
}

//If Statement
export class IfStatement {
  // Example: if x < 3 { print(100); } else { break; }
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate })
  }
}

//While Statement
export class WhileStatement {
  // Example: while level != 90 { level += random(-3, 8); }
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

//For Statement
export class ForStatement {
  constructor(iterator, range, body) {
    Object.assign(this, { iterator, range, body })
  }
}

//Binary Expression
export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
  }
}

//Unary Expression
export class UnaryExpression {
  // Example: -55
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}

//Subscript Expression
export class SubscriptExpression {
  // Example: a[20]
  constructor(array, index) {
    Object.assign(this, { array, index })
  }
}

//Array Expression
export class ArrayExpression {
  // Example: ["Emma", "Norman", "Ray"]
  constructor(elements) {
    this.elements = elements
  }
}

//Dictionary Expression
export class DictExpression {
  constructor(elements) {
    this.elements = elements
  }
}

//Dictionary Content
export class DictContent {
  constructor(literal, expression) {
    Object.assign(this, { literal, expression })
  }
}

//Call
export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

//id
export class id {
  constructor(expression) {
    this.expression = expression
  }
}

export class Arg {
  constructor(expression) {
    this.expression = expression
  }
}
export class Args {
  constructor(argumentList) {
    this.argumentList = argumentList
  }
}

export class Literal {
  constructor(value, type) {
    this.value = value
    this.type = type
  }
}
