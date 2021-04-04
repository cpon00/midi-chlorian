//Imported from https://github.com/rtoal/carlos-lang/blob/main/src/analyzer.js

// Semantic Analyzer
//
// Analyzes the AST by looking for semantic errors and resolving references.

import { Variable, Type, FunctionType, Order, TomeType } from "./ast.js";
import * as stdlib from "./stdlib.js";

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage);
  }
}

//TYPE EQUIVALENCE
Object.assign(Type.prototype, {
  // Equivalence: when are two types the same
  isEquivalentTo(target) {
    return this == target;
  },
  // T1 assignable to T2 is when x:T1 can be assigned to y:T2. By default
  // this is only when two types are equivalent; however, for other kinds
  // of types there may be special rules. For example, in a language with
  // supertypes and subtypes, an object of a subtype would be assignable
  // to a variable constrained to a supertype.
  isAssignableTo(target) {
    return this.isEquivalentTo(target);
  },
});

//ARRAY TYPE EQUIVALENCE
Object.assign(TomeType.prototype, {
  isEquivalentTo(target) {
    // [T] equivalent to [U] only when T is equivalent to U.
    return (
      target.constructor === TomeType &&
      this.baseType.isEquivalentTo(target.baseType)
    );
  },
  isAssignableTo(target) {
    // Arrays are INVARIANT in Carlos!
    return this.isEquivalentTo(target);
  },
});

//FUNCTION TYPE EQUIVALENCE
Object.assign(FunctionType.prototype, {
  isEquivalentTo(target) {
    return (
      target.constructor === FunctionType &&
      this.returnType.isEquivalentTo(target.returnType) &&
      this.paramTypes.length === target.paramTypes.length &&
      this.paramTypes.every((t, i) => target.paramTypes[i].isEquivalentTo(t))
    );
  },
  isAssignableTo(target) {
    // Functions are covariant on return types, contravariant on parameters.
    return (
      target.constructor === FunctionType &&
      this.returnType.isAssignableTo(target.returnType) &&
      this.paramTypes.length === target.paramTypes.length &&
      this.paramTypes.every((t, i) => target.paramTypes[i].isAssignableTo(t))
    );
  },
});

// Object.assign(OptionalType.prototype, {
//   isEquivalentTo(target) {
//     // T? equivalent to U? only when T is equivalent to U.
//     return (
//       target.constructor === OptionalType &&
//       this.baseType.isEquivalentTo(target.baseType)
//     );
//   },
//   isAssignableTo(target) {
//     // Optionals are INVARIANT in Carlos!
//     return this.isEquivalentTo(target);
//   },
// });

const check = (self) => ({
  isNumeric() {
    must(
      [Type.CRED, Type.KET].includes(self.type),
      `Expected a number, found ${self.type.description}`
    );
  },
  isNumericOrString() {
    must(
      [Type.CRED, Type.KET, Type.TRANSMISSION.name].includes(self.type),
      `Expected a number or string, found ${self.type.description}`
    );
  },
  isBoolean() {
    must(
      self.type === Type.ABSOLUTE,
      `Expected a boolean, found ${self.type.description}`
    );
  },
  isInteger() {
    must(
      self.type === Type.CRED,
      `Expected an integer, found ${self.type.description}`
    );
  },
  isAType() {
    must(
      ["transmission", "cred", "ket", "absolute"].includes(self) ||
        self.constructor === TomeType ||
        self.constructor === HolocronObj
    );
  },
  // isAnOptional() {
  //   must(self.type.constructor === OptionalType, "Optional expected");
  // },
  isAnArray() {
    must(self.type.constructor === TomeType, "Array expected");
  },
  isADict() {
    must(self.type.constructor === DictType, "Dict expected");
  },
  hasSameTypeAs(other) {
    if (["cred", "ket", "transmission", "absolute"].includes(self.type)) {
      must(self.type === other.type, "Operands do not have the same type");
    } else {
      must(
        self.type.isEquivalentTo(other.type),
        "Operands do not have the same type"
      );
    }
  },
  allHaveSameType() {
    must(
      self.slice(1).every((e) => e.type.isEquivalentTo(self[0].type)),
      "Not all elements have the same type"
    );
  },
  // isNotRecursive() {
  //   must(
  //     !self.fields.map((f) => f.type).includes(self),
  //     "Struct type must not be recursive"
  //   );
  // },
  isAssignableTo(type) {
    // self is a type, can objects of self be assigned to vars of type
    must(
      type === Type.ANY ||
        (self === "cred" && type === "cred") ||
        (self === "ket" && type === "ket") ||
        (self === "transmission" && type === "transmission") ||
        (self === "absolute" && type === "absolute") ||
        self.type.isAssignableTo(type),
      `Cannot assign a ${self.type.name} to a ${type.name}`
    );
  },
  isNotReadOnly() {
    must(!self.readOnly, `Cannot assign to constant ${self.name}`);
  },
  areAllDistinct() {
    must(
      new Set(self.map((f) => f.name)).size === self.length,
      "Fields must be distinct"
    );
  },
  isInTheObject(object) {
    must(object.type.fields.map((f) => f.name).includes(self), "No such field");
  },
  isInsideALoop() {
    must(self.inLoop, "Break can only appear in a loop");
  },
  isInsideAFunction(context) {
    must(self.function, "Return can only appear in a function");
  },
  isCallable() {
    must(
      self.type.constructor == FunctionType,
      "Call of non-function or non-constructor"
    );
  },
  returnsNothing() {
    must(
      self.type.returnType === Type.VOID,
      "Something should be returned here"
    );
  },
  returnsSomething() {
    must(self.type.returnType !== Type.VOID, "Cannot return a value here");
  },
  isReturnableFrom(f) {
    check(self).isAssignableTo(f.type.returnType);
  },
  match(targetTypes) {
    // self is the array of arguments
    must(
      targetTypes.length === self.length,
      `${targetTypes.length} argument(s) required but ${self.length} passed`
    );
    targetTypes.forEach((type, i) => check(self[i]).isAssignableTo(type));
  },
  matchParametersOf(calleeType) {
    check(self).match(calleeType.paramTypes);
  },
  matchFieldsOf(type) {
    check(self).match(type.fields.map((f) => f.type));
  },
});

