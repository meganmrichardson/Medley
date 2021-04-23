// Code Generator Medley -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.

import {} from "./ast.js"
import * as stdlib from "./stdlib.js"

export default function generate(program) {
  const output = []

  const standardFunctions = new Map([
    [stdlib.functions.print, x => `console.log(${x})`]
  ])

  // Variable and function names in JS will be suffixed with _1, _2, _3,
  // etc. This is because "switch", for example, is a legal name in Carlos,
  // but not in JS. So, the Carlos variable "switch" must become something
  // like "switch_1". We handle this by mapping each name to its suffix.
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
      output.push(`let ${gen(d.variable)} = ${gen(d.source)};`)
    },
    Declaration(d) {
      output.push(`let ${gen(d.variable)};`)
    },
    Block(p) {
      gen(p.statements)
    },
    // TypeDeclaration(d) {
    //   output.push(`class ${gen(d.type)} {`)
    //   output.push(`constructor(${gen(d.type.fields).join(",")}) {`)
    //   for (let field of d.type.fields) {
    //     output.push(`this[${JSON.stringify(gen(field))}] = ${gen(field)};`)
    //   }
    //   output.push("}")
    //   output.push("}")
    // },
    // Field(f) {
    //   return targetName(f)
    // },
    // FunctionDeclaration(d) {
    //   output.push(
    //     `function ${gen(d.fun)}(${gen(d.fun.parameters).join(", ")}) {`
    //   )
    //   gen(d.body)
    //   output.push("}")
    // },
    // Parameter(p) {
    //   return targetName(p)
    // },
    Variable(v) {
      return targetName(v)
    },
    // Function(f) {
    //   return targetName(f)
    // },
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
    // IfStatement(s) {
    //   output.push(`if (${gen(s.test)}) {`)
    //   gen(s.consequent)
    //   if (s.alternate.constructor === IfStatement) {
    //     output.push("} else")
    //     gen(s.alternate)
    //   } else {
    //     output.push("} else {")
    //     gen(s.alternate)
    //     output.push("}")
    //   }
    // },
    // ShortIfStatement(s) {
    //   output.push(`if (${gen(s.test)}) {`)
    //   gen(s.consequent)
    //   output.push("}")
    // },
    WLoop(s) {
      output.push(`while (${gen(s.test)}) {`)
      gen(s.body)
      output.push("}")
    },
    FLoop(s) {
      const i = targetName(s.initializer.name)
      console.log("test:", s.test)
      console.log("initializer:", s.initializer.name)
      let high = s.test.expression2["value"]
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
      // figure out whats happening and change back to i
      output.push(
        `for (let ${s.initializer.name} = ${gen(high)}; ${
          s.initializer.name
        } ${op} ${gen(high)}; ${s.initializer.name}++) {`
      )
      gen(s.body)
      output.push("}")
    },
    BinaryExpression(e) {
      let op = ""
      if (e.op === "less") {
        op = "<"
      } else if (e.op === "equals") {
        op = "=="
      } else if (e.op === "more") {
        op = ">"
      }
      return `(${gen(e.expression1)} ${op} ${gen(e.expression2)})`
    },
    UnaryExpression(e) {
      return `!${gen(e.expression)}`
    },
    // ArrayExpression(e) {
    //   return `[${gen(e.elements).join(",")}]`
    // },
    // MemberExpression(e) {
    //   return `(${gen(e.object)}[${JSON.stringify(gen(e.field))}])`
    // },
    // Call(c) {
    //   const targetCode = standardFunctions.has(c.callee)
    //     ? standardFunctions.get(c.callee)(gen(c.args))
    //     : c.callee.constructor === StructType
    //     ? `new ${gen(c.callee)}(${gen(c.args).join(", ")})`
    //     : `${gen(c.callee)}(${gen(c.args).join(", ")})`
    //   // Calls in expressions vs in statements are handled differently
    //   if (c.callee instanceof Type || c.callee.type.returnType !== Type.VOID) {
    //     return targetCode
    //   }
    //   output.push(`${targetCode};`)
    // },
    Literal(e) {
      return e.value
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
