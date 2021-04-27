import { type } from "os"
import util from "util"
import {
  Variable,
  Type,
  FunctionType,
  Function,
  ArrayType,
  DictType,
} from "./ast.js"
import * as stdlib from "./stdlib.js"

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}
Object.assign(Type.prototype, {
  // Equivalence: when are two types the same
  isEquivalentTo(target) {
    return this == target
  },
  // T1 assignable to T2 is when x:T1 can be assigned to y:T2. By default
  // this is only when two types are equivalent; however, for other kinds
  // of types there may be special rules. For example, in a language with
  // supertypes and subtypes, an object of a subtype would be assignable
  // to a variable constrained to a supertype.
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  },
})

Object.assign(ArrayType.prototype, {
  isEquivalentTo(target) {
    // [T] equivalent to [U] only when T is equivalent to U.
    return (
      target.constructor === ArrayType &&
      this.baseType.isEquivalentTo(target.baseType)
    )
  },
  isAssignableTo(target) {
    return this.isEquivalentTo(target)
  },
})

Object.assign(FunctionType.prototype, {
  isEquivalentTo(target) {
    return (
      target.constructor === FunctionType &&
      this.returnType.isEquivalentTo(target.returnType) &&
      this.parameterTypes.length === target.parameterTypes.length &&
      this.parameterTypes.every((t, i) =>
        target.parameterTypes[i].isEquivalentTo(t)
      )
    )
  },
  isAssignableTo(target) {
    // Functions are covariant on return types, contravariant on parameters.
    return (
      target.constructor === FunctionType &&
      this.returnType.isAssignableTo(target.returnType) &&
      this.parameterTypes.length === target.parameterTypes.length &&
      this.parameterTypes.every((t, i) =>
        target.parameterTypes[i].isAssignableTo(t)
      )
    )
  },
})

const check = self => ({
  isNumeric() {
    must([Type.INT, Type.FLOAT].includes(self.type), `Expected a number`)
  },
  isNumericOrString() {
    must(
      [Type.STRING, Type.INT, Type.FLOAT].includes(self.type),
      `Expected a number or string`
    )
  },
  isBoolean() {
    must(self.type === Type.BOOLEAN, `Expected a boolean`)
  },
  isInteger() {
    must(self.type === Type.INT, `Expected an integer`)
  },
  isAType() {
    must(
      [Type.STRING, Type.INT, Type.BOOLEAN, Type.FLOAT].includes(self) ||
        self.constructor === ArrayType ||
        self.constructor === DictType
    )
  },
  isAnArray() {
    must(self.type.constructor === ArrayType, "Array expected")
  },
  isADict() {
    must(self.type.constructor === DictType, "Dict expected")
  },
  hasSameTypeAs(other) {
    // self is an exp, does it have the same type as other
    if ([Type.FLOAT, Type.INT, Type.BOOLEAN, Type.STRING].includes(self.type)) {
      must(self.type === other.type, "Operands do not have the same type")
    } else {
      must(
        self.type.isEquivalentTo(other.type),
        "Operands do not have the same type"
      )
    }
  },
  allHaveSameType() {
    must(
      self.slice(1).every(e => e.type.isEquivalentTo(self[0].type)),
      "Not all elements have the same type"
    )
  },
  isAssignableTo(type) {
    must(
      type === Type.ANY || self.type.isAssignableTo(type),
      `Cannot assign a ${self.type.name} to a ${type.name}`
    )
    // self is a type, can objects of self be assigned to vars of type
    // must(
    //   type === Type.ANY ||
    //     (self === "intberry" && type === "intberry") ||
    //     (self === "floatberry" && type === "floatberry") ||
    //     (self === "stringberry" && type === "stringberry") ||
    //     (self === "boolberry" && type === "boolberry") ||
    //     self.type.isAssignableTo(type),
    //   `Cannot assign a ${self.type.name} to a ${type.name}`
    // )
  },
  isNotReadOnly() {
    must(!self.readOnly, `Cannot assign to constant ${self.name}`)
  },
  areAllDistinct() {
    must(
      new Set(self.map(f => f.name)).size === self.length,
      "Fields must be distinct"
    )
  },
  isInTheObject(object) {
    must(object.type.fields.map(f => f.name).includes(self), "No such field")
  },
  isInsideALoop() {
    must(self.inLoop, "Break can only appear in a loop")
  },
  isInsideAFunction(context) {
    must(self.function, "Return can only appear in a function")
  },
  isCallable() {
    must(
      self.func.type.constructor == FunctionType,
      "Call of non-function or non-constructor"
    )
  },
  returnsNothing() {
    must(
      self.type.returnType === Type.VOID,
      "Something should be returned here"
    )
  },
  returnsSomething() {
    must(self.type.returnType !== Type.VOID, "Cannot return a value here")
  },
  isReturnableFrom(f) {
    check(self).isAssignableTo(f.type.returnType)
  },
  match(targetTypes) {
    // self is the array of arguments
    must(
      targetTypes.length === self.length,
      `${targetTypes.length} argument(s) required but ${self.length} passed`
    )
    targetTypes.forEach((type, i) => check(self[i]).isAssignableTo(type))
  },
  matchParametersOf(calleeType) {
    check(self).match(calleeType.parameterTypes)
  },
  // matchFieldsOf(structType) {
  //   check(self).match(structType.fields.map(f => f.type))
  // }
})