class Context {
  constructor(parent = null, configuration = {}) {
    // Parent (enclosing scope) for static scope analysis
    this.parent = parent;
    // All local declarations. Names map to variable declarations, types, and
    // function declarations
    this.locals = new Map();
    // Whether we are in a loop, so that we know whether breaks and continues
    // are legal here
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false;
    // Whether we are in a function, so that we know whether a return
    // statement can appear here, and if so, how we typecheck it
    this.function = configuration.forFunction ?? parent?.function ?? null;
  }
  sees(name) {
    // Search "outward" through enclosing scopes
    return this.locals.has(name) || this.parent?.sees(name);
  }
  add(name, entity) {
    // No shadowing! Prevent addition if id anywhere in scope chain!
    if (this.sees(name)) {
      throw new Error(`Identifier ${name} already declared`);
    }
    this.locals.set(name, entity);
  }
  lookup(name) {
    const entity = this.locals.get(name);
    if (entity) {
      return entity;
    } else if (this.parent) {
      return this.parent.lookup(name);
    }
    throw new Error(`Identifier ${name} not declared`);
  }
  newChild(configuration = {}) {
    // Create new (nested) context, which is just like the current context
    // except that certain fields can be overridden
    return new Context(this, configuration);
  }
  analyze(node) {
    return this[node.constructor](node);
  }
  Program(p) {
    p.statements = this.analyze(p.statements);
    return p;
  }

