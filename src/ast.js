// from https://github.com/rtoal/ael-ohm/blob/master/src/ast.js

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

export class Program {
    constructor(statements) {
      this.statements = statements
    }
    [util.inspect.custom]() {
      return prettied(this)
    }
  }
  
  export class Assignment {
    constructor(type, target, source) {
      Object.assign(this, { type, target, source })
    }
  }
  
  export class Declaration {
    constructor(type, targets) {
      Object.assign(this, { type, targets })
    }
  }
  
  export class Reassignment {
    constructor(targets, sources) {
      Object.assign(this, { targets, sources })
    }
  }
  
  export class ArrayType {
    constructor(type, baseType) {
      Object.assign(this, { type, baseType })
    }
  }
  
  export class Dictionary {
    constructor(type, targets, sources) {
      Object.assign(this, { type, targets, sources })
    }
  }
  
  export class DictContent {
    constructor(literal, expression) {
      Object.assign(this, { literal, expression })
    }
  }
  
  export class DictionaryList {
    constructor(content) {
      this.content = content
    }
  }
  
  export class Conditional {
    constructor(sources, blocks) {
      Object.assign(this, { sources, blocks })
    }
  }
  
  export class WLoop {
    constructor(test, body) {
      Object.assign(this, { test, body })
    }
  }
  
  export class FLoop {
    constructor(initializer, test, increment, body) {
      Object.assign(this, { initializer, test, increment, body })
    }
  }
  
  export class Block {
    constructor(statements) {
      this.statement = statements
    }
  }
  
  export class Function {
    constructor(type, parameters, block) {
      Object.assign(this, { type, parameters, block })
    }
  }
  
  export class Print {
    constructor(argument) {
      this.argument = argument
    }
  }
  
  export class Return {
    constructor(returnValue) {
      this.returnValue = returnValue
    }
  }
  
  export class Call {
    constructor(callee, args) {
      Object.assign(this, { callee, args })
    }
  }
  
  export class Arguments {
    constructor(argumentList) {
      this.argumentList = argumentList
    }
  }
  
  export class Params {
    constructor(type1, id1, type2, id2) {
      Object.assign(this, { type1, id1, type2, id2 })
    }
  }
  
  export class LiteralList {
    constructor(literals) {
      this.literals = literals
    }
  }
  
  export class IdentifierExpression {
    constructor(name) {
      this.name = name
    }
  }
  
  export class Increment {
    constructor(identifier) {
      this.identifier = identifier
    }
  }
  
  export class Literal {
    constructor(type) {
      this.type = type
    }
  }
  
  export class Exp {
    constructor(expression1, expression2) {
      Object.assign(this, { expression1, expression2 })
    }
  }
  
  export class Exp2 {
    constructor(expression1, expression2) {
      Object.assign(this, { expression1, expression2 })
    }
  }
  
  export class Exp3 {
    constructor(expression1, expression2) {
      Object.assign(this, { expression1, expression2 })
    }
  }
  
  export class Exp4 {
    constructor(expression1, expression2) {
      Object.assign(this, { expression1, expression2 })
    }
  }
  
  export class Exp5 {
    constructor(expression1, expression2) {
      Object.assign(this, { expression1, expression2 })
    }
  }
  
  export class Exp6 {
    constructor(expression1, expression2) {
      Object.assign(this, { expression1, expression2 })
    }
  }
  
  export class Exp7 {
    constructor(expression) {
      this.expression = expression
    }
  }
  
  export class Exp8 {
    constructor(expression) {
      this.expression = expression
    }
  }

export class Program {
    constructor(directives) {
        this.directives = directives
    }
    [util.inspect.custom]() {
        return prettied(this)
    }
}

export class Type {
    constructor(name) {
        this.name = name
    }
    static BOOLEAN = new Type("absolute")
    static INT = new Type("cred")
    static DOUBLE = new Type("ket")
    static CHAR = new Type("midichlorian")
    static STRING = new Type("transmission")

}

export class TypeName {
    constructor
}

export class Command {
    constructor(variables, initializers) {
        Object.assign(this, { variables, initializers })
    }
}

export class Order {
    constructor(id, parameters, body) {
        Object.assign(this, { id, parameters, body })
    }
}

export class Designation {
    constructor(targets, sources) {
        Object.assign(this, { targets, sources })
    }
}

export class WhileLoop {
    constructor(test, body) {
        Object.assign(this, { test, body })
    }
}

export class Param {
    constructor(name, type) {
        Object.assign(this, { name, type })
    }
}

export class ForLoop {
    constructor(iterator, range, body) {
        Object.assign(this, { iterator, range, body })
    }
}

export class PrintStatement {
    constructor(argument) {
        this.argument = argument
    }
}

export class ReturnStatement {
    constructor(returnValue) {
        this.returnValue = returnValue
    }
}

export class IfStmt {
    constructor(condition, execution) {
        Object.assign(this, { condition, execution })
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

function prettied(node) {
    // Return a compact and pretty string representation of the node graph,
    // taking care of cycles. Written here from scratch because the built-in
    // inspect function, while nice, isn't nice enough.
    const tags = new Map()

    function tag(node) {
        if (tags.has(node) || typeof node !== 'object' || node === null) return
        tags.set(node, tags.size + 1)
        for (const child of Object.values(node)) {
            Array.isArray(child) ? child.forEach(tag) : tag(child)
        }
    }

    function* lines() {
        function view(e) {
            if (tags.has(e)) return `#${tags.get(e)}`
            if (Array.isArray(e)) return `[${e.map(view)}]`
            return util.inspect(e)
        }
        for (let [node, id] of [...tags.entries()].sort(
            (a, b) => a[1] - b[1]
        )) {
            let [type, props] = [node.constructor.name, '']
            Object.entries(node).forEach(
                ([k, v]) => (props += ` ${k}=${view(v)}`)
            )
            yield `${String(id).padStart(4, ' ')} | ${type}${props}`
        }
    }

    tag(node)
    return [...lines()].join('\n')
}
