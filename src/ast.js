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

export class Directive {
    constructor(statements) {
        this.statements = statements
    }
    [util.inspect.custom]() {
        return prettied(this)
    }
}

// export class VariableDeclaration {
//     constructor(name, initializer) {
//         Object.assign(this, { name, initializer })
//     }
// }

// export class Variable {
//     constructor(name) {
//         this.name = name
//     }
// }

// export class Assignment {
//     constructor(target, source) {
//         Object.assign(this, { target, source })
//     }
// }

export class Order {
    constructor(type, parameters, block) {
        Object.assign(this, { type, parameters, block })
    }
}

export class Transmission {
    constructor(type, parameters, block) {
        Object.assign(this, { type, parameters, block })
    }
}

export class Midichlorian {
    constructor(argument) {
        this.argument = argument
    }
}

export class ForceLoop {
    constructor(initializer, test, inc, body) {
        Object.assign(this, { initializer, test, inc, body })
    }
}

export class Emit {
    constructor(arg) {
        this.argument = arg
    }
}

export class Arguments {
    constructor(args) {
        this.args = args
    }
}

export class Parameter {
    constructor(names, types) {
        Object.assign(this, { names, types })
    }
}

export class BinaryExpression {
    constructor(operation, left, right) {
        Object.assign(this, { operation, left, right })
    }
}

// export class UnaryExpression {
//     constructor(op, operand) {
//         Object.assign(this, { op, operand })
//     }
// }

// export class IdentifierExpression {
//     constructor(name) {
//         this.name = name
//     }
// }

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
