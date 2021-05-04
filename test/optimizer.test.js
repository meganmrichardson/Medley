import assert from "assert"
import optimize from "../src/optimizer.js"
import * as ast from "../src/ast.js"

// Make some test cases easier to read
const x = new ast.Variable("x")
const xpp = new ast.Increment(x)
// const xmm = new ast.Decrement(x)
const return1p1 = new ast.Return(new ast.BinaryExpression("plus", 1, 1))
const return2 = new ast.Return(2)
// const returnX = new ast.ReturnStatement(x)
const onePlusTwo = new ast.BinaryExpression("plus", 1, 2)
// const identity = Object.assign(new ast.Function("id"), { body: returnX })
const intFun = body =>
  new ast.FuncDecl(new ast.Function("f", [], "intberry"), body)
const callIdentity = args => new ast.Call(identity, args)
const or = (...d) =>
  d.reduce((x, y) => new ast.BinaryExpression("orange", x, y))
const and = (...c) =>
  c.reduce((x, y) => new ast.BinaryExpression("apple", x, y))
const less = (x, y) => new ast.BinaryExpression("less", x, y)
const eq = (x, y) => new ast.BinaryExpression("equals", x, y)
const times = (x, y) => new ast.BinaryExpression("times", x, y)
const neg = x => new ast.UnaryExpression("minus", x)
// const array = (...elements) => new ast.ArrayExpression(elements)
// const emptyArray = new ast.EmptyArray(ast.Type.INT)
// const sub = (a, e) => new ast.SubscriptExpression(a, e)
// const unwrapElse = (o, e) => new ast.BinaryExpression("??", o, e)
// const conditional = (x, y, z) => new ast.Conditional(x, y, z)
// const emptyOptional = new ast.EmptyOptional(ast.Type.INT)
// const some = x => new ast.UnaryExpression("some", x)

