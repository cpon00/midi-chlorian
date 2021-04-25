import { IfStatement, Increment, Literal, Type } from './ast.js'
import * as stdlib from './stdlib.js'

export default function generate(program) {
  const output = []

  const standardFunctions = new Map([
    //add stdlib functions here
  ])

  const targetName = ((mapping) => {
    return (entity) => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name ?? entity.description}_${mapping.get(entity)}`
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

    Type(t) {
      //table for later, TODO
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
      return `${gen(s.variable)}${s.op}`

      //output.push(`${gen(s.variable)}${s.op}`)
    },

    Execute(e) {
      output.push(`return ${gen(e.returnValue)}`)
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
        output.push('} else')
        gen(s.alternate)
      } else {
        output.push('} else {')
        gen(s.alternate)
        output.push('}')
      }
    },

    WhileStatement(s) {
      output.push(`while (${gen(s.test)}) {`)
      gen(s.body)
      output.push('}')
    },

    ForStatement(s) {
      output.push(
        `for (let ${gen(s.assignment.variable)} = ${gen(
          s.assignment.variable
        )}; ${gen(s.expression)}; ${gen(s.increment)}) {`
      )
      gen(s.body)
      output.push('}')
      // output.push(
      //   `for (let ${gen(s.assignment.variable.name)} = ${gen(
      //     s.assignment.variable.initializer
      //   )}; ${gen(s.expression.left.name)} ${gen(s.expression.op)} ${gen(
      //     s.expression.right.value
      //   )}; ${gen(s.increment.variable.name)} ${gen(s.increment.op)}) {`
      // )
      // gen(s.body)
      // output.push('}')
    },

    BinaryExpression(e) {
      //prettier-ignore
      const op = { 'onewith': '===', '!onewith': '!==' }[e.op] ?? e.op
      return `${gen(e.left)} ${op} ${gen(e.right)}`
    },

    UnaryExpression(e) {
      return `${e.op}${gen(e.operand)}`
    },

    //TODO
    SubscriptExpression(e) {
      return `${e}`
    },
    //TODO
    ArrayExpression(e) {
      const array = []
      console.log(' Expression:   ', e)
      for (let element of e.elements) {
        console.log('Element:  ', element)
        array.push(`${gen(element)}`)
      }
      return `[` + array + `]`
    },

    //TODO
    DictExpression(e) {
      const array = []
      console.log('Dict Expression:   ', e)
      for (let element of e.elements) {
        array.push(`${gen(element)}`)
      }
      return `[` + array + `]`
    },

    //shouldnt these be switched?

    //TODO
    DictContent(c) {
      return `${c}`
    },

    Call(c) {
      const callCode = `${gen(c.callee)}(${gen(c.args)})`
      if (c.callee.returnType) {
        return callCode
      }
      output.push(callCode)
    },

    id(i) {
      return `${i.name}`
    },

    Literal(l) {
      if (l.type === 'absolute') {
        let bool = l.value === 'light' ? true : false
        return bool
      }
      return JSON.stringify(l.value)
    },

    Array(a) {
      return a.map(gen)
    },
  }

  gen(program)
  return output.join('\n')
}
