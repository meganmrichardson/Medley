export class Program {
  constructor(statements) {
    this.statements = statements
  }
}

export class Statement {
  constructor(statements) {
    this.statements = statements
  }
}

export class Assignment {
  constructor(type, targets, sources) {
    Object.assign(this, { type, targets, sources })
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

export class Array {
    constructor(type, targets, sources) {
        Object.assign(this, { type, targets, sources })
    }
}

export class Dictionary {
    constructor(type, targets, sources) {
        Object.assign(this, { type, targets, sources })
    }
}

export class DictionaryContent {
    constructor(literal1, literal2) {
        Object.assign(this, { literal1, literal2 })
    }
}

export class Conditional {
    constructor(sources, blocks) {
        Object.assign(this, { sources, blocks })
    }
}


export class WLoop {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

export class FLoop {
  constructor(iterator, range, body) {
    Object.assign(this, { iterator, range, body })
  }
}

export class Block {
    constructor(statements) {
      this.statement = statements
    }
  }

export class Function {
    constructor(type, parameters, block) {
      Object.assign(this, { type, parameters, block })
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
    constructor(arguments) {
      this.arguments = arguments
    }
  }

  export class Parameter {
    constructor(names, types) {
      Object.assign(this, { names, types })
    }
  }

  export class LiteralList {
    constructor(literals) {
      this.literals = literals
    }
  }

  export class DictionaryList {
    constructor(content) {
      this.content = content
    }
  }


export class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
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








