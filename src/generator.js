import {} from "./ast.js"

export default function generate(program) {
  const output = []

  const targetName = (mapping => {
    return entity => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name}_${mapping.get(entity)}`
    }
  })(new Map())

  const gen = node => generators[node.constructor.name](node)

  const generators = {
    Program(p) {
      gen(p.statements)
    },
    Assignment(d) {
      if (
        d.type === "boolberry" ||
        d.type === "intberry" ||
        d.type === "floatberry" ||
        d.type === "stringberry"
      ) {
        output.push(`let ${gen(d.variable)} = ${gen(d.source)};`)
      } else if (d.type["baseType"]) {
        output.push(`let ${gen(d.variable)} = [${gen(d.source).join(", ")}];`)
      } else {
        let pairs = gen(d.source)
        let genPairs = []
        for (let i = 0; i < pairs.length; i++) {
          let newPair = `${pairs[i].literal1.value}: ${pairs[i].literal2.value}`
          genPairs.push(newPair)
        }
        output.push(
          `let ${gen(d.variable)} = {${gen(genPairs)
            .join(", ")
            .replace(/"/g, "")}};`
        )
      }
    },
    Declaration(d) {
      output.push(`let ${gen(d.variable)};`)
    },
    FuncDecl(d) {
      output.push(
        `function ${gen(d.func)}(${gen(d.func.parameters[0].variable)}) {`
      )
      gen(d.block)
      output.push("}")
    },
    Variable(v) {
      return targetName(v)
    },
    Function(f) {
      return targetName(f)
    },
    Increment(s) {
      output.push(`${gen(s.identifier)}++;`)
    },
    Reassignment(s) {
      output.push(`${gen(s.targets)} = ${gen(s.source)};`)
    },
    Break(s) {
      output.push("break;")
    },
    Return(s) {
      output.push(`return ${gen(s.returnValue)};`)
    },
    Conditional(s) {
      output.push(`if (${gen(s.tests[0])}) {`)
      if (s.consequents[0].statements.length > 0) {
        gen(s.consequents[0])
      }

      for (let i = 1; i < s.tests.length; i++) {
        output.push(`} else if (${gen(s.tests[i])}) {`)
        if (s.consequents[i].statements.length > 0) {
          gen(s.consequents[i])
        }
      }
      if (s.alternates.length !== 0) {
        output.push(`} else {${gen(s.alternates)}`)
      }
      output.push(`}`)
    },
    Block(b) {
      gen(b.statements)
    },
    WLoop(s) {
      output.push(`while (${gen(s.test)}) {`)
      gen(s.body)
      output.push("}")
    },
    FLoop(s) {
      const i = targetName(s.initializer)
      let op
      switch (s.test.op) {
        case "more equals":
          op = ">="
          break
        case "less equals":
          op = "<="
          break
        case "more":
          op = ">"
          break
        default:
          op = "<"
          break
      }
      output.push(
        `for (let ${i} = ${gen(s.low)}; ${i} ${op} ${gen(s.high)}; ${i}++) {`
      )
      gen(s.body)
      output.push("}")
    },
    BinaryExpression(e) {
      let op = ""
      if (e.op === "less") {
        op = "<"
      } else if (e.op === "equals") {
        op = "==="
      } else if (e.op === "more") {
        op = ">"
      } else if (e.op === "minus") {
        op = "-"
      } else if (e.op === "plus") {
        op = "+"
      } else if (e.op === "times") {
        op = "*"
      } else if (e.op === "divby") {
        op = "/"
      } else if (e.op === "mod") {
        op = "%"
      } else if (e.op === "to the power of") {
        op = "**"
      } else if (e.op === "apple") {
        op = "&&"
      } else if (e.op === "orange") {
        op = "||"
      }
      return `(${gen(e.expression1)} ${op} ${gen(e.expression2)})`
    },
    UnaryExpression(e) {
      return `!${gen(e.expression)}`
    },
    DictContent(t) {
      return t
    },
    Print(x) {
      output.push(`console.log(${gen(x.argument)});`)
      return x
    },
    Call(c) {
      const targetCode = `${gen(c.callee)}(${gen(c.args).join(", ")})`
      output.push(`${targetCode};`)
    },
    Literal(e) {
      if (typeof e.value === "string") {
        return `"${e.value}"`
      } else {
        return e.value
      }
    },
    Number(e) {
      return e
    },
    String(e) {
      return JSON.stringify(e)
    },
    Array(a) {
      return a.map(gen)
    },
  }

  gen(program)
  return output.join("\n")
}
