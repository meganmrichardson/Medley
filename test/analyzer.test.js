/*
Copied from the ael repository!! 
Change for Medley!!
*/

import assert from "assert"
import util from "util"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"

// const source = `blend toCelsius(floatberry fahrenheit) ->
// squeeze (5 divby 9) times (fahrenheit minus 32) |
// <-`

// const expectedAst = String.raw`   1 | Program statements=[#2]
// 2 | Function type='toCelsius' parameters=#3 block=#5
// 3 | Params type1='floatberry' id1=#4 type2=[] id2=[]
// 4 | IdentifierExpression name='fahrenheit'
// 5 | Block statement=[#6]
// 6 | Return returnValue=#7
// 7 | Exp5 expression1=#8 expression2=#12
// 8 | Exp8 expression=#9
// 9 | Exp5 expression1=#10 expression2=#11
// 10 | Literal type=5
// 11 | Literal type=9
// 12 | Exp8 expression=#13
// 13 | Exp4 expression1=#14 expression2=#15
// 14 | IdentifierExpression name='fahrenheit'
// 15 | Literal type=32`

// // change errorFixture examples
// const errorFixture = [
//   ["redeclarations", "print x", /Identifier x not declared/],
//   ["non declared ids", "let x = 1\nlet x = 1", /Identifier x already declared/]
// ]

// describe("The analyzer", () => {
//   it("can analyze all the nodes", done => {
//     assert.deepStrictEqual(util.format(analyze(parse(source))), expectedAst)
//     done()
//   })
//   for (const [scenario, source, errorMessagePattern] of errorFixture) {
//     it(`throws on ${scenario}`, done => {
//       assert.throws(() => analyze(parse(source)), errorMessagePattern)
//       done()
//     })
//   }
// })

