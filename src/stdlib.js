import { Type, Order, TomeType } from './ast.js'

function makeFunction(name, type) {
  return Object.assign(new Order(name), { type })
}

export const types = {}

export const functions = {
  print: makeFunction('execute', new Order([Type.ANY], Type.VOID)),
}
