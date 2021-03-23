// from https://github.com/rtoal/ael-ohm/blob/master/src/compiler.js

//Compiler
//
// This module exports a single function
//   compile(sourceCodeString, outputType)
//
// The second argument tells the compiler what to return. It must be one of:
//   ast        the abstract syntax tree
//   analyzed   the semantically analyzed representation
//   optimized  the optimized semantically analyzed representation
//   js         the translation to JavaScript
//   c          the translation to C
//   llvm       the translation to LLVM

import parse from './parser.js'
// import analyze from "./analyzer.js"
// import optimize from "./optimizer.js"
// import generate from "./generator/index.js"

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

export default function compile(source, outputType) {
    outputType = outputType.toLowerCase()
    if (outputType === 'ast') {
        return parse(source)
        // } else if (outputType === "analyzed") {
        //   return analyze(parse(source))
        // } else if (outputType === "optimized") {
        //   return optimize(analyze(parse(source)))
        // } else if (["js", "c", "llvm"].includes(outputType)) {
        //   return generate(outputType)(optimize(analyze(parse(source))))
    } else {
        return 'Unknown Output Type'
    }
}