// Programs that are semantically correct
const semanticChecks = [
  [
    "variable declarations",
    'intberry x is 4 |; stringberry y is "Hello, World!" |'
  ],
  ["increment", "intberry x is 10 | x++ |"],
  ["decrement", "intberry x is 10 | x-- |"],
  ["initialize with empty array", "berrybasket~intberry~ toppings is ~~ |"],
  // ["struct declaration", "struct S {f: (int)->boolean? g: string}"],
  // ["assign arrays", "let a = [](of int);let b=[1];a=b;b=a;"],
  // ["initialize with empty optional", "let a = no int;"],
  ["short return", "blend f() -> squeeze | <-"],
  ["long return", "blend f(intberry x) -> squeeze x | <-"],
  // ["assign optionals", "let a = no int;let b=some 1;a=b;b=a;"],
  ["return in nested if", "blend f() -> ifmelon organic -> blend | <- <-"],
  ["break in nested if", "whilemelon gmo -> ifmelon organic -> break | <- <-"],
  ["long if", "ifmelon organic -> juice 1 | <- elsemelon -> juice 3 | <-"],
  [
    "else if",
    "ifmelon organic -> squeeze 1 | <- elifmelon organic -> squeeze 0 |<- elsemelon -> squeeze 2 | <-"
  ],
  [
    "for with conditions",
    "formelon intberry i is 5 | i less 10 | i++ -> squeeze `hi` | <-"
  ],
  // ["repeat", "repeat 3 {let a = 1; print(a);}"],
  // ["conditionals with ints", "print(true ? 8 : 5);"],
  // ["conditionals with floats", "print(1<2 ? 8.0 : -5.22);"],
  // ["conditionals with strings", 'print(1<2 ? "x" : "y");'],
  // ["??", "print(some 5 ?? 0);"],
  // ["nested ??", "print(some 5 ?? 8 ?? 0);"],
  ["or", "squeeze gmo orange organic |"],
  ["and", "squeeze gmo apple not organic |"],
  // ["relations", 'print(1<=2 && "x">"y" && 3.5<1.2);'],
  // ["ok to == arrays", "print([1]==[5,8]);"],
  // ["ok to != arrays", "print([1]!=[5,8]);"],
  // ["shifts", "print(1<<3<<5<<8>>2>>0);"],
  // ["arithmetic", "let x=1;print(2*3+5**-3/2-5%8);"],
  // ["array length", "print(#[1,2,3]);"],
  // ["optional types", "let x = no int; x = some 100;"],
  // ["variables", "let x=[[[[1]]]]; print(x[0][0][0][0]+2);"],
  // ["recursive structs", "struct S {z: S?} let x = S(no S);"],
  // ["nested structs", "struct T{y:int} struct S{z: T} let x=S(T(1)); print(x.z.y);"],
  // ["member exp", "struct S {x: int} let y = S(1);print(y.x);"],
  // ["subscript exp", "let a=[1,2];print(a[0]);"],
  // ["array of struct", "struct S{} let x=[S(), S()];"],
  // ["struct of arrays and opts", "struct S{x: [int] y: string??}"],
  [
    "assigned functions",
    "blend fn (intberry five) -> intberry seven is 2 plus five | <-"
  ]
  // ["call of assigned functions", "function f(x: int) {}\nlet g=f;g(1);"],
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
  [
    "incorrect typing",
    "intberry x is organic |",
    /Typing must match with declared typing/
  ]
  // ["non-distinct fields", "struct S {x: boolean x: int}", /Fields must be distinct/],
  // ["non-int increment", "let x=false;x++;", /an integer, found boolean/],
  // ["non-int decrement", 'let x=some[""];x++;', /an integer, found [string]?/],
  // ["undeclared id", "print(x);", /Identifier x not declared/],
  // ["redeclared id", "let x = 1;let x = 1;", /Identifier x already declared/],
  // ["assign to const", "const x = 1;x = 2;", /Cannot assign to constant x/],
  // ["assign bad type", "let x=1;x=true;", /Cannot assign a boolean to a int/],
  // ["assign bad array type", "let x=1;x=[true];", /Cannot assign a \[boolean\] to a int/],
  // ["assign bad optional type", "let x=1;x=some 2;", /Cannot assign a int\? to a int/],
  // ["break outside loop", "break;", /Break can only appear in a loop/],
  // [
  //   "break inside function",
  //   "while true {function f() {break;}}",
  //   /Break can only appear in a loop/,
  // ],
  // ["return outside function", "return;", /Return can only appear in a function/],
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
  // ["non-boolean short if test", "if 1 {}", /a boolean, found int/],
  // ["non-boolean if test", "if 1 {} else {}", /a boolean, found int/],
  // ["non-boolean while test", "while 1 {}", /a boolean, found int/],
  // ["non-integer repeat", 'repeat "1" {}', /an integer, found string/],
  // ["non-integer low range", "for i in true...2 {}", /an integer, found boolean/],
  // ["non-integer high range", "for i in 1..<no int {}", /an integer, found int\?/],
  // ["non-array in for", "for i in 100 {}", /Array expected/],
  // ["non-boolean conditional test", "print(1?2:3);", /a boolean, found int/],
  // ["diff types in conditional arms", "print(true?1:true);", /not have the same type/],
  // ["unwrap non-optional", "print(1??2);", /Optional expected/],
  // ["bad types for ||", "print(false||1);", /a boolean, found int/],
  // ["bad types for &&", "print(false&&1);", /a boolean, found int/],
  // ["bad types for ==", "print(false==1);", /Operands do not have the same type/],
  // ["bad types for !=", "print(false==1);", /Operands do not have the same type/],
  // ["bad types for +", "print(false+1);", /number or string, found boolean/],
  // ["bad types for -", "print(false-1);", /a number, found boolean/],
  // ["bad types for *", "print(false*1);", /a number, found boolean/],
  // ["bad types for /", "print(false/1);", /a number, found boolean/],
  // ["bad types for **", "print(false**1);", /a number, found boolean/],
  // ["bad types for <", "print(false<1);", /number or string, found boolean/],
  // ["bad types for <=", "print(false<=1);", /number or string, found bool/],
  // ["bad types for >", "print(false>1);", /number or string, found bool/],
  // ["bad types for >=", "print(false>=1);", /number or string, found bool/],
  // ["bad types for ==", "print(2==2.0);", /not have the same type/],
  // ["bad types for !=", "print(false!=1);", /not have the same type/],
  // ["bad types for negation", "print(-true);", /a number, found boolean/],
  // ["bad types for length", "print(#false);", /Array expected/],
  // ["bad types for not", 'print(!"hello");', /a boolean, found string/],
  // ["non-integer index", "let a=[1];print(a[false]);", /integer, found boolean/],
  // ["no such field", "struct S{} let x=S(); print(x.y);", /No such field/],
  // ["diff type array elements", "print([3,3.0]);", /Not all elements have the same type/],
  // ["shadowing", "let x = 1;\nwhile true {let x = 1;}", /Identifier x already declared/],
  // ["call of uncallable", "let x = 1;\nprint(x());", /Call of non-function/],
  // [
  //   "Too many args",
  //   "function f(x: int) {}\nf(1,2);",
  //   /1 argument\(s\) required but 2 passed/,
  // ],
  // [
  //   "Too few args",
  //   "function f(x: int) {}\nf();",
  //   /1 argument\(s\) required but 0 passed/,
  // ],
  // [
  //   "Parameter type mismatch",
  //   "function f(x: int) {}\nf(false);",
  //   /Cannot assign a boolean to a int/,
  // ],
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
