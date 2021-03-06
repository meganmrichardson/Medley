import util from "util"

export class Program {
  constructor(statements) {
    this.statements = statements
  }
  [util.inspect.custom]() {
    return prettied(this)
  }
}

export class Assignment {
  constructor(type, name, source) {
    Object.assign(this, { type, name, source })
  }
}

export class Declaration {
  constructor(type, name) {
    Object.assign(this, { type, name })
  }
}

export class Reassignment {
  constructor(targets, source) {
    Object.assign(this, { targets, source })
  }
}

export class ArrayType {
  constructor(baseType) {
    Object.assign(this, { baseType })
  }
}

export class DictType {
  constructor(keyType, valueType) {
    Object.assign(this, { keyType, valueType })
  }
}

export class DictContent {
  constructor(literal1, literal2) {
    Object.assign(this, { literal1, literal2 })
  }
}

export class DictionaryList {
  constructor(content) {
    this.content = content
  }
}

export class Conditional {
  constructor(tests, consequents, alternates) {
    Object.assign(this, { tests, consequents, alternates })
  }
}

export class Break {
  constructor() {}
}

export class WLoop {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class FLoop {
  constructor(initializer, test, increment, body) {
    Object.assign(this, { initializer, test, increment, body })
  }
}

export class Block {
  constructor(statements) {
    this.statements = statements
  }
}

export class FuncDecl {
  constructor(func, block) {
    Object.assign(this, { func, block })
  }
}

export class Print {
  constructor(argument) {
    this.argument = argument
  }
}

export class Return {
  constructor(returnValue) {
    this.returnValue = returnValue
  }
}

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class Arguments {
  constructor(argumentList) {
    this.argumentList = argumentList
  }
}

export class Parameter {
  constructor(type, id) {
    Object.assign(this, { type, id })
  }
}

export class LiteralList {
  constructor(literals) {
    this.literals = literals
  }
}

export class IdentifierExpression {
  constructor(name) {
    this.name = name
  }
}

export class Increment {
  constructor(identifier) {
    this.identifier = identifier
  }
}

export class Literal {
  constructor(value) {
    this.value = value
  }
}

export class BinaryExpression {
  constructor(op, expression1, expression2) {
    Object.assign(this, { op, expression1, expression2 })
  }
}

export class UnaryExpression {
  constructor(op, expression) {
    Object.assign(this, { op, expression })
  }
}

export class BreakStatement {}

export class Type {
  constructor(name) {
    this.name = name
  }
  static BOOLEAN = new Type("boolberry")
  static INT = new Type("intberry")
  static FLOAT = new Type("floatberry")
  static STRING = new Type("stringberry")
  static VOID = new Type("void")
  static TYPE = new Type("type")
  static ANY = new Type("any")
}

export class FunctionType extends Type {
  constructor(parameterTypes, returnType) {
    super(`(${parameterTypes.map(t => t.name).join(",")})->${returnType.name}`)
    Object.assign(this, { parameterTypes, returnType })
  }
}

export class Variable {
  constructor(name) {
    this.name = name
  }
}

export class Function {
  constructor(name, parameters, returnType) {
    Object.assign(this, { name, parameters, returnType })
  }
}

function prettied(node) {
  const tags = new Map()

  function tag(node) {
    if (tags.has(node) || typeof node !== "object" || node === null) return
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
    for (let [node, id] of [...tags.entries()].sort((a, b) => a[1] - b[1])) {
      let [type, props] = [node.constructor.name, ""]
      Object.entries(node).forEach(([k, v]) => (props += ` ${k}=${view(v)}`))
      yield `${String(id).padStart(4, " ")} | ${type}${props}`
    }
  }

  tag(node)
  return [...lines()].join("\n")
}
