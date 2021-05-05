/*
Copied from the how to write a compiler notes
*/

import assert from "assert"
import util from "util"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"

// Programs that are semantically correct
const semanticChecks = [
  ["negative", "intberry x is -10 | "],
  ["negation", "boolberry a is organic | boolberry b is not organic |"],
  ["increment", "intberry x is 10 | x++ |"],
  ["decrement", "intberry x is 10 | x-- |"],
  ["times", "intberry x is 10 times 3 |"],
  ["divby", "intberry x is 10 divby 3 |"],
  ["mod", "intberry x is 10 mod 3 |"],
  ["plus", "intberry x is 10 plus 3 |"],
  ["minus", "intberry x is 10 minus 3 |"],
  ["power", "intberry x is 10 to the power of 3 |"],

  ["initialize with empty array", "berrybasket~intberry~ toppings is ~~ |"],
  [
    "initialize with empty dictionary",
    "fruitbasket~intberry, intberry~ x is ~~~~ |",
  ],
  [
    "initialize with nonempty dictionary",
    "fruitbasket~intberry, intberry~ x is ~~3,4~~ |",
  ],

  [
    "array declaration",
    'berrybasket~stringberry~ toppings is ~"strawberry" ; "blueberry"~ |',
  ],
  [
    "dictonary declaration",
    'fruitbasket~stringberry, stringberry~ flavors is ~~"lemon","tart" ; "starfruit","sweet"~~ |',
  ],
  ["int declaration", "intberry x | x is 2 |"],
  ["int assignment", "intberry x is 4 |"],
  ["boolean assignment", "boolberry x is organic |"],
  ["float assignment", "intberry x is 4 |"],
  ["string assignment", 'stringberry x is "Hello World" |'],
  ["console output", 'juice "Hello World" |'],
  ["boolean type true", "boolberry x is organic |"],
  ["boolean type false", "boolberry x is gmo |"],
  ["basic return", 'stringberry blend f() -> squeeze "" | <-'],
  [
    "return in nested if",
    'stringberry blend f() -> ifmelon organic -> squeeze "" | <- <-',
  ],
  ["break in nested if", "whilemelon gmo -> ifmelon organic -> split | <- <-"],
  ["long if", "ifmelon organic -> juice 1 | <- elsemelon -> juice 3 | <-"],
  [
    "else if",
    "ifmelon organic -> juice 1 | <- elifmelon organic -> juice 0 |<- elsemelon -> juice 2 | <-",
  ],
  [
    "for with conditions",
    'formelon intberry i is 5 | i less 10 | i++ -> juice "hi" | <-',
  ],
  ["or", "juice gmo orange organic |"],
  ["and", "juice gmo apple organic |"],
  [
    "arithmetic",
    "intberry x is 1 | juice 2 times 3 plus 5 divby 2 minus 5 mod 8 |",
  ],
  [
    "assigned functions",
    "intberry blend fn (intberry five) -> intberry seven is 2 plus five | juice seven | <-",
  ],
  [
    "assigned functions2",
    "intberry seven is 7 | intberry blend fn () -> juice seven | <-",
  ],
  [
    "call of assigned functions",
    "intberry blend fn (intberry five) -> intberry seven is 2 plus five | juice seven | <- fn(5) |",
  ],
  ["binary expression", "intberry seven is 2 plus 5 |"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  [
    "int already declared",
    "intberry x is 1 | intberry x is 2",
    /Identifier x already declared/,
  ],
  ["incorrect typing", "intberry x is organic |", /Not same type/],
  ["non-int increment", "boolberry x is gmo | x++ |", /an integer/],
  ["non-int decrement", 'stringberry x is "" | x-- |', /an integer/],
  ["undeclared id", "juice x |", /Identifier x not declared/],
  // ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
  ["assign bad type", "intberry x is 1 | x is organic |", /Not assignable/],
  // [
  //   "assign bad array type",
  //   "berrybasket~intberry~ toppings is ~3;organic~ |",
  //   /Not assignable/
  // ],
  [
    "Break outside loop but inside function",
    "stringberry blend f() -> split | <-",
    /Break can only appear in a loop/,
  ],
  [
    "break outside loop at top level",
    "split |",
    /Break can only appear in a loop/,
  ],
  [
    "break inside function",
    "intberry blend fn (intberry j) -> split | <-",
    /Break can only appear in a loop/,
  ],
  [
    "return outside function",
    "squeeze 2 |",
    /Return can only appear in a function/,
  ],
  ["non-boolean short if test", "ifmelon 1 -><-", /a boolean/],
  ["non-boolean if test", "ifmelon 1 -><- elsemelon -><-", /a boolean/],
  ["non-boolean while test", "whilemelon 1 -><-", /a boolean/],
  ["bad types for ||", "juice gmo orange 1 |", /a boolean/],
  ["bad types for &&", "juice gmo apple 1 |", /a boolean/],
  ["bad types for ==", "juice gmo equals 1 |", /Not same type/],

  ["bad types for +", "juice gmo plus 1 |", /a number/],
  ["bad types for -", "juice gmo minus 1 |", /a number/],
  ["bad types for *", "juice gmo times 1 |", /a number/],
  ["bad types for /", "juice gmo divby 1 |", /a number/],
  ["bad types for %", "juice gmo mod 1 |", /a number/],
  ["bad types for <", "juice gmo less 1 |", /Expected a number/],
  ["bad types for <=", "juice gmo less equals 1 |", /Expected a number/],
  ["bad types for >", "juice gmo more 1 |", /Expected a number/],
  ["bad types for >=", "juice gmo more equals 1 |", /Expected a number/],
  ["bad types for ==", `juice 2 equals "hi" |`, /Not same type/],
  ["bad types for negation", "juice not 1 |", /a boolean/],
  ["bad types for not", 'juice not "hello" |', /a boolean/],

  // [
  //   "Too many args",
  //   'stringberry blend f(intberry x) ->squeeze "" | <- f(1,2) |',
  //   /1 argument\(s\) required but 2 passed/
  // ],

  // [
  //   "Parameter type mismatch",
  //   'stringberry blend f(intberry x) ->squeeze "" | <- f(gmo) |',
  //   /Cannot assign a boolean to a int/
  // ]
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
  // for (const [scenario, source, graph] of graphChecks) {
  //   it(`properly rewrites the AST for ${scenario}`, () => {
  //     assert.deepStrictEqual(analyze(parse(source)), new ast.Program(graph))
  //   })
  // }
})
