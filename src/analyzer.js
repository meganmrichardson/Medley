import { Variable, Type, FunctionType, Function, ArrayType } from "./ast.js"
import * as stdlib from "./stdlib.js"

function must(condition, errorMessage) {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

// Object.assign(ArrayType.prototype, {
//   isEquivalentTo(target) {
//     // [T] equivalent to [U] only when T is equivalent to U.
//     return (
//       target.constructor === ArrayType &&
//       this.baseType.isEquivalentTo(target.baseType)
//     )
//   },
//   isAssignableTo(target) {
//     return this.isEquivalentTo(target)
//   }
// })

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

  Conditional(s) {
    s.test = this.analyze(s.test)
    check(s.test).isBoolean()
    s.consequent = this.newChild().analyze(s.consequent)
    if (s.alternate.constructor === Array) {
      // It's a block of statements, make a new context
      s.alternate = this.newChild().analyze(s.alternate)
    } else if (s.alternate) {
      // It's a trailing if-statement, so same context
      s.alternate = this.analyze(s.alternate)
    }
    return s
  }
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
  // ADD ALL THE EXPRESSIONS
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
