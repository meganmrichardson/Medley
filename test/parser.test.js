import assert from "assert"
import parse from "../src/parser.js"

const goodPrograms = [
  `stringberry medley is "hi" |`,
  `intberry num is 34 |`,
  `floatberry flt is 4.223523 |`,
  `fruitbasket~stringberry, stringberry~ s is ~"key1","value1" ; "key2","value2"~ |`,
  `berrybasket~stringberry~ s is ~"strawberry" ; "blueberry"~ |`,
  `:: this is a comment`,
  `:::
 This is a multiline comment
 :::`,
  `blend oddOrEven(intberry num) ->
   ifmelon num mod 2 equals 0 ->
     juice "The number is even." |
   <- elsemelon ->
     juice "The number is odd." |
   <-
 <-`,
  `blend toCelsius(floatberry fahrenheit) ->
   squeeze (5 divby 9) times (fahrenheit minus 32) |
 <-`,
  `blend fibonacci(intberry num) ->
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
 <-`,
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
})
