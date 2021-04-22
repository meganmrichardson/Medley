// import assert from "assert/strict"
// import parse from "../src/parser.js"
// import analyze from "../src/analyzer.js"
// import optimize from "../src/optimizer.js"
// import generate from "../src/generator.js"

// function dedent(s) {
//   return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
// }

// const fixtures = [
//   {
//     name: "small",
//     source: `
//     //   let x = 3 * 7;
//     //   x++;
//     //   x--;
//     //   let y = true;
//     //   y = 5 ** -x / -100 > - x || false;
//     //   print((y && y) || false || (x*2) != 5);
//     `,
//     expected: dedent`
//     //   let x_1 = 21;
//     //   x_1++;
//     //   x_1--;
//     //   let y_2 = true;
//     //   y_2 = (((5 ** -(x_1)) / -(100)) > -(x_1));
//     //   console.log(((y_2 && y_2) || ((x_1 * 2) !== 5)));
//     `
//   }
// ]

// describe("The code generator", () => {
//   for (const fixture of fixtures) {
//     it(`produces expected js output for the ${fixture.name} program`, () => {
//       const actual = generate(optimize(analyze(parse(fixture.source))))
//       assert.deepEqual(actual, fixture.expected)
//     })
//   }
// })
