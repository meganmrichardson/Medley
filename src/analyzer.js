import util from "util"
import { Variable, Type, FunctionType, Function, ArrayType } from "./ast.js"
import * as stdlib from "./stdlib.js"

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

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
    must(["intberry", "floatberry"].includes(self.type), `Expected a number`)
  },
  isNumericOrString() {
    must(
      ["stringberry", "intberry", "floatberry"].includes(self.type),
      `Expected a number or string`
    )
  },
  isBoolean() {
    must(self.type === "boolberry", `Expected a boolean`)
  },
  isInteger() {
    must(self.type === "intberry", `Expected an integer`)
  },
  isAType() {
    must(
      ["stringberry", "intberry", "floatberry", "boolberry"].includes(self) ||
        self.constructor === ArrayType ||
        self.constructor === DictType
    )
  },
  isAnArray() {
    must(self.type.constructor === ArrayType, "Array expected")
  },
  hasSameTypeAs(other) {
    // self is an exp, does it have the same type as other
    if (
      ["intberry", "floatberry", "stringberry", "boolberry"].includes(self.type)
    ) {
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
    // self is a type, can objects of self be assigned to vars of type
    must(
      type === Type.ANY ||
        (self === "intberry" && type === "intberry") ||
        (self === "floatberry" && type === "floatberry") ||
        (self === "stringberry" && type === "stringberry") ||
        (self === "boolberry" && type === "boolberry") ||
        self.type.isAssignableTo(type),
      `Cannot assign a ${self.type.name} to a ${type.name}`
    )
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
      self.constructor === StructType || self.type.constructor == FunctionType,
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
    console.log(
      `CHECKING ${util.inspect(self)} ASSIGNABLE TO ${util.inspect(
        f.type.returnType
      )}`
    )
    check(self.type).isAssignableTo(f.type.returnType)
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
  matchFieldsOf(structType) {
    check(self).match(structType.fields.map(f => f.type))
  },
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
  Program(p) {
    p.statements = this.analyze(p.statements)
    return p
  }
  // Work on assignment node:
  Assignment(d) {
    // Declarations generate brand new variable objects
    // d.source = this.analyze(d.source)
    // d.variable = new Variable(d.name)
    // d.variable.type = d.source.type
    // this.add(d.variable.name, d.variable)
    // return d

    d.type = this.analyze(d.type)
    d.variable = new Variable(d.name)
    d.variable.type = d.type
    this.add(d.variable.name, d.variable)
    return d
  }
  FuncDecl(d) {
    d.returnType = d.returnType ? this.analyze(d.returnType) : Type.VOID
    check(d.returnType).isAType()
    // Declarations generate brand new function objects
    const f = (d.function = new Function(d.name))
    // When entering a function body, we must reset the inLoop setting,
    // because it is possible to declare a function inside a loop!
    const childContext = this.newChild({ inLoop: false, forFunction: f })
    d.parameters = childContext.analyze(d.parameters)
    f.type = new FunctionType(
      d.parameters.map(p => p.type),
      d.returnType
    )
    // Add before analyzing the body to allow recursion
    this.add(f.name, f)
    d.block = childContext.analyze(d.block)
    return d
  }
  Parameter(p) {
    p.type1 = this.analyze(p.type1)
    check(p.type1).isAType()
    this.add(p.id1, p)
    p.type2 = this.analyze(p.type2)
    check(p.type2).isAType()
    this.add(p.id2, p)
    return p
  }
  ArrayType(t) {
    t.baseType = this.analyze(t.baseType)
    return t
  }
  FunctionType(t) {
    t.parameterTypes = this.analyze(t.parameterTypes)
    t.returnType = this.analyze(t.returnType)
    return t
  }
  Increment(s) {
    s.identifier = this.analyze(s.identifier)
    console.log(util.inspect(s.identifier))
    check(s.identifier).isInteger()
    return s
  }
  Reassignment(s) {
    s.source = this.analyze(s.source)
    s.targets = this.analyze(s.targets)
    check(s.source).isAssignableTo(s.targets.type)
    check(s.targets).isNotReadOnly()
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
  // Ask Dr. Toal
  FLoop(s) {
    s.initializer = new Variable(s.initializer, true)
    s.test = this.analyze(s.test)
    // ??
    s.initializer.type = s.initializer.type.baseType
    s.increment = this.analyze(s.increment)
    // ??
    s.initializer.type = s.initializer.type.baseType

    s.body = this.newChild({ inLoop: true }).analyze(s.body)
    return s
  }
  BinaryExpression(e) {
    e.expression1 = this.analyze(e.expression1)
    e.expression2 = this.analyze(e.expression2)
    if (["apple", "orange"].includes(e.op)) {
      check(e.expression1).isBoolean()
      check(e.expression2).isBoolean()
      e.type = "boolberry"
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
      e.type = "boolberry"
    } else if (["equals", "not equals"].includes(e.op)) {
      check(e.expression1).hasSameTypeAs(e.expression2)
      e.type = "boolberry"
    }
    return e
  }
  UnaryExpression(e) {
    e.expression = this.analyze(e.expression)
    if (e.op === "not") {
      check(e.expression).isBoolean()
      e.type = "boolberry"
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
    // Id expressions get "replaced" with the entities they refer to.
    return this.lookup(e.name)
  }
  Literal(e) {
    return e.value
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
