import { Type, OrderType, Variable, Order } from "./ast.js"

function makeConstant(name, type, value) {
  return Object.assign(new Variable(name, true), { type, value })
}

function makeOrder(name, type) {
  return Object.assign(new Order(name), { type })
}

const numNumType = new OrderType([Type.NUMBER], Type.NUMBER)
const numNumNumType = new OrderType([Type.NUMBER, Type.NUMBER], Type.NUMBER)

export const types = {
  number: Type.NUMBER,
  boolean: Type.BOOLEAN,
  void: Type.VOID,
}

export const constants = {
  π: makeConstant("π", Type.NUMBER, Math.PI),
}

export const functions = {
  sin: makeOrder("sin", numNumType),
  cos: makeOrder("cos", numNumType),
  exp: makeOrder("exp", numNumType),
  ln: makeOrder("ln", numNumType),
  hypot: makeOrder("hypot", numNumNumType),
}