//sourced from https://github.com/rtoal/carlos-lang/blob/main/src/analyzer.js
import { assert } from 'console'
import util from 'util'
import {
  Type,
  OrderDeclaration,
  Order,
  TomeType,
  HolocronType,
  Variable,
} from './ast.js'
import * as stdlib from './stdlib.js'

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

const check = (self) => ({
  isNumeric() {
    must(
      ['ket', 'cred'].includes(self.type),
      `Expected a number, found ${self.type}`
    )
  },
  isNumericOrString() {
    must(
      ['ket', 'cred', 'transmission'].includes(self.type),
      `Expected a number or transmission, found ${self.type.description}`
    )
  },
  isBoolean() {
    must(
      self.type === 'absolute',
      `Expected an absolute, found ${util.inspect(self)}`
    )
  },
  isInteger() {
    must(self.type === 'cred', `Expected a cred, found ${self.type}`)
  },

  isAType() {
    must(
      ['transmission', 'cred', 'absolute', 'ket'].includes(self) ||
        self.constructor === TomeType ||
        self.constructor === HolocronType
    )
  },

  hasSameTypeAs(other) {
    must(self.type === other.type, 'Operands do not have the same type')
  },
  allHaveSameType() {
    must(
      self.slice(1).every((e) => e.type === self[0].type),
      'Not all elements have the same type'
    )
  },
  allHaveSameKeyValueTypes() {
    must(
      self
        .slice(1)
        .every(
          (e) =>
            e.key.type === self[0].key.type &&
            e.value.type === self[0].value.type
        ),
      'Not all key_value types have the same types'
    )
  },
  isAssignableTo(type) {
    if (typeof self === 'string') {
      must(self === type, `Cannot assign a ${type} to a ${self}`)
    } else if (self.constructor === TomeType) {
      must(
        type.constructor === TomeType && type.baseType === self.baseType,
        `Cannot assign a ${type.baseType} to a ${self.baseType}`
      )
    } else {
      must(
        type.constructor === HolocronType &&
          type.keyType === self.keyType &&
          type.valueType === self.valueType,
        `Cannot assign a ${type} to a ${self}`
      )
    }
  },
  isInsideALoop() {
    must(self.inLoop, 'Break can only appear in a loop')
  },
  isCallable() {
    must(self.constructor == Order, 'Call of non-function or non-constructor')
  },
  isReturnableFrom(f) {
    check(self.type).isAssignableTo(f.returnType)
  },
  match(params) {
    must(
      params.length === self.length,
      `${params.length} argument(s) required but ${self.length} passed`
    )
    params.forEach((p, i) => check(self[i].type).isAssignableTo(p.type))
  },
  matchParametersOf(callee) {
    check(self).match(callee.parameters)
  },
})

