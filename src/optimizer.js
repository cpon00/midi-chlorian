import * as ast from './ast.js'
import util from 'util'

export default function optimize(node) {
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },

  Command(c) {
    c.initializer = optimize(c.initializer)
    return c
  },

  Designation(s) {
    s.source = optimize(s.source)
    s.target = optimize(s.target)
    if (s.source === s.target) {
      return []
    }
    return s
  },

  Variable(v) {
    return v
  },

  OrderDeclaration(d) {
    d.body = optimize(d.body)
    return d
  },

  Order(o) {
    return o
  },

  Parameter(p) {
    return p
  },

  TomeType(t) {
    return t
  },

  HolocronType(t) {
    return t
  },

  Increment(s) {
    return s
  },

  Next(s) {
    return s
  },

  Execute(s) {
    s.returnValue = optimize(s.returnValue)
    return s
  },

  Print(s) {
    s.argument = optimize(s.argument)
    return s
  },

  Unleash(s) {
    return s
  },

  IfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = optimize(s.consequent)
    s.alternate = optimize(s.alternate)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : s.alternate
    }
    return s
  },

  ShortIfStatement(s) {
    s.test = optimize(s.test)
    s.consequent = optimize(s.consequent)
    if (s.test.constructor === Boolean) {
      return s.test ? s.consequent : []
    }
    return s
  },

  WhileStatement(s) {
    s.test = optimize(s.test)
    if (s.test === false) {
      // while false is a no-op
      return []
    }
    s.body = optimize(s.body)
    return s
  },

  ForStatement(s) {
    s.expression = optimize(s.expression)
    if (!s.expression) {
      // repeat 0 times is a no-op
      return []
    }
    s.body = optimize(s.body)
    return s
  },

  BinaryExpression(e) {
    e.left = optimize(e.left)
    e.right = optimize(e.right)
    if (e.op === 'and') {
      // Optimize boolean constants in "and" and "or"
      if (e.left === true) return e.right
      else if (e.right === true) return e.left
    } else if (e.op === 'or') {
      if (e.left === false) return e.right
      else if (e.right === false) return e.left
    } else if (e.left.constructor === Number) {
      if (e.right.constructor === Number) {
        if (e.op === '+') return e.left + e.right
        else if (e.op === '-') return e.left - e.right
        else if (e.op === '*') return e.left * e.right
        else if (e.op === '/') return e.left / e.right
        else if (e.op === '**') return e.left ** e.right
        else if (e.op === '<') return e.left < e.right
        else if (e.op === '<=') return e.left <= e.right
        else if (e.op === 'onewith') return e.left === e.right
        else if (e.op === '!onewith') return e.left !== e.right
        else if (e.op === '>=') return e.left >= e.right
        else if (e.op === '>') return e.left > e.right
      } else if (e.left === 0 && e.op === '+') return e.right
      else if (e.left === 1 && e.op === '*') return e.right
      else if (e.left === 0 && e.op === '-')
        return new ast.UnaryExpression('-', e.right)
      else if (e.left === 1 && e.op === '**') return 1
      else if (e.left === 0 && ['*', '/'].includes(e.op)) return 0
    } else if (e.right.constructor === Number) {
      // Numeric constant folding when right operand is constant
      if (['+', '-'].includes(e.op) && e.right === 0) return e.left
      else if (['*', '/'].includes(e.op) && e.right === 1) return e.left
      else if (e.op === '*' && e.right === 0) return 0
      else if (e.op === '**' && e.right === 0) return 1
    }
    return e
  },

  UnaryExpression(e) {
    e.operand = optimize(e.operand)
    if (e.operand.constructor === Number) {
      if (e.op === '-') {
        return -e.operand
      }
    }
    if (e.op === 'darth' && (e.operand === true || e.operand === false)) {
      return !e.operand
    }
    return e
  },

  SubscriptExpression(e) {
    e.array = optimize(e.array)
    e.index = optimize(e.index)
    return e
  },

  ArrayExpression(e) {
    e.elements = optimize(e.elements)
    return e
  },

  DictExpression(e) {
    return e
  },

  DictContent(c) {
    c.key = optimize(c.key)
    c.value = optimize(c.value)
    return c
  },

  Call(c) {
    c.callee = optimize(c.callee)
    c.args = optimize(c.args)
    return c
  },

  CallStmt(c) {
    c.callee = optimize(c.callee)
    c.args = optimize(c.args)
    return c
  },

  Literal(e) {
    if (e.type === 'absolute') {
      return e.value === 'light'
    }
    return e.value
  },

  Number(e) {
    return e
  },

  Boolean(e) {
    return e
  },

  String(e) {
    return e
  },

  Array(a) {
    // Flatmap since each element can be an array
    return a.flatMap(optimize)
  },
}
