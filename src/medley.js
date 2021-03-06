#! /usr/bin/env node

import util from "util"
import fs from "fs/promises"
import process from "process"
import compile from "./compiler.js"

const help = `Medley compiler
Syntax: src/medley.js <filename> <outputType>
Prints to stdout according to <outputType>, which must be one of:
  ast        the abstract syntax tree
  analyzed   the semantically analyzed representation
  optimized  the optimized semantically analyzed representation
  js         the translation to JavaScript
  c          the translation to C
  llvm       the translation to LLVM
`

async function compileFromFile(filename, outputType) {
  try {
    const buffer = await fs.readFile(filename)
    console.log(
      util.inspect(compile(buffer.toString(), outputType), {
        depth: null,
      })
    )
  } catch (e) {
    console.trace(e)
    process.exitCode = 1
  }
}

if (process.argv.length !== 4) {
  console.log(help)
} else {
  compileFromFile(process.argv[2], process.argv[3])
}
