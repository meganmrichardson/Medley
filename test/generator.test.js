import assert from "assert"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import generate from "../src/generator.js"

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
}

const fixtures = [
  {
    name: "assignment",
    source: `
    intberry x is 3 |
    `,
    expected: dedent`
    let x_1 = 3;
    `,
  },
  {
    name: "string assignment",
    source: `
    stringberry x is "hi" |
    `,
    expected: dedent`
    let x_1 = "hi";
    `,
  },
  {
    name: "declaration",
    source: `floatberry x |`,
    expected: dedent`let x_1;
    `,
  },
  {
    name: "increment",
    source: `
    intberry x is 10 |
    x++ |
    `,
    expected: dedent`
    let x_1 = 10;
    x_1++;
    `,
  },
  {
    name: "binary expression in while",
    source: `
    intberry i is 2 |
    whilemelon i less 10 ->
      i++ |
    <-
    `,
    expected: dedent`
    let i_1 = 2;
    while ((i_1 < 10)) {
      i_1++;
    }
    `,
  },
  {
    name: "for loop",
    source: `
    formelon intberry i is 0 | i less equals 10 | i++ ->
      intberry j is 2 |
      split |
    <-
    `,
    expected: dedent`
    for (let i_1 = 0; i_1 <= 10; i_1++) {
      let j_2 = 2;
      break;
    }
    `,
  },
  {
    name: "negation",
    source: `
    boolberry b is not organic |
    `,
    expected: dedent`
    let b_1 = !true;
    `,
  },
  {
    name: "reassignment",
    source: `
    boolberry b is not organic |
    b is organic |
    `,
    expected: dedent`
    let b_1 = !true;
    b_1 = true;
    `,
  },
  {
    name: "function",
    source: `
    intberry blend toCelsius(floatberry fahrenheit) ->
      juice "hi" |
      squeeze 3 |
    <-
    `,
    expected: dedent`
    function toCelsius_1(fahrenheit_2) {
      console.log("hi");
      return 3;
    }
    `,
  },
  {
    name: "if statement",
    source: `
    ifmelon 1 minus 2 equals 0 ->
    <- elsemelon ->
    <-
    `,
    expected: dedent`
    if (((1 - 2) === 0)) {

    } else {

    }
    `,
  },
  {
    name: "multiple if statements",
    source: `
    ifmelon 1 minus 2 equals 0 ->
    <- elifmelon 2 minus 2 equals 1 ->
    <- elifmelon 3 minus 1 equals 0 ->
    <- elsemelon ->
    <-
    `,
    expected: dedent`
    if (((1 - 2) === 0)) {

    } else if (((2 - 2) === 1)) {

    } else if (((3 - 1) === 0)) {

    } else {

    }
    `,
  },
  {
    name: "call",
    source: `
    floatberry blend toCelsius(floatberry fahrenheit) ->
    <-
    toCelsius(2.3 plus 3.5) |
    `,
    expected: dedent`
    function toCelsius_1(fahrenheit_2) {
      
    }
    toCelsius_1((2.3 + 3.5));
    `,
  },
  {
    name: "array",
    source: `
    berrybasket~stringberry~ s is ~"strawberry" ; "blueberry"~ |
    `,
    expected: dedent`
    let s_1 = ["strawberry", "blueberry"];
    `,
  },
  {
    name: "dictionary",
    source: `
    fruitbasket~intberry, intberry~ toppings is ~~1, 1; 2, 2~~ |
    `,
    expected: dedent`
    let toppings_1 = {1: 1, 2: 2};
    `,
  },
  {
    name: "for loop more equals",
    source: `
    formelon intberry i is 0 | i more equals 10 | i++ ->
      juice "hi" |
    <-
    `,
    expected: dedent`
    for (let i_1 = 0; i_1 >= 10; i_1++) {
      console.log("hi");
    }
    `,
  },
  {
    name: "for loop more than",
    source: `
    formelon intberry i is 0 | i more 10 | i++ ->
      juice "hi" |
    <-
    `,
    expected: dedent`
    for (let i_1 = 0; i_1 > 10; i_1++) {
      console.log("hi");
    }
    `,
  },
  {
    name: "for loop less than",
    source: `
    formelon intberry i is 0 | i less 10 | i++ ->
      juice "hi" |
    <-
    `,
    expected: dedent`
    for (let i_1 = 0; i_1 < 10; i_1++) {
      console.log("hi");
    }
    `,
  },
  {
    name: "more than binary",
    source: `
    juice 2 more 3 |
    `,
    expected: dedent`
    console.log((2 > 3));
    `,
  },
  {
    name: "binary expression",
    source: `
    juice 2 times 3 divby 4 mod 10 to the power of 4 |
    `,
    expected: dedent`
    console.log((((2 * 3) / 4) % (10 ** 4)));
    `,
  },
  {
    name: "apple and orange",
    source: `
    ifmelon organic apple gmo ->
    <- elifmelon gmo orange organic ->
    <- elsemelon ->
    <-
    `,
    expected: dedent`
    if ((true && false)) {

    } else if ((false || true)) {

    } else {

    }
    `,
  },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(analyze(parse(fixture.source)))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})
