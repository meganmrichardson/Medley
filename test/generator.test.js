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
    `
  },
  {
    name: "declaration",
    source: `floatberry x |`,
    expected: dedent`let x_1;
    `
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
    `
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
    `
  },
  {
    name: "for loop",
    source: `
    formelon intberry i is 0 | i less equals 10 | i++ ->
    <-
    `,
    expected: dedent`
    let i_1 = 2;
    while ((i_1 < 10)) {
      i_1++;
    }
    `
  },
  {
    name: "negation",
    source: `
    boolberry b is not organic |
    `,
    expected: dedent`
    let b = !true;
    `
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
    `
  }
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(analyze(parse(fixture.source)))
      assert.deepEqual(actual, fixture.expected)
    })
  }
})