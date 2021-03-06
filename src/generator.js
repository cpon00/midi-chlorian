import { IfStatement, Increment, Literal, Type } from './ast.js'
import * as stdlib from './stdlib.js'

export default function generate(program) {
  const output = []

  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name}_${mapping.get(entity)}`
    }
  })(new Map())

  const gen = (node) => {
    return generators[node.constructor.name](node)
  }

  const generators = {
    // Key idea: when generating an expression, just return the JS string; when
    // generating a statement, write lines of translated JS to the output array.

    Program(p) {
      gen(p.statements)
    },
    Command(c) {
      output.push(`let ${gen(c.variable)} = ${gen(c.initializer)}`)
    },
    Designation(d) {
      output.push(`${gen(d.target)} = ${gen(d.source)}`)
    },
    Variable(v) {
      return targetName(v)
    },
    OrderDeclaration(o) {
      output.push(
        `function ${gen(o.fun)}(${gen(o.fun.parameters).join(', ')}) {`
      )
      gen(o.body)
      output.push('}')
    },
    Order(o) {
      return targetName(o)
    },
    Parameter(p) {
      return targetName(p)
    },
    Increment(s) {
      output.push(`${gen(s.variable)}${s.op}`)
    },
    Next(e) {
      return `${gen(e.variable)}${e.op}`
    },
    Execute(e) {
      output.push(`return (${gen(e.returnValue)})`)
    },
    Print(p) {
      output.push(`console.log(${gen(p.argument)})`)
    },
    Unleash() {
      output.push(`break`)
    },
    IfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      if (s.alternate.constructor === IfStatement) {
        output.push('} else ')
        gen(s.alternate)
      } else {
        output.push('} else {')
        gen(s.alternate)
        output.push('}')
      }
    },
    ShortIfStatement(s) {
      output.push(`if (${gen(s.test)}) {`)
      gen(s.consequent)
      output.push('}')
    },
    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`)
      gen(s.body)
      output.push('}')
    },
    ForStatement(s) {
      output.push(
        `for (let ${gen(s.assignment.variable)} = ${gen(
          s.assignment.initializer
        )}; ${gen(s.expression)}; ${gen(s.next)}) {`
      )
      gen(s.body)
      output.push('}')
    },
    BinaryExpression(e) {
      //prettier-ignore
      const op = { 'onewith': '===', '!onewith': '!==', 'darth': '!' }[e.op] ?? e.op
      return `${gen(e.left)} ${op} ${gen(e.right)}`
    },
    UnaryExpression(e) {
      //prettier-ignore
      const op = {'darth': '!' }[e.op] ?? e.op
      return `${op}${gen(e.operand)}`
    },
    SubscriptExpression(e) {
      return `${gen(e.array)}[${gen(e.index)}]`
    },
    ArrayExpression(e) {
      const array = []
      for (let element of e.elements) {
        array.push(`${gen(element)}`)
      }
      return `[` + array + `]`
    },
    DictExpression(e) {
      const array = []
      for (let element of e.elements) {
        array.push(` ${gen(element)} `)
      }
      return `{` + array + `}`
    },
    DictContent(c) {
      return `${gen(c.key)}: ${gen(c.value)}`
    },
    Call(c) {
      return `${gen(c.callee)}(${gen(c.args)})`
    },
    CallStmt(c) {
      const callCode = `${gen(c.callee)}(${gen(c.args)})`
      output.push(callCode)
    },
    Literal(l) {
      // if (l.type === 'absolute') {
      //   let bool = l.value === 'light' ? true : false
      //   return bool
      // }
      return JSON.stringify(l.value)
    },
    Number(n) {
      return n
    },
    Boolean(b) {
      return b
    },
    String(e) {
      return JSON.stringify(e)
    },
    Array(a) {
      return a.map(gen)
    },
  }

  gen(program)
  return output.join('\n')
}
