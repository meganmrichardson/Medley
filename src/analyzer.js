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
  Program(node) {
    p.statements = this.analyze(p.statements)
    return p
  }
  // Work on assignment node:
  // Assignments(d) {
  //   // Declarations generate brand new variable objects
  //   d.type = this.analyze(d.type)
  //   d.variable = new Variable(d.target, d.readOnly)
  //   d.variable.type = d.initializer.type
  //   this.add(d.variable.name, d.variable)
  //   return d
  // }
  // FunctionDeclaration(d) {
  // }
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
  BreakStatement(s) {
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
  // ADD IF STATEMENT
  WhileStatement(s) {
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
    e.left = this.analyze(e.left)
    e.right = this.analyze(e.right)
    if (["apple", "orange"].includes(e.op)) {
      check(e.left).isInteger()
      check(e.right).isInteger()
      e.type = Type.INT
    } else if (
      ["plus", "minus", "times", "divby", "mod", "to the power of"].includes(
        e.op
      )
    ) {
      check(e.left).isNumeric()
      check(e.left).hasSameTypeAs(e.right)
      e.type = e.left.type
    } else if (["less", "less equals", "more", "more equals"].includes(e.op)) {
      check(e.left).isNumericOrString()
      check(e.left).hasSameTypeAs(e.right)
      e.type = Type.BOOLEAN
    } else if (["equals", "not equals"].includes(e.op)) {
      check(e.left).hasSameTypeAs(e.right)
      e.type = Type.BOOLEAN
    }
    return e
  }
  UnaryExpression(e) {
    e.operand = this.analyze(e.operand)
    if (e.op === "not") {
      check(e.operand).isBoolean()
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
    // Id expressions get "replaced" with the entities they refer to.
    return this.lookup(e.name)
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
  Number.prototype.type = Type.FLOAT
  BigInt.prototype.type = Type.INT
  Boolean.prototype.type = Type.BOOLEAN
  String.prototype.type = Type.STRING
  Type.prototype.type = Type.TYPE
  const initialContext = new Context()

  // Add in all the predefined identifiers from the stdlib module
  const library = { ...stdlib.types, ...stdlib.constants, ...stdlib.functions }
  for (const [name, type] of Object.entries(library)) {
    initialContext.add(name, type)
  }
  return initialContext.analyze(node)
}