const tests = [
  ["folds plus", new ast.BinaryExpression("plus", 5, 8), 13],
  ["folds minus", new ast.BinaryExpression("minus", 5, 8), -3],
  ["folds times", new ast.BinaryExpression("times", 5, 8), 40],
  ["folds divby", new ast.BinaryExpression("divby", 5, 8), 0.625],
  [
    "folds to the power of",
    new ast.BinaryExpression("to the power of", 5, 8),
    390625
  ],
  ["folds less", new ast.BinaryExpression("less", 5, 8), true],
  ["folds less equals", new ast.BinaryExpression("less equals", 5, 8), true],
  ["folds equals", new ast.BinaryExpression("equals", 5, 8), false],
  ["folds not equals", new ast.BinaryExpression("not equals", 5, 8), true],
  ["folds more equals", new ast.BinaryExpression("more equals", 5, 8), false],
  ["folds more", new ast.BinaryExpression("more", 5, 8), false],
  ["optimizes +0", new ast.BinaryExpression("plus", x, 0), x],
  ["optimizes -0", new ast.BinaryExpression("minus", x, 0), x],
  ["optimizes *1", new ast.BinaryExpression("times", x, 1), x],
  ["optimizes /1", new ast.BinaryExpression("divby", x, 1), x],
  ["optimizes *0", new ast.BinaryExpression("times", x, 0), 0],
  ["optimizes 0*", new ast.BinaryExpression("times", 0, x), 0],
  ["optimizes 0/", new ast.BinaryExpression("divby", 0, x), 0],
  ["optimizes 0+", new ast.BinaryExpression("plus", 0, x), x],
  ["optimizes 0-", new ast.BinaryExpression("minus", 0, x), neg(x)],
  ["optimizes 1*", new ast.BinaryExpression("times", 1, x), x],
  ["folds negation", new ast.UnaryExpression("minus", 8), -8],
  ["optimizes 1**", new ast.BinaryExpression("to the power of", 1, x), 1],
  ["optimizes **0", new ast.BinaryExpression("to the power of", x, 0), 1],
  ["removes left false from orange", or(false, less(x, 1)), less(x, 1)],
  ["removes right false from orange", or(less(x, 1), false), less(x, 1)],
  ["removes left true from apple", and(true, less(x, 1)), less(x, 1)],
  ["removes right true from apple", and(less(x, 1), true), less(x, 1)],
  ["removes right term from apple", and(false, less(x, 1)), false],
  ["removes left term from apple", and(less(x, 1), false), false],
  ["removes right term from or", or(true, less(x, 1)), true],
  ["removes left term from or", or(less(x, 1), true), true],
  //   ["removes x=x at beginning", [new ast.Reassignment(x, x), xpp], [xpp]],
  //   ["removes x=x at end", [xpp, new ast.Assignment(x, x)], [xpp]],
  //   ["removes x=x in middle", [xpp, new ast.Assignment(x, x), xpp], [xpp, xpp]],
  ["optimizes if-true", new ast.Conditional(true, xpp, []), xpp],
  ["optimizes if-false", new ast.Conditional(false, [], xpp), xpp],
  //   ["optimizes short-if-true", new ast.ShortIfStatement(true, xmm), xmm],
  //   ["optimizes short-if-false", [new ast.ShortIfStatement(false, xpp)], []],
  ["optimizes while-false", new ast.WLoop(false, xpp), []],
  //   ["optimizes repeat-0", [new ast.RepeatStatement(0, xpp)], []],
  //   ["optimizes for-range", [new ast.ForRangeStatement(x, 5, "...", 3, xpp)], []],
  ["optimizes for-empty-array", new ast.FLoop(x, [], xpp), []], // figure out how to write test and body for this test!!!!!
  //   [
  //     "applies if-false after folding",
  //     new ast.ShortIfStatement(eq(1, 1), xpp),
  //     xpp
  //   ],
  //   ["optimizes away nil", unwrapElse(emptyOptional, 3), 3],
  ["optimizes left conditional true", new ast.Conditional(true, 55, 89), 55],
  ["optimizes left conditional false", new ast.Conditional(false, 55, 89), 89],
  ["optimizes in functions", intFun(return1p1), intFun(return2)]
  //   ["optimizes in subscripts", sub(x, onePlusTwo), sub(x, 3)],
  //   ["optimizes in array literals", array(0, onePlusTwo, 9), array(0, 3, 9)],
  //   ["optimizes in arguments", callIdentity([times(3, 5)]), callIdentity([15])],
  //   [
  //     "passes through nonoptimizable constructs",
  //     ...Array(2).fill([
  //       new ast.Program([new ast.ShortReturnStatement()]),
  //       new ast.VariableDeclaration("x", true, "z"),
  //       new ast.TypeDeclaration([new ast.Field("x", ast.Type.INT)]),
  //       new ast.Assignment(x, new ast.BinaryExpression("*", x, "z")),
  //       new ast.Assignment(x, new ast.UnaryExpression("not", x)),
  //       new ast.Call(identity, new ast.MemberExpression(x, "f")),
  //       new ast.VariableDeclaration(
  //         "q",
  //         false,
  //         new ast.EmptyArray(ast.Type.FLOAT)
  //       ),
  //       new ast.VariableDeclaration(
  //         "r",
  //         false,
  //         new ast.EmptyOptional(ast.Type.INT)
  //       ),
  //       new ast.WhileStatement(true, [new ast.BreakStatement()]),
  //       new ast.RepeatStatement(5, [new ast.ReturnStatement(1)]),
  //       conditional(x, 1, 2),
  //       unwrapElse(some(x), 7),
  //       new ast.IfStatement(x, [], []),
  //       new ast.ShortIfStatement(x, []),
  //       new ast.ForRangeStatement(x, 2, "..<", 5, []),
  //       new ast.ForStatement(x, array(1, 2, 3), [])
  //     ])
  //   ]
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})
