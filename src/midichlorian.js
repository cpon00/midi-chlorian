#! /usr/bin/env node
//from https://github.com/rtoal/carlos-compiler/blob/11-strings/src/carlos.js
import fs from 'fs/promises'
import process from 'process'
import compile from './compiler.js'

const help = `Midi-chlorian compiler

Syntax: src/midichlorian <filename> <outputType>

Prints to stdout according to <outputType>, which must be one of:
  ast        the abstract syntax tree
  analyzed   the semantically analyzed representation
  optimized  the optimized semantically analyzed representation
  js         the translation to JavaScript
`

// From Carlos-Lang
Program.prototype[util.inspect.custom] = function () {
  //   Return a compact and pretty string representation of the node graph,
  //   taking care of cycles. Written here from scratch because the built-in
  //   inspect function, while nice, isn't nice enough. Defined properly in
  // the AST root class prototype so it automatically runs on console.log.
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
      if (typeof e === 'symbol') return e.description
      if (Array.isArray(e)) return `[${e.map(view)}]`
      return util.inspect(e)
    }
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let [type, props] = [node.constructor.name, '']
      Object.entries(node).forEach(([k, v]) => (props += ` ${k}=${view(v)}`))
      yield `${String(id).padStart(4, ' ')} | ${type}${props}`
    }
  }

  tag(this)
  return [...lines()].join('\n')
}

async function compileFromFile(filename, outputType) {
  try {
    const buffer = await fs.readFile(filename)
    console.log(compile(buffer.toString(), outputType))
  } catch (e) {
    console.trace(e)
    process.exitCode = 1
  }
}

if (process.argv.length !== 4) {
  console.log(help)
} else {
  compileFromFile(process.argv[2], process.argv[3])
}
