//Imported from https://github.com/rtoal/carlos-lang/blob/main/src/analyzer.js

// Semantic Analyzer
//
// Analyzes the AST by look r semantic errors and resolving references.

import { Type, OrderDeclaration, Order, TomeType, HolocronType } from './ast.js'
import * as stdlib from './stdlib.js'

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

// //TYPE EQUIVALENCE
Object.assign(Type.prototype, {
  // Equivalence: when are two types the same
  isEquivalentTo(target) {
    return this == target
  },
  // T1 assignable to T2 is when x:T1 can be assigned to y:T2. By default
  // this is only when two types are equivalent; however, for other kinds
  // of types there may be special rules. For example, in a language with
  // supertypes and subtypes, an object of a subtype would be assignable
  // to a variable constrained to a supertype.
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  },
})

//ARRAY TYPE EQUIVALENCE
Object.assign(TomeType.prototype, {
  isEquivalentTo(target) {
    // [T] equivalent to [U] only when T is equivalent to U.
    return (
      target.constructor === TomeType &&
      this.baseType.isEquivalentTo(target.baseType)
    )
  },
  isAssignableTo(target) {
    // Arrays are INVARIANT in Carlos!
    return this.isEquivalentTo(target)
  },
})

//FUNCTIONS
//Function object has parameters and return type
//During calls: check arguments against function, as we store params and returnType in function
//FUNCTION TYPE EQUIVALENCE
//ONLY NEED FOR BASIC TYPES

const check = (self) => ({
  isNumeric() {
    must(
      [Type.INT, Type.FLOAT].includes(self.type),
      `Expected a number, found ${self.type.description}`
    )
  },
  isNumericOrString() {
    must(
      [Type.INT, Type.FLOAT, Type.STRING].includes(self.type),
      `Expected a number or transmission, found ${self.type.description}`
    )
  },
  isBoolean() {
    must(
      self.type === Type.BOOLEAN,
      `Expected an absolute, found ${self.type.description}`
    )
  },
  isInteger() {
    must(
      self.type === Type.INT,
      `Expected a cred, found ${self.type.description}`
    )
  },

  isAType() {
    must(
      ['transmission', 'cred', 'absolute', 'ket'].includes(self) ||
        self.constructor === TomeType ||
        self.constructor === HolocronType
    )
  },

  isAnArray() {
    must(self.type.constructor === TomeType, 'Array expected')
  },
  isADict() {
    must(self.type.constructor === DictType, 'Dict expected')
  },
  hasSameTypeAs(other) {
    must(
      self.type.isEquivalentTo(other.type),
      'Operands do not have the same type'
    )
  },
  allHaveSameType() {
    must(
      self.slice(1).every((e) => e.type.isEquivalentTo(self[0].type)),
      'Not all elements have the same type'
    )
  },
  // isNotRecursive() {
  //   must(
  //     !self.fields.map((f) => f.type).includes(self),
  //     "Struct type must not be recursive"
  //   );
  // },
  isAssignableTo(type) {
    // self is a type, can objects of self be assigned to vars of type
    must(
      self.type.isAssignableTo(type),
      `Cannot assign a ${self.type.description} to a ${type.description}`
    )
  },
  isNotReadOnly() {
    must(!self.readOnly, `Cannot assign to constant ${self.name}`)
  },
  areAllDistinct() {
    must(
      new Set(self.map((f) => f.name)).size === self.length,
      'Fields must be distinct'
    )
  },
  isInTheObject(object) {
    must(object.type.fields.map((f) => f.name).includes(self), 'No such field')
  },
  isInsideALoop() {
    must(self.inLoop, 'Break can only appear in a loop')
  },
  isInsideAFunction(context) {
    must(self.function, 'Return can only appear in a function')
  },
  isCallable() {
    must(
      self.type.constructor == OrderType,
      'Call of non-function or non-constructor'
    )
  },
  returnsNothing() {
    must(
      self.type.returnType === Type.VOID,
      'Something should be returned here'
    )
  },
  returnsSomething() {
    must(self.type.returnType !== Type.VOID, 'Cannot return a value here')
  },
  isReturnableFrom(f) {
    check(self).isAssignableTo(f.type.returnType)
  },
  match(targetTypes) {
    // self is the array of arguments
    must(
      targetTypes.length === self.length,
      `${targetTypes.length} argument(s) required but ${self.length} passed`
    )
    targetTypes.forEach((type, i) => check(self[i]).isAssignableTo(type))
  },
  matchParametersOf(calleeType) {
    check(self).match(calleeType.paramTypes)
  },
  matchFieldsOf(type) {
    check(self).match(type.fields.map((f) => f.type))
  },
})

class Context {
  constructor(parent = null, configuration = {}) {
    // Parent (enclosing scope) for static scope analysis
    this.parent = parent
    // All local declarations. Names map to variable declarations, types, and
    // function declarations
    this.locals = new Map()
    // Whether we are in a loop, so that we know whether breaks and continues
    // are legal here
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false
    // Whether we are in a function, so that we know whether a return
    // statement can appear here, and if so, how we typecheck it
    this.function = configuration.forFunction ?? parent?.function ?? null
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    // No shadowing! Prevent addition if id anywhere in scope chain!
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
    // Create new (nested) context, which is just like the current context
    // except that certain fields can be overridden
    return new Context(this, configuration)
  }
  analyze(node) {
    //console.log('ANALYZE: ' + node.constructor.name)
    return this[node.constructor.name](node)
  }
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  Command(d) {
    // Only analyze the declaration, not the variable
    d.initializer = this.analyze(d.initializer)
    d.variable.type = d.initializer.type
    this.add(d.variable.name, d.variable)
    return d
  }
  //NEED TO FIX TODO
  Type(t) {
    if (typeof t === 'string') {
      if (t === 'absolute') return Type.BOOLEAN
      if (t === 'cred') return Type.INT
      if (t === 'transmission') return Type.STRING
      if (t === 'ket') return Type.FLOAT
      throw new Error('cringe')
    } else if (t.constructor === TomeType) {
      t.baseType = this.Type(t.baseType)
      return t
    } else {
      t.keyType = this.Type(t.keyType)
      t.valueType = this.Type(t.valueType)
      return t
    }
  }
  Body(f) {
    f.type = this.analyze(f.type)
    check(f.type).isAType()
    return f
  }