class Context {
  constructor(parent = null, configuration = {}) {
    this.parent = parent
    this.locals = new Map()
    this.inLoop = configuration.inLoop ?? parent?.inLoop ?? false
    this.function = configuration.forFunction ?? parent?.function ?? null
  }
  sees(name) {
    return this.locals.has(name) || this.parent?.sees(name)
  }
  add(name, entity) {
    if (this.sees(name)) {
      throw new Error(`Identifier ${name} already declared`)
    }
    this.locals.set(name, entity)
  }
  lookup(name) {
    const entity = this.locals.get(name)
    if (entity) {
      return entity
    } else if (this.parent) {
      return this.parent.lookup(name)
    }
    throw new Error(`Identifier ${name} not declared`)
  }
  newChild(configuration = {}) {
    return new Context(this, configuration)
  }
  analyze(node) {
    return this[node.constructor.name](node)
  }
  analyzeType(type) {
    if (typeof type === "string") {
      if (type === "boolberry") return Type.BOOLEAN
      if (type === "intberry") return Type.INT
      if (type === "stringberry") return Type.STRING
      if (type === "floatberry") return Type.FLOAT
      throw new Error("ROTTEN TYPE")
    } else if (type.constructor === ArrayType) {
      type.baseType = this.analyzeType(type.baseType)
      return type
    } else {
      type.keyType = this.analyzeType(type.keyType)
      type.valueType = this.analyzeType(type.valueType)
      return type
    }
  }
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  // Work on assignment node:
  Assignment(d) {
    d.type = this.analyzeType(d.type)
    d.variable = new Variable(d.name)
    // line below!!
    d.source = this.analyze(d.source)
    d.variable.type = d.type
    this.add(d.variable.name, d.variable)
    return d
  }
  Declaration(d) {
    d.name = this.analyze(d.name)
    d.variable = new Variable(d.name)
    d.type = this.analyzeType(d.type)
    d.variable.type = d.type
    this.add(d.variable.name, d.variable)
    return d
  }
  FuncDecl(d) {
    d.func.returnType = this.analyzeType(d.func.returnType)
    check(d.func.returnType).isAType()
    const childContext = this.newChild({ inLoop: false, forFunction: d.func })
    d.func.parameters = childContext.analyze(d.func.parameters)

    d.func.type = new FunctionType(
      d.func.parameters.map(p => p.type),
      d.func.returnType
    )
    this.add(d.func.name, d)
    d.block = childContext.analyze(d.block)
    return d
  }

  Parameter(p) {
    p.type = this.analyzeType(p.type)
    check(p.type).isAType()
    this.add(p.name, p)
    return p
  }

