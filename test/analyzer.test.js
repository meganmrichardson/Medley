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
  ["negation", "boolberry a is organic | boolberry b is not |"],
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
    "fruitbasket~intberry, intberry~ x is ~~ |"
  ],

  [
    "array declaration",
    'berrybasket~stringberry~ toppings is ~"strawberry" ; "blueberry"~ |'
  ],
  [
    "dictonary declaration",
    'fruitbasket~stringberry, stringberry~ flavors is ~"lemon","tart" ; "starfruit","sweet"~ |'
  ],
  ["int declaration", "intberry x is 4 |"],
  ["boolean declaration", "boolberry x is organic |"],
  ["float declaration", "intberry x is 4 |"],
  ["string declaration", 'stringberry x is "Hello World" |'],
  ["console output", 'juice "Hello World" |'],
  ["boolean type true", "boolberry x is organic |"],
  ["boolean type false", "boolberry x is gmo |"],
  ["basic return", 'stringberry blend f() -> squeeze "" | <-'],
  [
    "return in nested if",
    'stringberry blend f() -> ifmelon organic -> squeeze "" | <- <-'
  ],
  ["break in nested if", "whilemelon gmo -> ifmelon organic -> split | <- <-"],
  ["long if", "ifmelon organic -> juice 1 | <- elsemelon -> juice 3 | <-"],
  // [
  //   "else if",
  //   "ifmelon organic -> squeeze 1 | <- elifmelon organic -> squeeze 0 |<- elsemelon -> squeeze 2 | <-",
  // ],
  [
    "for with conditions",
    'formelon intberry i is 5 | i less 10 | i++ -> juice "hi" | <-'
  ],
  ["or", "juice gmo orange organic |"],
  ["and", "juice gmo apple not organic |"],
  [
    "arithmetic",
    "intberry x is 1 | juice 2 times 3 plus 5 divby 2 minus 5 mod 8 |"
  ],
  [
    "assigned functions",
    "intberry blend fn (intberry five) -> intberry seven is 2 plus five | <-"
  ],
  ["call of assigned functions", "intberry num is f (4, 3, 2) |"]
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["incorrect typing", "intberry x is organic |", /a boolean/],
  ["non-int increment", "boolberry x is gmo | x++ |", /an integer/],
  ["non-int decrement", 'stringberry x is "" | x-- |', /an integer/],
  ["undeclared id", "juice x |", /Identifier x not declared/],
  // ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
  [
    "assign bad type",
    "intberry x is 1 | x is organic |",
    /Cannot assign a boolean to a int/
  ],
  [
    "assign bad array type",
    "berrybasket~intberry~ toppings is ~3;organic~ |",
    /Cannot assign a \[boolean\] to a int/
  ],
  [
    "Break outside loop but inside function",
    "stringberry blend f() -> split | <-",
    /Break can only appear in a loop/
  ],
  [
    "break outside loop at top level",
    "split |",
    /Break can only appear in a loop/
  ],
  // [
  //   "break inside function",
  //   "while true {function f() {break;}}",
  //   /Break can only appear in a loop/,
  // ],
  [
    "return outside function",
    "squeeze 2 |",
    /Return can only appear in a function/
  ],
  // [
  //   "return value from void function",
  //   "function f() {return 1;}",
  //   /Cannot return a value here/,
  // ],
  // [
  //   "return nothing from non-void",
  //   "function f(): int {return;}",
  //   /should be returned here/,
  // ],
  // ["return type mismatch", "function f(): int {return false;}", /boolean to a int/],
  ["non-boolean short if test", "ifmelon 1 -><-", /a boolean/],
  ["non-boolean if test", "ifmelon 1 -><- elsemelon -><-", /a boolean/],
  ["non-boolean while test", "whilemelon 1 -><-", /a boolean/],
  // ["non-array in for", "for i in 100 {}", /Array expected/],
  // ["non-boolean conditional test", "print(1?2:3);", /a boolean/],
  ["bad types for ||", "juice gmo orange 1 |", /a boolean/],
  ["bad types for &&", "juice gmo apple 1 |", /a boolean/],
  [
    "bad types for ==",
    "juice gmo equals 1 |",
    /Operands do not have the same type/
  ],
  // [
  //   "bad types for !=",
  //   "juice gmo not equals 1 |",
  //   /Operands do not have the same type/,
  // ],
  ["bad types for +", "juice gmo plus 1 |", /number/],
  ["bad types for -", "juice gmo minus 1 |", /a number/],
  ["bad types for *", "juice gmo times 1 |", /a number/],
  ["bad types for /", "juice gmo divby 1 |", /a number/],
  ["bad types for %", "juice gmo mod 1 |", /a number/],
  ["bad types for <", "juice gmo less 1 |", /Expected a number/],
  ["bad types for <=", "juice gmo less equals 1 |", /Expected a number/],
  ["bad types for >", "juice gmo more 1 |", /Expected a number/],
  ["bad types for >=", "juice gmo more equals 1 |", /Expected a number/],
  ["bad types for ==", "juice 2 equals 2.0 |", /not have the same type/],
  ["bad types for negation", "juice not organic |", /a boolean/],
  // ["bad types for length", "print(#false);", /Array expected/],
  ["bad types for not", 'juice not "hello" |', /a boolean/],
  // ["non-integer index", "let a=[1];print(a[false]);", /integer/],
  // ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  // ["diff type array elements", "print([3,3.0]);", /Not all elements have the same type/],
  // ["shadowing", "let x = 1;\nwhile true {let x = 1;}", /Identifier x already declared/],
  // ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  [
    "Too many args",
    'stringberry blend f(intberry x) ->squeeze "" | <- f(1,2) |',
    /1 argument\(s\) required but 2 passed/
  ],
  // [
  //   "Too few args",
  //   "blend f(intberry x) {}\nf();",
  //   /1 argument\(s\) required but 0 passed/,
  // ],
  [
    "Parameter type mismatch",
    'stringberry blend f(intberry x) ->squeeze "" | <- f(gmo) |',
    /Cannot assign a boolean to a int/
  ]
  // [
  //   "function type mismatch",
  //   `function f(x: int, y: (boolean)->void): int { return 1; }
  //    function g(z: boolean): int { return 5; }
  //    f(2, g);`,
  //   /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  // ],
  // ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
  // ["Non-type in return type", "let x=1;function f():x{return 1;}", /Type expected/],
]

