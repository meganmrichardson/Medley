import {} from "./ast.js"
import * as stdlib from "./stdlib.js"

export default function generate(program) {
  const output = []

  const standardFunctions = new Map([
    [stdlib.functions.print, x => `console.log(${x})`]
  ])

  const targetName = (mapping => {
    return entity => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return `${entity.name ?? entity.description}_${mapping.get(entity)}`
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
    Block(p) {
      gen(p.statements)
    },
    FuncDecl(d) {
      //console.log("d.func params:", d.func.parameters[0])
      //d.func.parameters.id
      //${gen(d.func.parameters.id.name).join(", ")}
      output.push(
        `function ${gen(d.func)}(${gen(d.func.parameters[0].variable)}) {`
      )
      // issue with analyzer.js, maybe the identifier expression isn't defined correctly? That or Params is the issue
      gen(d.block)
      output.push("}")
    },
    Parameter(p) {
      return targetName(p)
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
    BreakStatement(s) {
      output.push("break;")
    },
    ReturnStatement(s) {
      output.push(`return ${gen(s.expression)};`)
    },
    Conditional(s) {
      //let talliedUpConsequents =
      //console.log("s in conditional", s)
      //console.log("s.tests[0]:", s.tests[0])
      // console.log(`s tests ${s.tests}`)
      // console.log(`s test ${s.consequents[0].statements}`)
      output.push(
        `if (${gen(s.tests[0])}) {${
          s.consequents[0].statements.length > 0 ? gen(s.consequents[0]) : ""
        }`
      )
      for (let i = 1; i < s.tests.length; i++) {
        output.push(
          `} else if (${gen(s.tests[i])}) {${
            s.consequents[i].statements.length > 0 ? gen(s.consequents[i]) : ""
          }`
        )
      }
      if (s.alternates.length !== 0) {
        output.push(`} else {${gen(s.alternates)}`)
      }
      output.push(`}`)
    },
    Block(b) {
      // console.log("b", b)
      // console.log("b.statements", b.statements)
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
      //console.log("binary expression information:", e)
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
    ArrayType(e) {
      // console.log(e.elements.join(", "))
      return `[${gen(e.elements).join(", ")}]`
    },
    DictType(t) {
      // console.log(t)
      return t
    },
    DictContent(t) {
      // console.log(t)
      return t
    },
    DictionaryList(d) {
      return d
    },
    // Print
    // MemberExpression(e) {
    //   return `(${gen(e.object)}[${JSON.stringify(gen(e.field))}])`
    // },
    Call(c) {
      const targetCode = `${gen(c.callee)}(${gen(c.args).join(", ")})`
      // Calls in expressions vs in statements are handled differently
      // if (c.callee instanceof Type || c.callee.type.returnType !== Type.VOID) {
      //   return targetCode
      // }
      output.push(`${targetCode};`)
    },
    Arguments(a) {
      //gen(a.argumentList)
      return `${gen(a.argumentList)}`
    },
    IdentifierExpression(e) {
      return e
    },
    LiteralList(l) {
      // console.log("L", l)
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
    BigInt(e) {
      return e
    },
    Boolean(e) {
      return e
    },
    String(e) {
      return JSON.stringify(e)
    },
    Array(a) {
      return a.map(gen)
    }
  }

  gen(program)
  return output.join("\n")
}
