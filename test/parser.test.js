import assert from "assert"
import util from "util"
import parse from "../src/parser.js"

const source = `floatberry blend toCelsius(floatberry fahrenheit) ->
squeeze (5 divby 9) times (fahrenheit minus 32) |
<-`

const expectedAst = `   1 | Program statements=[#2]
   2 | FuncDecl func=#3 block=#6
   3 | Function name='toCelsius' parameters=[#4] returnType='f'
   4 | Parameter type='floatberry' id=#5
   5 | IdentifierExpression name='fahrenheit'
   6 | Block statements=[#7]
   7 | Return returnValue=#8
   8 | BinaryExpression op='times' expression1=#9 expression2=#12
   9 | BinaryExpression op='divby' expression1=#10 expression2=#11
  10 | Literal value=5
  11 | Literal value=9
  12 | BinaryExpression op='minus' expression1=#13 expression2=#14
  13 | IdentifierExpression name='fahrenheit'
  14 | Literal value=32`

const goodPrograms = [
  `stringberry medley is "hi" |`,
  `five is 5 orange 6 |`,
  `hi is "hello" apple "hey" |`,
  `intberry num is 34 |`,
  `stringberry hi |`,
  `floatberry flt is 4.223523 |`,
  `fruitbasket~stringberry, stringberry~ s is ~"key1","value1" ; "key2","value2"~ |`,
  `berrybasket~stringberry~ s is ~"strawberry" ; "blueberry"~ |`,
  `:: this is a comment`,
  `fn(arg1, arg2, arg3) |`,
  `formelon intberry i is 10 | i more equals num | i-- ->
    juice "the number is " plus i |
  <-`,
  `stringberry blend oddOrEven(intberry num) ->
   ifmelon num mod 2 equals 0 ->
     juice "The number is even." |
   <- elsemelon ->
     juice "The number is odd." |
   <-
 <-`,
  `intberry blend toCelsius(floatberry fahrenheit) ->
   squeeze (5 divby 9) times (fahrenheit minus 32) |
 <-`,
  `intberry blend fibonacci(intberry num) ->
   intberry num1 is 0 |
   intberry num2 is 1 |
   intberry sum |
   intberry i is 0 |
   formelon intberry i is 0 | i less num | i++ ->
     sum is num1 plus num2 |
     num1 is num2 |
     num2 is sum |
   <-
   squeeze num2 |
 <-`,
  `juice 2 to the power of -6 |`,
  `intberry i is none |`,
  `intberry i is 2 |
  whilemelon i less 10 ->
    juice " " plus i |
    i++ |
  <-`
]

const badPrograms = [
  `juice orange s`,
  `fruitbasket~stringberry, stringberry~ s is ~"key1","value1" : "key2","value2"~ |`,
  `blend (intberry num) ->`,
  `juice`,
  `intberry i is 0 |
  whilemelon i < 5 ->
     i++ |
  <-`,
  `intberry i = 32 |`,
  `blend toCelsius floatberry fahrenheit  ->
   squeeze 5 |
 <-`
]

describe("The parser", () => {
  for (const program of goodPrograms) {
    it(`accepts ${program}`, () => {
      assert.ok(parse(program))
    })
  }
  for (const program of badPrograms) {
    it(`rejects ${program}`, () => {
      assert.throws(() => parse(program))
    })
  }
  it("produces the expected AST for all node types", () => {
    assert.deepStrictEqual(util.format(parse(source)), expectedAst)
  })
})
