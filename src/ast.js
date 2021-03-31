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
  constructor(type, targets) {
    Object.assign(this, { type, targets })
  }
}

export class Reassignment {
  constructor(targets, sources) {
    Object.assign(this, { targets, sources })
  }
}

export class ArrayType {
  constructor(baseType) {
    Object.assign(this, { baseType })
  }
}

export class Dictionary {
  constructor(type, targets, sources) {
    Object.assign(this, { type, targets, sources })
  }
}

export class DictContent {
  constructor(literal, expression) {
    Object.assign(this, { literal, expression })
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
  constructor(returnType, name, parameters, block) {
    Object.assign(this, { returnType, name, parameters, block })
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

export class Params {
  constructor(params) {
    this.params = params
  }
}

export class Param {
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

// export class Exp {
//   constructor(expression1, expression2) {
//     Object.assign(this, { expression1, expression2 })
//   }
// }

// export class Exp2 {
//   constructor(expression1, expression2) {
//     Object.assign(this, { expression1, expression2 })
//   }
// }

// export class Exp3 {
//   constructor(expression1, expression2) {
//     Object.assign(this, { expression1, expression2 })
//   }
// }

// export class Exp4 {
//   constructor(expression1, expression2) {
//     Object.assign(this, { expression1, expression2 })
//   }
// }

// export class Exp5 {
//   constructor(expression1, expression2) {
//     Object.assign(this, { expression1, expression2 })
//   }
// }

// export class Exp6 {
//   constructor(expression1, expression2) {
//     Object.assign(this, { expression1, expression2 })
//   }
// }

// export class Exp7 {
//   constructor(expression) {
//     this.expression = expression
//   }
// }

export class Exp8 {
  constructor(expression) {
    this.expression = expression
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

export class BreakStatement {
  // Intentionally empty
}

// FOR SEMANTIC ANALYSIS

// Complete Type objects are not created during the parsing; instead, we
// only know identifiers for the base types. During semantic analysis the
// type identifiers will be replaced with real type objects.
export class Type {
  constructor(name) {
    this.name = name
  }
  static BOOLEAN = new Type("boolean")
  static INT = new Type("int")
  static FLOAT = new Type("float")
  static STRING = new Type("string")
  static VOID = new Type("void")
  static TYPE = new Type("type")
  static ANY = new Type("any")
}

// export class ArrayType extends Type {
//   // Example: [int]
//   constructor(baseType) {
//     super(`[${baseType.name}]`)
//     this.baseType = baseType
//   }
// }

export class FunctionType extends Type {
  // Example: (boolean,[string]?)->float
  constructor(parameterTypes, returnType) {
    super(`(${parameterTypes.map(t => t.name).join(",")})->${returnType.name}`)
    Object.assign(this, { parameterTypes, returnType })
  }
}

// Created during semantic analysis only!
export class Variable {
  constructor(name) {
    this.name = name
  }
}

// Created during semantic analysis only!
export class Function {
  constructor(name) {
    this.name = name
    // Other properties set after construction
  }
}

// END OF SEMANTIC ANALYSIS PART

function prettied(node) {
  // Return a compact and pretty string representation of the node graph,
  // taking care of cycles. Written here from scratch because the built-in
  // inspect function, while nice, isn't nice enough.
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
