import * as ast from "./ast.js"

export default function optimize(node) {
  console.log(node)
  console.log(node.constructor.name)
  return optimizers[node.constructor.name](node)
}

const optimizers = {
  Program(p) {
    p.statements = optimize(p.statements)
    return p
  },
  Assignment(d) {
    d.source = optimize(d.source)
    return d
  },
  Declaration(d) {
    return d
  },
  FuncDecl(d) {
    // Get rid of statments that are after return
    d.block = optimize(d.block)
    console.log(d.block)
    let returned = false
    console.log(typeof d.block)
    return d
  },
  Variable(v) {
    return v
  },
  Function(f) {
    // console.log(f)
    return f
  },
  Parameter(p) {
    return p
  },
  // Increment includes decrement (should we add decrement?)
  Increment(s) {
    return s
  },
  Ressignment(s) {
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
    if (s.consequents.length > 0) {
      optimize(s.consequents) // how to deal with empty arrays??
    }
    if (s.alternates.length > 0) {
      optimize(s.alternates)
    }
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
    s.low = optimize(s.low)
    s.high = optimize(s.high)
    s.body = optimize(s.body)
    if (s.low.constructor === Number) {
      if (s.high.constructor === Number) {
        if (s.low > s.high) {
          return []
        }
      }
    }
    return s
  },
  //   ForStatement(s) {
  //     s.collection = optimize(s.collection)
  //     s.body = optimize(s.body)
  //     if (s.collection.constructor === ast.EmptyArray) {
  //       return []
  //     }
  //     return s
  //   },
  BinaryExpression(e) {
    e.expression1 = optimize(e.expression1)
    e.expression2 = optimize(e.expression2)
    if (e.op === "apple") {
      // Optimize boolean constants in && and ||
      if (e.expression1 === true) return e.expression2
      else if (e.expression2 === true) return e.expression1
      else if (e.expression1 === false) return false
      else if (e.expression2 === false) return false
    } else if (e.op === "orange") {
      if (e.expression1 === false) return e.expression2
      else if (e.expression2 === false) return e.expression1
      else if (e.expression1 === true) return true
      else if (e.expression2 === true) return true
    } else if ([Number, BigInt].includes(e.expression1.constructor)) {
      // Numeric constant folding when left operand is constant
      if ([Number, BigInt].includes(e.expression2.constructor)) {
        if (e.op === "plus") {
          return e.expression1 + e.expression2
        } else if (e.op === "minus") return e.expression1 - e.expression2
        else if (e.op === "times") return e.expression1 * e.expression2
        else if (e.op === "divby") return e.expression1 / e.expression2
        else if (e.op === "mod") return e.expression1 / e.expression2
        else if (e.op === "to the power of")
          return e.expression1 ** e.expression2
        else if (e.op === "less") return e.expression1 < e.expression2
        else if (e.op === "less equals") return e.expression1 <= e.expression2
        else if (e.op === "equals") return e.expression1 === e.expression2
        else if (e.op === "not equals") return e.expression1 !== e.expression2
        else if (e.op === "more equals") return e.expression1 >= e.expression2
        else if (e.op === "more") return e.expression1 > e.expression2
      } else if (e.expression1 === 0 && e.op === "plus") return e.expression2
      else if (e.expression1 === 1 && e.op === "times") return e.expression2
      else if (e.expression1 === 0 && e.op === "minus")
        return new ast.UnaryExpression("minus", e.expression2)
      else if (e.expression1 === 1 && e.op === "to the power of") return 1
      else if (e.expression1 === 0 && ["times", "divby"].includes(e.op))
        return 0
    } else if (e.expression2.constructor === Number) {
      // Numeric constant folding when right operand is constant
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
    }
    return e
  },
  //   SubscriptExpression(e) {
  //     e.array = optimize(e.array)
  //     e.index = optimize(e.index)
  //     return e
  //   },
  //   ArrayExpression(e) {
  //     e.elements = optimize(e.elements)
  //     return e
  //   },
  //   EmptyArray(e) {
  //     return e
  //   },
  //   MemberExpression(e) {
  //     e.object = optimize(e.object)
  //     return e
  //   },
  Call(c) {
    c.callee = optimize(c.callee)
    c.args = optimize(c.args)
    return c
  },
  BigInt(e) {
    return e
  },
  Number(e) {
    return e
  },
  Boolean(e) {
    return e
  }
  //   String(e) {
  //     return e
  //   },
  //   Array(a) {
  //     // Flatmap since each element can be an array
  //     return a.flatMap(optimize)
  //   },
}