  ArrayType(t) {
    t.baseType = this.analyze(t.baseType)
    return t
  }
  DictType(t) {
    t.keyType = this.analyze(t.keyType)
    t.valueType = this.analyze(t.valueType)
    return t
  }
  DictContent(t) {
    t.literal1 = this.analyze(t.literal1)
    t.literal2 = this.analyze(t.literal2)
    check
    return t
  }
  // FunctionType not used
  FunctionType(t) {
    t.parameterTypes = this.analyze(t.parameterTypes)
    t.returnType = this.analyze(t.returnType)
    return t
  }
  Increment(s) {
    s.identifier = this.analyze(s.identifier)
    check(s.identifier).isInteger()
    return s
  }
  // LiteralList not used
  LiteralList(l) {}
  Reassignment(s) {
    s.targets = this.lookup(s.targets.name)
    s.source = this.analyze(s.source)
    check(s.source).isAssignableTo(s.targets.type)
    check(s.targets).isNotReadOnly()
    // add(s.targets.name, s.sources)
    return s
  }
  Block(b) {
    b.statements = this.analyze(b.statements)
    return b
  }
  Break(s) {
    check(this).isInsideALoop()
    return s
  }
  Return(s) {
    check(this).isInsideAFunction()
    check(this.function).returnsSomething()
    s.returnValue = this.analyze(s.returnValue)
    check(s.returnValue).isReturnableFrom(this.function)
    return s
  }
  Print(s) {
    s.argument = this.analyze(s.argument)
    return s
  }
  Conditional(s) {
    s.tests = this.analyze(s.tests)
    s.tests.forEach(s => check(s).isBoolean())
    s.consequents = s.consequents.map(b => this.newChild().analyze(b))
    s.alternates = s.alternates.map(b => this.newChild().analyze(b))
    return s
  }
  WLoop(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  FLoop(s) {
    console.log("analyzer initializer for for loop:", s.initializer)
    s.low = s.initializer.source.value
    s.high = s.test.expression2["value"]
    s.initializer = new Variable(s.initializer.name, true)
    s.initializer.type = Type.INT
    this.add(s.initializer.name, s.initializer)

    s.test = this.analyze(s.test)

    s.increment = this.analyze(s.increment)

    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  BinaryExpression(e) {
    e.expression1 = this.analyze(e.expression1)
    e.expression2 = this.analyze(e.expression2)
    if (["apple", "orange"].includes(e.op)) {
      check(e.expression1).isBoolean()
      check(e.expression2).isBoolean()
      e.type = Type.BOOLEAN
    } else if (
      ["plus", "minus", "times", "divby", "mod", "to the power of"].includes(
        e.op
      )
    ) {
      check(e.expression1).isNumeric()
      check(e.expression1).hasSameTypeAs(e.expression2)
      e.type = e.expression1.type
    } else if (["less", "less equals", "more", "more equals"].includes(e.op)) {
      check(e.expression1).isNumeric()
      check(e.expression1).hasSameTypeAs(e.expression2)
      e.type = Type.BOOLEAN
    } else if (["equals", "not equals"].includes(e.op)) {
      check(e.expression1).hasSameTypeAs(e.expression2)
      e.type = Type.BOOLEAN
    }
    return e
  }
  UnaryExpression(e) {
    e.expression = this.analyze(e.expression)
    if (e.op === "not") {
      check(e.expression).isBoolean()
      e.type = Type.BOOLEAN
    }
    return e
  }
  // Ask Dr. Toal how to add the remaining expression types
  Call(c) {
    c.callee = this.analyze(c.callee)
    check(c.callee).isCallable()
    c.args = this.analyze(c.args)
    check(c.args).matchParametersOf(c.callee.type)
    c.type = c.callee.type.returnType
    return c
  }
  IdentifierExpression(e) {
    const variable = this.lookup(e.name)
    return variable
  }
  Literal(e) {
    if (Number.isInteger(e.value)) {
      e.type = Type.INT
    } else if (typeof e.value === "number") {
      e.type = Type.FLOAT
    } else if (typeof e.value === "string") {
      e.type = Type.STRING
    } else if (typeof e.value === "boolean") {
      e.type = Type.BOOLEAN
    }
    return e
  }
  Number(e) {
    return e
  }
  BigInt(e) {
    return e
  }
  Boolean(e) {
    return e
  }
  String(e) {
    return e
  }
  Array(a) {
    return a.map(item => this.analyze(item))
  }
}

export default function analyze(node) {
  // Allow primitives to be automatically typed
  Number.prototype.type = "floatberry"
  BigInt.prototype.type = "intberry"
  Boolean.prototype.type = "boolberry"
  String.prototype.type = "stringberry"
  Type.prototype.type = "typeberry"
  const initialContext = new Context()

  // Add in all the predefined identifiers from the stdlib module
  const library = { ...stdlib.types, ...stdlib.constants, ...stdlib.functions }
  for (const [name, type] of Object.entries(library)) {
    initialContext.add(name, type)
  }
  return initialContext.analyze(node)
}
