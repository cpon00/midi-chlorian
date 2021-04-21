// import { IfStatement, Type } from './ast.js'
// import * as stdlib from './stdlib.js'

// export default function generate(program) {
//   const output = []

//   const standardFunctions = new Map([
//     //add stdlib functions here
//   ])

//   const targetName = ((mapping) => {
//     return (entity) => {
//       if (!mapping.has(entity)) {
//         mapping.set(entity, mapping.size + 1)
//       }
//       return `${entity.name ?? entity.description}_${mapping.get(entity)}`
//     }
//   })(new Map())

//   const gen = (node) => generators[node.constructor.name](node)

//   const generators = {
//     // Key idea: when generating an expression, just return the JS string; when
//     // generating a statement, write lines of translated JS to the output array.
//     Program(p) {
//       gen(p.statements)
//     },
//     VariableDeclaration(d) {
//       // We don't care about const vs. let in the generated code! The analyzer has
//       // already checked that we never updated a const, so let is always fine.

//       //TODO: doublecheck to see if we need to declare the types here.

//       output.push(`let ${gen(d.variable)} = ${gen(d.initializer)};`)
//     },
//     TypeDeclaration(d) {
//       output.push(`class ${gen(d.type)} {`)
//       output.push(`constructor(${gen(d.type.fields).join(',')}) {`)
//       for (let field of d.type.fields) {
//         output.push(`this[${JSON.stringify(gen(field))}] = ${gen(field)};`)
//       }
//       output.push('}')
//       output.push('}')
//     },

//     //TODO: Check to see if this is correct here. This refers to OrderDeclaration in ast.js
//     FunctionDeclaration(d) {
//       output.push(
//         `function ${gen(d.fun)}(${gen(d.fun.parameters).join(', ')}) {`
//       )
//       gen(d.body)
//       output.push('}')
//     },
//     //TODO: parameter requires a name and a type. Doublecheck this.
//     Parameter(p) {
//       return targetName(p)
//     },

//     //Not sure if this is necessary here.
//     //TODO: variables require a name and a type.
//     Variable(v) {
//       // Standard library constants just get special treatment
//       if (v === stdlib.constants.π) {
//         return 'Math.PI'
//       }
//       return targetName(v)
//     },

//     //Not sure about this one.
//     //TODO: Doublecheck with Order in ast.js. Could require name, parameters, and returnType
//     Function(f) {
//       return targetName(f)
//     },
//     //This looks ok.
//     Increment(s) {
//       output.push(`${gen(s.variable)}++;`)
//     },
//     //this looks good
//     Assignment(s) {
//       output.push(`${gen(s.target)} = ${gen(s.source)};`)
//     },
//     BreakStatement(s) {
//       output.push('break;')
//     },
//     //Unknown if need both return and short return. Guessing on only return needed but need to check w group
//     ReturnStatement(s) {
//       output.push(`return ${gen(s.expression)};`)
//     },
//     ShortReturnStatement(s) {
//       output.push('return;')
//     },

//     //This looks ok.
//     IfStatement(s) {
//       output.push(`if (${gen(s.test)}) {`)
//       gen(s.consequent)
//       if (s.alternate.constructor === IfStatement) {
//         output.push('} else')
//         gen(s.alternate)
//       } else {
//         output.push('} else {')
//         gen(s.alternate)
//         output.push('}')
//       }
//     },
//     //looks ok
//     WhileStatement(s) {
//       output.push(`while (${gen(s.test)}) {`)
//       gen(s.body)
//       output.push('}')
//     },
//     //TODO: For statements require an iterator, a range, and a body.
//     //might possibly delete ForRange, as unneeded; still will keep for reference
//     ForRangeStatement(s) {
//       const i = targetName(s.iterator)
//       const op = s.op === '...' ? '<=' : '<'
//       output.push(
//         `for (let ${i} = ${gen(s.low)}; ${i} ${op} ${gen(s.high)}; ${i}++) {`
//       )
//       gen(s.body)
//       output.push('}')
//     },
//     ForStatement(s) {
//       output.push(`for (let ${gen(s.iterator)} of ${gen(s.collection)}) {`)
//       gen(s.body)
//       output.push('}')
//     },
//     //not sure about these, TODO
//     BinaryExpression(e) {
//       const op = { '==': '===', '!=': '!==' }[e.op] ?? e.op
//       return `(${gen(e.left)} ${op} ${gen(e.right)})`
//     },
//     UnaryExpression(e) {
//       return `${e.op}(${gen(e.operand)})`
//     },

//     SubscriptExpression(e) {
//       return `${gen(e.array)}[${gen(e.index)}]`
//     },
//     ArrayExpression(e) {
//       return `[${gen(e.elements).join(',')}]`
//     },
//     EmptyArray(e) {
//       return '[]'
//     },
//     //I don't know what this is, TODO
//     MemberExpression(e) {
//       return `(${gen(e.object)}[${JSON.stringify(gen(e.field))}])`
//     },

//     //Will need to go over this code, TODO
//     Call(c) {
//       const targetCode = standardFunctions.has(c.callee)
//         ? standardFunctions.get(c.callee)(gen(c.args))
//         : c.callee.constructor === StructType
//         ? `new ${gen(c.callee)}(${gen(c.args).join(', ')})`
//         : `${gen(c.callee)}(${gen(c.args).join(', ')})`
//       // Calls in expressions vs in statements are handled differently
//       if (c.callee instanceof Type || c.callee.type.returnType !== Type.VOID) {
//         return targetCode
//       }
//       output.push(`${targetCode};`)
//     },
//     Number(e) {
//       return e
//     },
//     BigInt(e) {
//       return e
//     },
//     Boolean(e) {
//       return e
//     },
//     String(e) {
//       // This ensures in JavaScript they get quotes!
//       return JSON.stringify(e)
//     },
//     Array(a) {
//       return a.map(gen)
//     },
//   }

//   gen(program)
//   return output.join('\n')
// }
