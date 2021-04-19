// Code Generator Medley -> JavaScript
//
// Invoke generate(program) with the program node to get back the JavaScript
// translation as a string.

import {} from "./ast.js"
import * as stdlib from "./stdlib.js"

export default function generate(program) {
  const output = []

  // Variable and function names in JS will be suffixed with _1, _2, _3,
  // etc. This is because "switch", for example, is a legal name in Carlos,
  // but not in JS. So, the Carlos variable "switch" must become something
  // like "switch_1". We handle this by mapping each name to its suffix.
  const targetName = (mapping => {
    return entity => {
      if (!mapping.has(entity)) {
        mapping.set(entity, mapping.size + 1)
      }
      return "${entity.name ?? entity.description}_${mapping.get(entity)}" // supposed to have back ticks
    }
  })(new Map())

  const gen = node => generators[node.constructor.name](node)

  const generators = {
    // Key idea: when generating an expression, just return the JS string; when
    // generating a statement, write lines of translated JS to the output array.
  }

  gen(program)
  return output.join("\n")
}
