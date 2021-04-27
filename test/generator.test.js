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
    <-
    `,
    expected: dedent`
    for (let i_1 = 0; i_1 <= 10; i_1++) {
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
    floatberry blend toCelsius(floatberry fahrenheit) ->
    <-
    `,
    expected: dedent`
    function toCelsius_1(fahrenheit_2) {
      
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
    name: "call",
    source: `
    floatberry blend toCelsius(floatberry fahrenheit) ->
    <-
    toCelsius(2 plus 3) |
    `,
    expected: dedent`
    function toCelsius_1(fahrenheit_2) {
      
    }
    toCelsius(2 + 3);
    `,
  },
  {
    name: "array",
    source: `
    berrybasket~stringberry~ s is ~"strawberry" ; "blueberry"~ |
    `,
    expected: dedent`
    let s = ["strawberry", "blueberry"];
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
