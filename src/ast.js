// from https://github.com/rtoal/ael-ohm/blob/master/src/ast.js
// also from https://github.com/rtoal/carlos-compiler/blob/11-strings/src/ast.js

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

import util from "util";

//Program
export class Program {
  constructor(statements) {
    this.statements = statements;
  }
}

//Variable Declaration
export class Command {
  constructor(variable, initializers) {
    Object.assign(this, { variable, initializers });
  }
}

//TODO: Variables

//TODO: Designation? Reassignment?

//Type of primitive lifeform: transmission, ket, cred, absolute, superclass of other types

export class Type {
  constructor(description) {
    Object.assign(this, { description });
  }
}

//Field
export class Body {
  constructor(name, type) {
    Object.assign(this, { name, type });
  }
}

//Function Declaration
export class OrderDeclaration {
  constructor(fun, body) {
    Object.assign(this, { fun, body });
  }
}

//Function
export class Order {
  constructor(name, parameters, returnType) {
    Object.assign(this, { name, parameters, returnType });
  }
}

//Parameter
export class Parameter {
  constructor(name, type) {
    Object.assign(this, { name, type });
  }
}

//Array Type
export class TomeType extends Type {
  constructor(baseType) {
    super(`[${baseType.description}]`);
    this.baseType = baseType;
  }
}

//TODO: Holocron Type

//Increment

export class Increment {
  constructor(variable) {
    this.variable = variable;
  }
}
//TODO: Maybe add Decrement

//Assignment
export class Designation {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
}

//Return
export class Execute {
  constructor(returnValue) {
    this.returnValue = returnValue;
  }
}

//Break
export class Unleash {
  //intentionally empty
}

//If Statement
export class IfStatement {
  // Example: if x < 3 { print(100); } else { break; }
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }
}

//While Statement
export class WhileStatement {
  // Example: while level != 90 { level += random(-3, 8); }
  constructor(test, body) {
    Object.assign(this, { test, body });
  }
}

//For Statement
export class ForStatement {
  constructor(iterator, range, body) {
    Object.assign(this, { iterator, range, body });
  }
}

//Binary Expression
export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
  }
}

//Unary Expression
export class UnaryExpression {
  // Example: -55
  constructor(op, operand) {
    Object.assign(this, { op, operand });
  }
}

//Subscript Expression
export class SubscriptExpression {
  // Example: a[20]
  constructor(array, index) {
    Object.assign(this, { array, index });
  }
}

//Array Expression
export class ArrayExpression {
  // Example: ["Emma", "Norman", "Ray"]
  constructor(elements) {
    this.elements = elements;
  }
}

//Dictionary Expression
export class DictExpression {
  constructor(elements) {
    this.elements = elements;
  }
}

//Dictionary Content
export class DictContent {
  constructor(literal, expression) {
    Object.assign(this, { literal, expression });
  }
}

//Call
export class Call {
  // Example: move(player, 90, "west")
  constructor(callee, args) {
    Object.assign(this, { callee, args });
  }
}

//id
export class id {
  constructor(expression) {
    this.expression = expression;
  }
}

// export class Type {
//   constructor(name) {
//     this.name = name;
//   }
//   static ABSOLUTE = new Type("absolute");
//   static CRED = new Type("cred");
//   static TRANSMISSION = new Type("transmission");
//   static KET = new Type("ket");
//   static MIDICHLORIAN = new Type("midichlorian");
//   static TYPE = new Type("type");
// }

// export class TypeName {
//   constructor(name) {
//     this.name = name;
//   }
// }

// export class OrderType {
//   constructor(parameterTypes, returnType) {
//     Object.assign(this, { parameterTypes, returnType });
//   }
//   get name() {
//     return `(${this.parameterTypes.map((t) => t.name).join(",")})->${
//       this.returnType.name
//     }`;
//   }
// }

// export class TomeType {
//   constructor(baseType) {
//     this.baseType = baseType;
//   }
//   get name() {
//     return `[${this.baseType.name}]`;
//   }
// }

// // export class VariableDeclaration {
// //   constructor(type, name, initializer) {
// //     Object.assign(this, { type, name, initializer });
// //   }
// // }

// export class Variable {
//   constructor(name) {
//     Object.assign(this, { name, readOnly });
//   }
// }

// export class Program {
//   constructor(statements) {
//     this.statements = statements;
//   }
// }

// export class Command {
//   constructor(variables, initializers) {
//     Object.assign(this, { variables, initializers });
//   }
// }

// export class Order {
//   constructor(id, parameters, body) {
//     Object.assign(this, { id, parameters, body });
//   }
// }

// export class Designation {
//   constructor(targets, sources) {
//     Object.assign(this, { targets, sources });
//   }
// }

// export class WhileLoop {
//   constructor(test, body) {
//     Object.assign(this, { test, body });
//   }
// }

// export class Param {
//   constructor(name, type) {
//     Object.assign(this, { name, type });
//   }
// }

// export class ForLoop {
//   constructor(iterator, range, body) {
//     Object.assign(this, { iterator, range, body });
//   }
// }

// export class Emit {
//   constructor(argument) {
//     this.argument = argument;
//   }
// }
// export class HolocronContent {
//   constructor(literal, expression) {
//     Object.assign(this, { literal, expression });
//   }
// }

// export class HolocronObj {
//   constructor(content) {
//     this.content = content;
//   }
// }

// export class Execute {
//   constructor(returnValue) {
//     this.returnValue = returnValue;
//   }
// }

// export class Unleash {
//   //intentionally empty
// }

// export class IfStatement {
//   constructor(condition, execution) {
//     Object.assign(this, { condition, execution });
//   }
// }

// export class BinaryExpression {
//   constructor(op, left, right) {
//     Object.assign(this, { op, left, right });
//   }
// }

// export class UnaryExpression {
//   constructor(op, operand) {
//     Object.assign(this, { op, operand });
//   }
// }

// export class SubscriptExpression {
//   constructor(array, index) {
//     Object.assign(this, { array, index });
//   }
// }

// export class ArrayExp {
//   constructor(elements) {
//     this.elements = elements;
//   }
// }

// export class Increment {
//   constructor(id, operation) {
//     Object.assign(this, { id, operation });
//   }
// }
// export class id {
//   constructor(expression) {
//     this.expression = expression;
//   }
// }

export class Arg {
  constructor(expression) {
    this.expression = expression;
  }
}
export class Args {
  constructor(argumentList) {
    this.argumentList = argumentList;
  }
}
// export class Call {
//   constructor(callee, args) {
//     console.log("test");
//     Object.assign(this, { callee, args });
//   }
// }

export class Literal {
  constructor(type) {
    this.type = type;
  }
}
// export class LitList {
//   constructor(type) {
//     this.type = type;
//   }
// }
