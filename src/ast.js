// sourced from https://github.com/rtoal/carlos-compiler/blob/11-strings/src/ast.js
import util from 'util'

export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

export class Command {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer })
  }
}

export class Designation {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

export class Variable {
  constructor(type, name) {
    Object.assign(this, { type, name })
  }
}

export class Type {
  //intentionally empty
}

export class OrderDeclaration {
  constructor(fun, body) {
    Object.assign(this, { fun, body })
  }
}

export class Order {
  constructor(name, parameters, returnType) {
    Object.assign(this, { name, parameters, returnType })
  }
}

export class Parameter {
  constructor(name, type) {
    Object.assign(this, { name, type })
  }
}

export class TomeType {
  constructor(baseType) {
    this.baseType = baseType
  }
}

export class HolocronType {
  constructor(keyType, valueType) {
    this.keyType = keyType
    this.valueType = valueType
  }
}

export class Increment {
  constructor(variable, op) {
    this.variable = variable
    this.op = op
  }
}

export class Next {
  constructor(variable, op) {
    this.variable = variable
    this.op = op
  }
}

export class Execute {
  constructor(returnValue) {
    this.returnValue = returnValue
  }
}

export class Print {
  constructor(argument) {
    this.argument = argument
  }
}

export class Unleash {
  //intentionally empty
}

export class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate })
  }
}

export class ShortIfStatement {
  constructor(test, consequent) {
    Object.assign(this, { test, consequent })
  }
}

export class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class ForStatement {
  constructor(assignment, expression, next, body) {
    Object.assign(this, { assignment, expression, next, body })
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}

export class SubscriptExpression {
  constructor(array, index) {
    Object.assign(this, { array, index })
  }
}

export class ArrayExpression {
  constructor(elements) {
    this.elements = elements
  }
}

export class DictExpression {
  constructor(elements) {
    this.elements = elements
  }
}

export class DictContent {
  constructor(key, value) {
    Object.assign(this, { key, value })
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class CallStmt {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class id {
  constructor(name) {
    this.name = name
  }
}

export class Literal {
  constructor(value, type) {
    this.value = value
    this.type = type
  }
}