  Command(d) {
    // Declarations generate brand new variable objects
    // d.source = this.analyze(d.source)
    // d.variable = new Variable(d.name)
    // d.variable.type = d.source.type
    // this.add(d.variable.name, d.variable)
    // return d

    d.type = this.analyze(d.type);
    d.variable = new Variable(d.name);
    d.variable.type = d.type;
    this.add(d.variable.name, d.variable);
    return d;
  }
  FuncDecl(d) {
    d.returnType = d.returnType ? this.analyze(d.returnType) : Type.VOID;
    check(d.returnType).isAType();
    // Declarations generate brand new function objects
    const f = (d.function = new Function(d.name));
    // When entering a function body, we must reset the inLoop setting,
    // because it is possible to declare a function inside a loop!
    const childContext = this.newChild({ inLoop: false, forFunction: f });
    d.parameters = childContext.analyze(d.parameters);
    f.type = new FunctionType(
      d.parameters.map((p) => p.type),
      d.returnType
    );
    // Add before analyzing the body to allow recursion
    this.add(f.name, f);
    d.block = childContext.analyze(d.block);
    return d;
  }
  Param(p) {
    p.type1 = this.analyze(p.type1);
    check(p.type1).isAType();
    this.add(p.id1, p);
    p.type2 = this.analyze(p.type2);
    check(p.type2).isAType();
    this.add(p.id2, p);
    return p;
  }
  ArrayType(t) {
    t.baseType = this.analyze(t.baseType);
    return t;
  }
  DictType(t) {
    t.keyType = this.analyze(t.keyType);
    t.valueType = this.analyze(t.valueType);
    return t;
  }
  DictContent(t) {
    t.literal1 = this.analyze(t.literal1);
    t.literal2 = this.analyze(t.literal2);
    check;
    return t;
  }
  FunctionType(t) {
    t.parameterTypes = this.analyze(t.parameterTypes);
    t.returnType = this.analyze(t.returnType);
    return t;
  }
  Increment(s) {
    s.identifier = this.analyze(s.identifier);
    console.log(util.inspect(s.identifier));
    check(s.identifier).isInteger();
    return s;
  }
  Reassignment(s) {
    s.source = this.analyze(s.source);
    s.targets = this.analyze(s.targets);
    check(s.source).isAssignableTo(s.targets.type);
    check(s.targets).isNotReadOnly();
    return s;
  }
  Body(b) {
    b.statements = this.analyze(b.statements);
    return b;
  }
  Break(s) {
    check(this).isInsideALoop();
    return s;
  }
  Return(s) {
    check(this).isInsideAFunction();
    check(this.function).returnsSomething();
    s.returnValue = this.analyze(s.returnValue);
    check(s.returnValue).isReturnableFrom(this.function);
    return s;
  }
  Print(s) {
    s.argument = this.analyze(s.argument);
    return s;
  }
  IfStatement(s) {
    s.tests = this.analyze(s.tests);
    s.tests.forEach((s) => check(s).isBoolean());
    s.consequents = s.consequents.map((b) => this.newChild().analyze(b));
    s.alternates = s.alternates.map((b) => this.newChild().analyze(b));
    return s;
  }
  WhileLoop(s) {
    s.test = this.analyze(s.test);
    check(s.test).isBoolean();
    s.body = this.newChild({ inLoop: true }).analyze(s.body);
    return s;
  }
  ForL(s) {
    s.initializer = new Variable(s.initializer, true);
    s.test = this.analyze(s.test);

    s.initializer.type = s.initializer.type.baseType;
    s.increment = this.analyze(s.increment);

    s.initializer.type = s.initializer.type.baseType;

    s.body = this.newChild({ inLoop: true }).analyze(s.body);
    return s;
  }
  BinaryExpression(e) {
    e.expression1 = this.analyze(e.expression1);
    e.expression2 = this.analyze(e.expression2);
    if (["apple", "orange"].includes(e.op)) {
      check(e.expression1).isBoolean();
      check(e.expression2).isBoolean();
      e.type = "absolute";
    } else if (
      ["plus", "minus", "times", "divby", "mod", "to the power of"].includes(
        e.op
      )
    ) {
      check(e.expression1).isNumeric();
      check(e.expression1).hasSameTypeAs(e.expression2);
      e.type = e.expression1.type;
    } else if (["less", "less equals", "more", "more equals"].includes(e.op)) {
      check(e.expression1).isNumeric();
      check(e.expression1).hasSameTypeAs(e.expression2);
      e.type = "absolute";
    } else if (["equals", "not equals"].includes(e.op)) {
      check(e.expression1).hasSameTypeAs(e.expression2);
      e.type = "absolute";
    }
    return e;
  }
  UnaryExpression(e) {
    e.expression = this.analyze(e.expression);
    if (e.op === "not") {
      check(e.expression).isBoolean();
      e.type = "absolute";
    }
    return e;
  }
  Call(c) {
    c.callee = this.analyze(c.callee);
    check(c.callee).isCallable();
    c.args = this.analyze(c.args);
    check(c.args).matchParametersOf(c.callee.type);
    c.type = c.callee.type.returnType;
    return c;
  }
  IdentifierExpression(e) {
    // Id expressions get "replaced" with the entities they refer to.
    return this.lookup(e.name);
  }
  Literal(e) {
    return e.value;
  }
  Number(e) {
    return e;
  }
  BigInt(e) {
    return e;
  }
  Boolean(e) {
    return e;
  }
  String(e) {
    return e;
  }
  Array(a) {
    return a.map((item) => this.analyze(item));
  }
}

export default function analyze(node) {
  // Allow primitives to be automatically typed
  Number.prototype.type = Type.KET;
  BigInt.prototype.type = Type.CRED;
  Boolean.prototype.type = Type.ABSOLUTE;
  String.prototype.type = Type.TRANSMISSION;
  Type.prototype.type = Type.TYPE;
  const initialContext = new Context();

  // Add in all the predefined identifiers from the stdlib module
  const library = { ...stdlib.types, ...stdlib.constants, ...stdlib.functions };
  for (const [name, type] of Object.entries(library)) {
    initialContext.add(name, type);
  }
  return initialContext.analyze(node);
}
