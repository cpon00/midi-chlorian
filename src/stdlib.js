import { Type, FunctionType, Variable, Order, TomeType } from "./ast.js";

function makeFunction(name, type) {
  return Object.assign(new Order(name), { type });
}

// const floatsType = new TomeType(Type.FLOAT)
// const floatFloatType = new FunctionType([Type.FLOAT], Type.FLOAT)
// const floatFloatFloatType = new FunctionType([Type.FLOAT, Type.FLOAT], Type.FLOAT)
// const stringToIntsType = new FunctionType([Type.STRING], floatsType)

export const types = {
  int: Type.INT,
  float: Type.FLOAT,
  boolean: Type.BOOLEAN,
  string: Type.STRING,
  void: Type.VOID,
};

export const functions = {
  print: makeFunction("execute", new FunctionType([Type.ANY], Type.VOID)),
};
