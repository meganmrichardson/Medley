/*
Copied from the how to write a compiler notes
*/

import assert from "assert"
import util from "util"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"

// Programs that are semantically correct
const semanticChecks = [
  ["negative", "intberry x is -10"],
  ["negation", "boolberry a is organic | boolberry b is nut "],
  ["increment", "intberry x is 10 | x++ |"],
  ["decrement", "intberry x is 10 | x-- |"],
  ["decrement", "intberry x is 10 | x-- |"],
  ["times", "intberry x is 10 times 3 |"],
  ["divby", "intberry x is 10 divby 3 |"],
  ["mod", "intberry x is 10 mod 3 |"],
  ["plus", "intberry x is 10 plus 3 |"],
  ["minus", "intberry x is 10 minus 3 |"],
  ["power", "intberry x is 10 power 3 |"],

  ["initialize with empty array", "berrybasket~intberry~ toppings is ~~ |"],
  [
    "initialize with empty dictionary",
    "berrybasket~intberry, intberry~ x is ~~ |",
  ],

  [
    "array declaration",
    'berrybasket~stringberry~ toppings is ~"strawberry" ; "blueberry"~ |',
  ],
  [
    "dictonary declaration",
    'fruitbasket~stringberry, stringberry~ flavors is ~"lemon","tart" ; "starfruit","sweet"~ |',
  ],
  ["int declaration", "intberry x is 4 |"],
  ["boolean declaration", "boolberry x is organic |"],
  ["float declaration", "intberry x is 4 |"],
  ["string declaration", 'stringberry x is "Hello World |"'],
  ["console output", 'juice "Hello World" |'],
  ["boolean type true", "boolberry x is organic |"],
  ["boolean type false", "boolberry x is gmo |"],

  // ["struct declaration", "struct S {f: (int)->boolean? g: string}"],
  // ["assign arrays", "let a = [](of int);let b=[1];a=b;b=a;"],
  // ["initialize with empty optional", "let a = no int;"],
  ["basic return", "blend f() -> squeeze | <-"],
  ["basic break", "blend f(intberry i) -> split | <-"],
  // ["assign optionals", "let a = no int;let b=some 1;a=b;b=a;"],
  ["return in nested if", "blend f() -> ifmelon organic -> blend | <- <-"],
  ["break in nested if", "whilemelon gmo -> ifmelon organic -> break | <- <-"],
  ["long if", "ifmelon organic -> juice 1 | <- elsemelon -> juice 3 | <-"],
  [
    "else if",
    "ifmelon organic -> squeeze 1 | <- elifmelon organic -> squeeze 0 |<- elsemelon -> squeeze 2 | <-",
  ],
  [
    "for with conditions",
    "formelon intberry i is 5 | i less 10 | i++ -> squeeze `hi` | <-",
  ],
  // ["repeat", "repeat 3 {let a = 1; print(a);}"],
  ["or", "squeeze gmo orange organic |"],
  ["and", "squeeze gmo apple not organic |"],
  // ["relations", 'print(1<=2 && "x">"y" && 3.5<1.2);'],
  // ["ok to == arrays", "print([1]==[5,8]);"],
  // ["ok to != arrays", "print([1]!=[5,8]);"],
  // ["shifts", "print(1<<3<<5<<8>>2>>0);"],
  [
    "arithmetic",
    "intberry x is 1 | juice 2 times 3 plus 5 divby 2 minus 5 mod 8 |",
  ],
  // ["array length", "print(#[1,2,3]);"],
  // ["variables", "let x=[[[[1]]]]; print(x[0][0][0][0]+2);"],
  // ["member exp", "struct S {x: int} let y = S(1);print(y.x);"],
  // ["subscript exp", "let a=[1,2];print(a[0]);"],
  [
    "assigned functions",
    "blend fn (intberry five) -> intberry seven is 2 plus five | <-",
  ],
  ["call of assigned functions", "intberry num is f (4, 3, 2) |"],
  // ["type equivalence of nested arrays", "function f(x: [[int]]) {} print(f([[1],[2]]));"],
  // [
  //   "call of assigned function in expression",
  //   `function f(x: int, y: boolean): int {}
  //   let g = f;
  //   print(g(1, true));
  //   f = g; // Type check here`,
  // ],
  // [
  //   "pass a function to a function",
  //   `function f(x: int, y: (boolean)->void): int { return 1; }
  //    function g(z: boolean) {}
  //    f(2, g);`,
  // ],
  // [
  //   "function return types",
  //   `function square(x: int): int { return x * x; }
  //    function compose(): (int)->int { return square; }`,
  // ],
  // ["struct parameters", "struct S {} function f(x: S) {}"],
  // ["array parameters", "function f(x: [int?]) {}"],
  // ["optional parameters", "function f(x: [int], y: string?) {}"],
  // ["built-in constants", "print(25.0 * π);"],
  // ["built-in sin", "print(sin(π));"],
  // ["built-in cos", "print(cos(93.999));"],
  // ["built-in hypot", "print(hypot(-4.0, 3.00001));"],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
  ["incorrect typing", "intberry x is organic |", /a boolean, found integer/],
  [
    // ["non-distinct fields", "struct S {x: boolean x: int}", /Fields must be distinct/],
    "non-int increment",
    "boolberry x is gmo | x++ |",
    /an integer, found boolean/,
  ],
  [
    "non-int decrement",
    'strinberry x is "" | x-- |',
    /an integer, found [string]?/,
  ],
  ["undeclared id", "juice x |", /Identifier x not declared/],
  // ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
  // ["assign to const", "const x = 1;x = 2;", /Cannot assign to constant x/],
  [
    "assign bad type",
    "intberry x is 1 | x is organic |",
    /Cannot assign a boolean to a int/,
  ],
  [
    "assign bad array type",
    "berrybasket~intberry~ toppings is ~3;organic~ |",
    /Cannot assign a \[boolean\] to a int/,
  ],
  // ["assign bad optional type", "let x=1;x=some 2;", /Cannot assign a int\? to a int/],
  // ["break outside loop", "break;", /Break can only appear in a loop/],
  // [
  //   "break inside function",
  //   "while true {function f() {break;}}",
  //   /Break can only appear in a loop/,
  // ],
  [
    "return outside function",
    "squeeze |",
    /Return can only appear in a function/,
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
  ["non-boolean short if test", "ifmelon 1 -><-", /a boolean, found int/],
  [
    "non-boolean if test",
    "ifmelon 1 -><- elsemelon -><-",
    /a boolean, found int/,
  ],
  ["non-boolean while test", "whilemelon 1 -><-", /a boolean, found int/],
  // ["non-integer repeat", 'repeat "1" {}', /an integer, found string/],
  // ["non-integer low range", "for i in true...2 {}", /an integer, found boolean/],
  // ["non-integer high range", "for i in 1..<no int {}", /an integer, found int\?/],
  // ["non-array in for", "for i in 100 {}", /Array expected/],
  // ["non-boolean conditional test", "print(1?2:3);", /a boolean, found int/],
  // ["diff types in conditional arms", "print(true?1:true);", /not have the same type/],
  // ["unwrap non-optional", "print(1??2);", /Optional expected/],
  ["bad types for ||", "juice gmo or 1 |", /a boolean, found int/],
  ["bad types for &&", "juice gmo and 1 |", /a boolean, found int/],
  [
    "bad types for ==",
    "juice gmo equals 1 |",
    /Operands do not have the same type/,
  ],
  [
    "bad types for !=",
    "juice gmo nut equals 1 |",
    /Operands do not have the same type/,
  ],
  ["bad types for +", "juice gmo plus 1 |", /number or string, found boolean/],
  ["bad types for -", "juice gmo minus 1 |", /a number, found boolean/],
  ["bad types for *", "juice gmo times 1 |", /a number, found boolean/],
  ["bad types for /", "juice gmo divby 1 |", /a number, found boolean/],
  ["bad types for %", "juice gmo mod 1 |", /a number, found boolean/],
  ["bad types for <", "juice gmo less 1 |", /number or string, found boolean/],
  [
    "bad types for <=",
    "juice gmo less equals 1 |",
    /number or string, found bool/,
  ],
  ["bad types for >", "juice gmo more 1 |", /number or string, found bool/],
  [
    "bad types for >=",
    "juice gmo more equals 1 |",
    /number or string, found bool/,
  ],
  ["bad types for ==", "juice 2 equals 2.0 |", /not have the same type/],
  ["bad types for negation", "juice nut organic |", /a number, found boolean/],
  // ["bad types for length", "print(#false);", /Array expected/],
  ["bad types for not", 'juice nut "hello" |', /a boolean, found string/],
  ["bad types for -", 'juice - "hello" |', /a Number, found string/],
  // ["non-integer index", "let a=[1];print(a[false]);", /integer, found boolean/],
  // ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  // ["diff type array elements", "print([3,3.0]);", /Not all elements have the same type/],
  // ["shadowing", "let x = 1;\nwhile true {let x = 1;}", /Identifier x already declared/],
  // ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  [
    "Too many args",
    "blend f(intberry x) -><-\nf(1,2) |",
    /1 argument\(s\) required but 2 passed/,
  ],
  // [
  //   "Too few args",
  //   "blend f(intberry x) {}\nf();",
  //   /1 argument\(s\) required but 0 passed/,
  // ],
  [
    "Parameter type mismatch",
    "blend f(intberry x) -><-\nf(gmo);",
    /Cannot assign a boolean to a int/,
  ],
  // [
  //   "function type mismatch",
  //   `function f(x: int, y: (boolean)->void): int { return 1; }
  //    function g(z: boolean): int { return 5; }
  //    f(2, g);`,
  //   /Cannot assign a \(boolean\)->int to a \(boolean\)->void/,
  // ],
  // ["bad call to stdlib sin()", "print(sin(true));", /Cannot assign a boolean to a float/],
  // ["Non-type in param", "let x=1;function f(y:x){}", /Type expected/],
  // ["Non-type in return type", "let x=1;function f():x{return 1;}", /Type expected/],
  // ["Non-type in field type", "let x=1;struct S {y:x}", /Type expected/],
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