// Test cases for expected semantic graphs after processing the AST. In general
// this suite of cases should have a test for each kind of node, including
// nodes that get rewritten as well as those that are just "passed through"
// by the analyzer. For now, we're just testing the various rewrites only.

// const Int = ast.Type.INT
// const Void = ast.Type.VOID
// const intToVoidType = new ast.FunctionType([Int], Void)

// const varX = Object.assign(new ast.Variable("x", false), { type: Int })

// const letX1 = Object.assign(new ast.VariableDeclaration("x", false, 1n), {
//   variable: varX,
// })
// const assignX2 = new ast.Assignment(varX, 2n)

// const funDeclF = Object.assign(
//   new ast.FunctionDeclaration("f", [new ast.Parameter("x", Int)], Void, []),
//   {
//     function: Object.assign(new ast.Function("f"), {
//       type: intToVoidType,
//     }),
//   }
// )

// const structS = Object.assign(
//   new ast.StructTypeDeclaration("S", [new ast.Field("x", Int)]),
//   { type: new ast.StructType("S", [new ast.Field("x", Int)]) }
// )

// const graphChecks = [
//   ["Variable created & resolved", "let x=1; x=2;", [letX1, assignX2]],
//   ["functions created & resolved", "function f(x: int) {}", [funDeclF]],
//   ["field type resolved", "struct S {x: int}", [structS]],
// ]

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
