//Imported from https://github.com/rtoal/carlos-compiler/blob/11-strings/src/analyzer.js
//TO DO: change import values below to specific types as stated in Midi-chlorian grammar.
//Will also need to change object names within each function.
import { Variable, Type, FunctionType, Function, ArrayType } from './ast.js'
import * as stdlib from './stdlib.js'

function must(condition, errorMessage) {
    if (!condition) {
        throw new Error(errorMessage)
    }
}

// In this language, basic types are only compatible if equivalent
Type.prototype.isAssignableTo = function (target) {
    return this === target
}

ArrayType.prototype.isAssignableTo = function (target) {
    return (
        target.constructor === ArrayType &&
        this.baseType.isAssignableTo(target.baseType)
    )
}

// Contravariance for parameters and covariance for return types
FunctionType.prototype.isAssignableTo = function (target) {
    return (
        target.constructor === FunctionType &&
        this.returnType.isAssignableTo(target.returnType) &&
        this.parameterTypes.length === target.parameterTypes.length &&
        this.parameterTypes.every((t, i) =>
            target.parameterTypes[i].isAssignableTo(t)
        )
    )
}

const check = {
    isNumber(e) {
        must(
            e.type === Type.NUMBER,
            `Expected a number but got a ${e.type.name}`
        )
    },
    isBoolean(e) {
        must(
            e.type === Type.BOOLEAN,
            `Expected a boolean but got a ${e.type.name}`
        )
    },
    isType(t) {
        must([Type, FunctionType].includes(t.constructor), 'Type expected')
    },
    haveSameTypes(e1, e2) {
        must(e1.type === e2.type, 'Operands do not have the same type')
    },
    isTypeAssignable(from, { to }) {
        must(
            from.isAssignableTo(to),
            `Cannot assign a ${from.name} to a ${to.name}`
        )
    },
    isAssignable(from, { to }) {
        check.isTypeAssignable(from.type, { to: to.type })
    },
    isNotReadOnly(e) {
        must(!e.readOnly, `Cannot assign to constant ${e.name}`)
    },
    inLoop(context, disruptor) {
        must(context.inLoop, `'${disruptor}' can only appear in a loop`)
    },
    inFunction(context) {
        must(context.function, 'Return can only appear in a function')
    },
    isCallable(e) {
        must(e.type.constructor === FunctionType, 'Call of non-function')
    },
    returnsNothing(f) {
        must(
            f.type.returnType === Type.VOID,
            'Something should be returned here'
        )
    },
    returnsSomething(f) {
        must(f.type.returnType !== Type.VOID, 'Cannot return a value here')
    },
    isReturnable(e, { from: f }) {
        check.isTypeAssignable(e.type, { to: f.type.returnType })
    },
    argumentsMatchParameters({ args, callee }) {
        const paramCount = callee.type.parameterTypes.length
        const argCount = args.length
        must(
            paramCount === argCount,
            `${paramCount} parameter(s) required but ${argCount} argument(s) passed`
        )
        callee.type.parameterTypes.forEach((parameterType, i) =>
            check.isTypeAssignable(args[i].type, { to: parameterType })
        )
    },
}

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
        return this[node.constructor.name](node)
    }
    Program(p) {
        p.statements = this.analyze(p.statements)
        return p
    }
    VariableDeclaration(d) {
        // Declarations generate brand new variable objects
        d.initializer = this.analyze(d.initializer)
        d.variable = new Variable(d.name, d.readOnly)
        d.variable.type = d.initializer.type
        this.add(d.variable.name, d.variable)
        return d
    }
    FunctionDeclaration(d) {
        d.returnType = d.returnType ? this.analyze(d.returnType) : Type.VOID
        // Declarations generate brand new function objects
        const f = (d.function = new Function(d.name))
        // When entering a function body, we must reset the inLoop setting,
        // because it is possible to declare a function inside a loop!
        const childContext = this.newChild({ inLoop: false, forFunction: f })
        d.parameters = childContext.analyze(d.parameters)
        f.type = new FunctionType(
            d.parameters.map((p) => p.type),
            d.returnType
        )
        // Add before analyzing the body to allow recursion
        this.add(f.name, f)
        d.body = childContext.analyze(d.body)
        return d
    }
    TypeName(t) {
        t = this.lookup(t.name)
        check.isType(t)
        return t
    }
    ArrayType(t) {
        t.baseType = this.analyze(t.baseType)
        return t
    }
    FunctionType(t) {
        t.parameterTypes = t.parameterTypes.map((p) => this.analyze(p))
        t.returnType = this.analyze(t.returnType)
        return t
    }
    Parameter(p) {
        p.type = this.analyze(p.type)
        this.add(p.name, p)
        return p
    }
    Assignment(s) {
        s.source = this.analyze(s.source)
        s.target = this.analyze(s.target)
        check.isAssignable(s.source, { to: s.target })
        check.isNotReadOnly(s.target)
        return s
    }
    PrintStatement(s) {
        s.argument = this.analyze(s.argument)
        return s
    }
    WhileStatement(s) {
        s.test = this.analyze(s.test)
        check.isBoolean(s.test, 'while')
        s.body = this.newChild({ inLoop: true }).analyze(s.body)
        return s
    }
    IfStatement(s) {
        s.test = this.analyze(s.test)
        check.isBoolean(s.test, 'if')
        s.consequent = this.newChild().analyze(s.consequent)
        if (s.alternative.constructor === Array) {
            // It's a block of statements, make a new context
            s.alternative = this.newChild().analyze(s.alternative)
        } else if (s.alternative) {
            // It's a trailing if-statement, so same context
            s.alternative = this.analyze(s.alternative)
        }
        return s
    }
    ShortIfStatement(s) {
        s.test = this.analyze(s.test)
        check.isBoolean(s.test, 'if')
        s.consequent = this.newChild().analyze(s.consequent)
        return s
    }
    ReturnStatement(s) {
        check.inFunction(this)
        check.returnsSomething(this.function)
        s.expression = this.analyze(s.expression)
        check.isReturnable(s.expression, { from: this.function })
        // if (this.function.type.returnType !== Type.VOID) {
        //   // If the current function isn't void, the return statement must have
        //   // an expression that is assignable to the return type
        //   check.isLongReturnStatement(s)
        return s
    }
    ShortReturnStatement(s) {
        check.inFunction(this)
        check.returnsNothing(this.function)
        return s
    }
    Call(c) {
        c.callee = this.analyze(c.callee)
        check.isCallable(c.callee)
        c.args = this.analyze(c.args)
        check.argumentsMatchParameters({ args: c.args, callee: c.callee })
        c.type = c.callee.type.returnType
        return c
    }
    BreakStatement(s) {
        check.inLoop(this, 'break')
        return s
    }
    ContinueStatement(s) {
        check.inLoop(this, 'continue')
        return s
    }
    OrExpression(e) {
        e.disjuncts = this.analyze(e.disjuncts)
        e.disjuncts.forEach((disjunct) => check.isBoolean(disjunct))
        e.type = Type.BOOLEAN
        return e
    }
    AndExpression(e) {
        e.conjuncts = this.analyze(e.conjuncts)
        e.conjuncts.forEach((conjunct) => check.isBoolean(conjunct))
        e.type = Type.BOOLEAN
        return e
    }
    BinaryExpression(e) {
        e.left = this.analyze(e.left)
        e.right = this.analyze(e.right)
        if (['+', '-', '*', '/', '**'].includes(e.op)) {
            check.isNumber(e.left)
            check.isNumber(e.right)
            e.type = Type.NUMBER
        } else if (['<', '<=', '>', '>='].includes(e.op)) {
            check.isNumber(e.left)
            check.isNumber(e.right)
            e.type = Type.BOOLEAN
        } else if (['==', '!='].includes(e.op)) {
            check.haveSameTypes(e.left, e.right)
            e.type = Type.BOOLEAN
        }
        return e
    }
    UnaryExpression(e) {
        e.operand = this.analyze(e.operand)
        check.isNumber(e.operand)
        e.type = Type.NUMBER
        return e
    }
    SubscriptExpression(e) {
        e.array = this.analyze(e.array)
        e.type = e.array.type.baseType
        e.element = this.analyze(e.element)
        return e
    }
    ArrayLiteral(a) {
        a.arrayType = this.analyze(a.arrayType)
        a.args = this.analyze(a.args)
        a.type = a.arrayType
        return a
    }
    IdentifierExpression(e) {
        // Id expressions get "replaced" with the variables they refer to
        return this.lookup(e.name)
    }
    Number(e) {
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
    Number.prototype.type = Type.NUMBER
    Boolean.prototype.type = Type.BOOLEAN
    String.prototype.type = Type.STRING
    Type.prototype.type = Type.TYPE
    const initialContext = new Context()

    // Add in all the predefined identifiers from the stdlib module
    const library = {
        ...stdlib.types,
        ...stdlib.constants,
        ...stdlib.functions,
    }
    for (const [name, type] of Object.entries(library)) {
        initialContext.add(name, type)
    }
    return initialContext.analyze(node)
}
