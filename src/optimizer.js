import * as ast from "./ast.js"
import util from "util"

export default function optimize(node) {
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  Block(b) {
    b.statements = optimize(b.statements)
    return b
  },
  Assignment(d) {
    d.source = optimize(d.source)
    return d
  },
  Declaration(d) {
    return d
  },
  FuncDecl(d) {
    d.block = optimize(d.block)
    var stop = false
    d.block.statements.forEach(function (statement) {
      if (!stop) {
        if (statement.returnValue != null) {
          stop = true
        }
      } else {
        d.block.statements.pop()
      }
    })
    return d
  },
  Variable(v) {
    return v
  },
  Function(f) {
    return f
  },
  Parameter(p) {
    return p
  },
  Increment(s) {
    return s
  },
  Reassignment(s) {
    s.source = optimize(s.source)
    s.targets = optimize(s.targets)
    if (s.source === s.targets) {
      return []
    }
    return s
  },
  Break(s) {
    return s
  },
  Return(s) {
    s.returnValue = optimize(s.returnValue)
    return s
  },
  Conditional(s) {
    s.tests = optimize(s.tests)
    if (s.tests.constructor === Boolean) {
      return s.tests ? s.consequents : s.alternates
    }
    return s
  },
  WLoop(s) {
    s.test = optimize(s.test)
    if (s.test === false) {
      return []
    }
    s.body = optimize(s.body)
    return s
  },
  FLoop(s) {
    s.initializer = optimize(s.initializer)
    s.test = optimize(s.test)
    s.body = optimize(s.body)
    if (!s.test) {
      return []
    }
    return s
  },
  BinaryExpression(e) {
    e.expression1 = optimize(e.expression1)
    e.expression2 = optimize(e.expression2)
    if (e.op === "apple") {
      if (e.expression1 === true) return e.expression2
      else if (e.expression2 === true) return e.expression1
      else if (e.expression1 === false) return false
      else if (e.expression2 === false) return false
    } else if (e.op === "orange") {
      if (e.expression1 === false) return e.expression2
      else if (e.expression2 === false) return e.expression1
      else if (e.expression1 === true) return true
      else if (e.expression2 === true) return true
    } else if (e.expression1 === 0 && e.op === "plus") return e.expression2
    else if (e.expression1 === 1 && e.op === "times") return e.expression2
    else if (e.expression1 === 0 && e.op === "minus")
      return new ast.UnaryExpression("minus", e.expression2)
    else if (e.expression1 === 1 && e.op === "to the power of") return 1
    else if (e.expression1 === 0 && ["times", "divby"].includes(e.op)) return 0
    else if (e.expression1 < e.expression2 && e.op === "mod")
      return e.expression1
    if ([Number, BigInt].includes(e.expression1.constructor)) {
      if ([Number, BigInt].includes(e.expression2.constructor)) {
        if (e.op === "plus") {
          return e.expression1 + e.expression2
        } else if (e.op === "minus") return e.expression1 - e.expression2
        else if (e.op === "times") return e.expression1 * e.expression2
        else if (e.op === "divby") return e.expression1 / e.expression2
        else if (e.op === "mod") return e.expression1 % e.expression2
        else if (e.op === "to the power of")
          return e.expression1 ** e.expression2
        else if (e.op === "less") return e.expression1 < e.expression2
        else if (e.op === "less equals") return e.expression1 <= e.expression2
        else if (e.op === "equals") return e.expression1 === e.expression2
        else if (e.op === "not equals") return e.expression1 !== e.expression2
        else if (e.op === "more equals") return e.expression1 >= e.expression2
        else if (e.op === "more") return e.expression1 > e.expression2
      }
    } else if (e.expression2.constructor === Number) {
      if (["plus", "minus"].includes(e.op) && e.expression2 === 0)
        return e.expression1
      else if (["times", "divby"].includes(e.op) && e.expression2 === 1)
        return e.expression1
      else if (e.op === "times" && e.expression2 === 0) return 0
      else if (e.op === "to the power of" && e.expression2 === 0) return 1
    }
    return e
  },
  UnaryExpression(e) {
    e.expression = optimize(e.expression)
    if (e.expression.constructor === Number) {
      if (e.op === "minus") {
        return -e.expression
      }
    } else if (e.expression.constructor === Boolean) {
      if (e.op === "not") {
        return !e.expression
      }
    }
    return e
  },
  LiteralList(e) {
    e.literals = optimize(e.literals)
    return e
  },
  Print(p) {
    p.argument = optimize(p.argument)
    return p
  },
  Call(c) {
    c.callee = optimize(c.callee)
    c.args = optimize(c.args)
    return c
  },
  Number(e) {
    return e
  },
  Boolean(e) {
    return e
  },
  Literal(e) {
    return e
  },
  Array(a) {
    return a.flatMap(optimize)
  },
}
