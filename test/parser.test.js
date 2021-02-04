import assert from "assert";
import parse from "../src/parser.js";

const goodPrograms = [
  "stringberry medley = 'hi' |",
  "intberry num = 34",
  "floatberry flt = 4.223523"
];

const badPrograms = [];

describe("The parser", () => {
  for (const program in goodPrograms) {
    it(`accepts $(program)`, () => {
      assert.ok(parse(program));
    });
  }
  for (const program in badPrograms) {
    it(`rejects $(program)`, () => {
      assert.ok(!parse(program));
    });
  }
});