  OrderDeclaration(d) {
    // d.fun.returnType = d.fun.returnType
    //   ? this.analyze(d.fun.returnType)
    //   : Type.VOID
    check(d.fun.returnType).isAType()
    // When entering a function body, we must reset the inLoop setting,
    // because it is possible to declare a function inside a loop!
    const childContext = this.newChild({ inLoop: false, forFunction: d.fun })
    d.fun.parameters = childContext.analyze(d.fun.parameters)
    // d.fun.type = new OrderType(
    //   d.fun.parameters.map((p) => p.type),
    //   d.fun.returnType
    // )
    // Add before analyzing the body to allow recursion
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
  TomeType(t) {
    t.baseType = this.analyze(t.baseType)
    return t
  }

  Increment(s) {
    s.variable = this.analyze(s.variable)
    check(s.variable).isInteger()
    return s
  }
  Designation(s) {
    s.source = this.analyze(s.source)
    s.target = this.analyze(s.target)
    check(s.source).isAssignableTo(s.target.type)
    check(s.target).isNotReadOnly()
    return s
  }
  Execute(s) {
    check(this).isInsideAFunction()
    check(this.function).returnsSomething()
    s.expression = this.analyze(s.expression)
    check(s.expression).isReturnableFrom(this.function)
    return s
  }
  Unleash(s) {
    check(this).isInsideALoop()
    return s
  }
  // ShortReturnStatement(s) {
  //   check(this).isInsideAFunction()
  //   check(this.function).returnsNothing()
  //   return s
  // }
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
  WhileStatement(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }

  //For Loop Statement, need help with this
  ForRangeStatement(s) {
    s.low = this.analyze(s.low)
    check(s.low).isInteger()
    s.high = this.analyze(s.high)
    check(s.high).isInteger()
    s.iterator = new Variable(s.iterator, true)
    s.iterator.type = Type.INT
    const bodyContext = this.newChild({ inLoop: true })
    bodyContext.add(s.iterator.name, s.iterator)
    s.body = bodyContext.analyze(s.body)
    return s
  }
  ForStatement(s) {
    s.collection = this.analyze(s.collection)
    check(s.collection).isAnArray()
    s.iterator = new Variable(s.iterator, true)
    s.iterator.type = s.collection.type.baseType
    const bodyContext = this.newChild({ inLoop: true })
    bodyContext.add(s.iterator.name, s.iterator)
    s.body = bodyContext.analyze(s.body)
    return s
  }
  //TODO
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
      e.type = Type.BOOLEAN
    } else if (['oneWith', '!oneWith'].includes(e.op)) {
      check(e.left).hasSameTypeAs(e.right)
      e.type = Type.BOOLEAN
    } else if (['and', 'or'].includes(e.op)) {
      check(e.left).isBoolean()
      check(e.right).isBoolean()
      e.type = Type.BOOLEAN
    }
    return e
  }
  //TODO
  UnaryExpression(e) {
    e.operand = this.analyze(e.operand)
    if (e.op === '#') {
      check(e.operand).isAnArray()
      e.type = Type.INT
    } else if (e.op === '-') {
      check(e.operand).isNumeric()
      e.type = e.operand.type
    } else if (e.op === '!') {
      check(e.operand).isBoolean()
      e.type = Type.BOOLEAN
    } else {
      // Operator is "some"
      e.type = new OptionalType(e.operand.type)
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
    a.type = new ArrayType(a.elements[0].type)
    return a
  }
  Call(c) {
    c.callee = this.analyze(c.callee)
    check(c.callee).isCallable()
    c.args = this.analyze(c.args)
    if (c.callee.constructor === StructType) {
      check(c.args).matchFieldsOf(c.callee)
      c.type = c.callee
    } else {
      check(c.args).matchParametersOf(c.callee.type)
      c.type = c.callee.type.returnType
    }
    return c
  }
  Literal(e) {
    if (Number.isInteger(e.value)) {
      e.type = Type.INT
    } else if (typeof e.value === 'number') {
      e.type = Type.FLOAT
    } else if (typeof e.value === 'string') {
      e.type = Type.STRING
    } else if (typeof e.value === 'boolean') {
      e.type = Type.BOOLEAN
    }
    return e
  }
  Symbol(e) {
    // Symbols represent identifiers so get resolved to the entities referred to
    return this.lookup(e.description)
  }
  Number(e) {
    return e
  }
  BigInt(e) {
    return e
  }
  Boolean(e) {
    return e
  }
  String(e) {
    return e
  }
  Array(a) {
    return a.map((item) => this.analyze(item))
  }
}

export default function analyze(node) {
  // Allow primitives to be automatically typed
  Number.prototype.type = Type.KET
  BigInt.prototype.type = Type.CRED
  Boolean.prototype.type = Type.ABSOLUTE
  String.prototype.type = Type.TRANSMISSION
  Type.prototype.type = Type.TYPE
  const initialContext = new Context()

  // Add in all the predefined identifiers from the stdlib module
  const library = { ...stdlib.types, ...stdlib.constants, ...stdlib.functions }
  for (const [name, type] of Object.entries(library)) {
    initialContext.add(name, type)
  }
  return initialContext.analyze(node)
}
