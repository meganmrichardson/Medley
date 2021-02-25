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
  constructor(targets, sources) {
    Object.assign(this, { targets, sources })
  }
}

export class Reassignment {
  constructor(targets, sources) {
    Object.assign(this, { targets, sources })
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

export class Call {
  constructor(callee, args) {
    Object.assign(this, { callee, args })
  }
}

export class ReturnStatement {
  constructor(returnValue) {
    this.returnValue = returnValue
  }
}