class Context {
  constructor(parent = null, configuration = {}) {
    this.parent = parent
    this.locals = new Map()
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false
    this.function = configuration.forFunction ?? parent?.function ?? null
  }
  sees(name) {
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    if (this.sees(name)) {
      throw new Error(`Identifier ${name} already declared`)
    }
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    throw new Error(`Identifier ${name} not declared`)
  }
  newChild(configuration = {}) {
    return new Context(this, configuration)
  }
  analyze(node) {
    console.log(node.constructor.name)
    return this[node.constructor.name](node)
  }
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  Command(d) {
    d.initializer = this.analyze(d.initializer)
    check(d.initializer.type).isAssignableTo(d.variable.type)
    this.add(d.variable.name, d.variable)
    return d
  }
  OrderDeclaration(d) {
    check(d.fun.returnType).isAType()
    const childContext = this.newChild({ inLoop: false, forFunction: d.fun })
    d.fun.parameters = childContext.analyze(d.fun.parameters)
    this.add(d.fun.name, d.fun)
    d.body = childContext.analyze(d.body)
    return d
  }
  Parameter(p) {
    p.type = this.analyze(p.type)
    check(p.type).isAType()
    this.add(p.name, p)
    return p
  }
  Increment(s) {
    s.variable = this.analyze(s.variable)
    check(s.variable).isInteger()
    return s
  }
  Next(s) {
    s.variable = this.analyze(s.variable)
    check(s.variable).isInteger()
    return s
  }
  Designation(s) {
    s.source = this.analyze(s.source)
    s.target = this.analyze(s.target)
    check(s.source.type).isAssignableTo(s.target.type)
    return s
  }
  Execute(s) {
    s.returnValue = this.analyze(s.returnValue)
    check(s.returnValue).isReturnableFrom(this.function)
    return s
  }
  Print(s) {
    s.argument = this.analyze(s.argument)
    return s
  }
  Unleash(s) {
    check(this).isInsideALoop()
    return s
  }
  IfStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.consequent = this.newChild().analyze(s.consequent)
    if (s.alternate.constructor === Array) {
      // It's a block of statements, make a new context
      s.alternate = this.newChild().analyze(s.alternate)
    } else if (s.alternate) {
      // It's a trailing if-statement, so same context
      s.alternate = this.analyze(s.alternate)
    }
    return s
  }
  ShortIfStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.consequent = this.newChild().analyze(s.consequent)
    return s
  }
  WhileStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  ForStatement(s) {
    s.assignment = this.analyze(s.assignment)
    s.expression = this.analyze(s.expression)
    s.next = this.analyze(s.next)
    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  BinaryExpression(e) {
    e.left = this.analyze(e.left)
    e.right = this.analyze(e.right)
    if (['+'].includes(e.op)) {
      check(e.left).isNumericOrString()
      check(e.left).hasSameTypeAs(e.right)
      e.type = e.left.type
    } else if (['-', '*', '/', '%', '**'].includes(e.op)) {
      check(e.left).isNumeric()
      check(e.left).hasSameTypeAs(e.right)
      e.type = e.left.type
    } else if (['<', '<=', '>', '>='].includes(e.op)) {
      check(e.left).isNumericOrString()
      check(e.left).hasSameTypeAs(e.right)
      e.type = 'absolute'
    } else if (['onewith', '!onewith'].includes(e.op)) {
      check(e.left).hasSameTypeAs(e.right)
      e.type = 'absolute'
    } else if (['and', 'or'].includes(e.op)) {
      check(e.left).isBoolean()
      check(e.right).isBoolean()
      e.type = 'absolute'
    }
    return e
  }
  UnaryExpression(e) {
    e.operand = this.analyze(e.operand)
    if (e.op === '-') {
      check(e.operand).isNumeric()
      e.type = e.operand.type
    } else if (e.op === 'darth') {
      check(e.operand).isBoolean()
      e.type = 'absolute'
    }
    return e
  }
  SubscriptExpression(e) {
    e.array = this.analyze(e.array)
    e.type = e.array.type.baseType
    e.index = this.analyze(e.index)
    check(e.index).isInteger()
    return e
  }
  ArrayExpression(a) {
    a.elements = this.analyze(a.elements)
    check(a.elements).allHaveSameType()
    a.type = new TomeType(a.elements[0].type)
    return a
  }
  DictExpression(d) {
    d.elements = this.analyze(d.elements)
    check(d.elements).allHaveSameKeyValueTypes()
    d.type = new HolocronType(d.elements[0].key.type, d.elements[0].value.type)
    return d
  }
  DictContent(c) {
    c.key = this.analyze(c.key)
    c.value = this.analyze(c.value)
    return c
  }
  Call(c) {
    c.callee = this.analyze(c.callee)
    check(c.callee).isCallable()
    c.args = this.analyze(c.args)
    check(c.args).matchParametersOf(c.callee)
    c.type = c.callee.returnType
    return c
  }
  CallStmt(c) {
    c.callee = this.analyze(c.callee)
    check(c.callee).isCallable()
    c.args = this.analyze(c.args)
    check(c.args).matchParametersOf(c.callee)
    c.type = c.callee.returnType
    return c
  }
  Literal(e) {
    if (Number.isInteger(e.value)) {
      e.type = 'cred'
    } else if (['light', 'dark'].includes(e.value)) {
      e.type = 'absolute'
    } else if (typeof e.value === 'number') {
      e.type = 'ket'
    } else if (typeof e.value === 'string') {
      e.type = 'transmission'
    }
    return e
  }
  String(e) {
    return e
  }
  id(e) {
    return this.lookup(e.name)
  }
  Array(a) {
    return a.map((item) => this.analyze(item))
  }
}

export default function analyze(node) {
  const initialContext = new Context()
  return initialContext.analyze(node)
}
