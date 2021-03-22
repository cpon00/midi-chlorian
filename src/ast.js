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
    // [util.inspect.custom]() {
    //   return prettied(this)
    // }
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

export class Print {
    constructor(argument) {
        this.argument = argument
    }
}
export class HolocronContent {
    constructor(literal, expression) {
        Object.assign(this, { literal, expression })
    }
}

export class HolocronObj {
    constructor(content) {
        this.content = content
    }
}

export class Return {
    constructor(returnValue) {
        this.returnValue = returnValue
    }
}

export class Unleash {
    //intentionally empty
}

export class IfStatement {
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

export class Exp {
    constructor(expression1, expression2) {
        Object.assign(this, { expression1, expression2 })
    }
}

export class Exp1 {
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

export class ArrayExp {
    constructor(elements) {
        this.elements = elements
    }
}

export class Increment {
    constructor(id, operation) {
        Object.assign(this, { id, operation })
    }
}
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
export class Call {
    constructor(callee, args) {
        Object.assign(this, { callee, args })
    }
}

export class Literal {
    constructor(type) {
        this.type = type
    }
}
export class LitList {
    constructor(type) {
        this.type = type
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
