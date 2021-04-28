import fs from "fs"
import ohm from "ohm-js"
import * as ast from "./ast.js"

const medleyGrammar = ohm.grammar(fs.readFileSync("src/medley.ohm"))

const astBuilder = medleyGrammar.createSemantics().addOperation("ast", {
  Program(statements) {
    return new ast.Program(statements.ast())
  },
  // Statement_assign(assignment, _bar) {
  //   return assignment.ast()
  // },
  Statement_call(call, _bar) {
    return call.ast()
  },
  Statement_increment(increment, _bar) {
    return increment.ast()
  },
  Declaration(type, identifier, _bar) {
    return new ast.Declaration(type.ast(), identifier.sourceString)
  },
  FuncDecl(returnType, _blend, identifier, _left, parameters, _right, block) {
    return new ast.FuncDecl(
      new ast.Function(
        identifier.sourceString,
        parameters.asIteration().ast(),
        returnType.ast()
      ),
      // [0] ?? null
      // returnType.ast(),
      // identifier.sourceString,
      // parameters.ast(),
      block.ast()
    )
  },
  Assignment(type, name, _is, source, _bar) {
    return new ast.Assignment(type.ast(), name.sourceString, source.ast())
  },
  Reassignment(target, _is, source, _bar) {
    return new ast.Reassignment(target.ast(), source.ast())
  },
  Return(_squeeze, expression, _bar) {
    return new ast.Return(expression.ast())
  },
  Print(_juice, expression, _bar) {
    return new ast.Print(expression.ast())
  },
  id(_first, _rest) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  Block(_left, statements, _right) {
    return new ast.Block(statements.ast())
  },
  ArrayType(_berrybasket, _tilde1, type, _tilde2) {
    return new ast.ArrayType(type.ast())
  },
  DictType(_fruitbasket, _tilde1, keytype, _comma, valuetype, _tilde4) {
    return new ast.DictType(keytype.ast(), valuetype.ast())
  },
  LitList(_tilde1, content, _tilde2) {
    return new ast.LiteralList(content.asIteration().ast())
  },
  DictObj(_tildes1, content, _tildes2) {
    return new ast.DictionaryList(content.asIteration().ast())
  },
  DictContent(literal1, _comma, literal2) {
    return new ast.DictContent(literal1.ast(), literal2.ast())
  },
  WLoop(_whilemelon, expression, block) {
    return new ast.WLoop(expression.ast(), block.ast())
  },
  FLoop(
    _formelon,
    assignment,
    _firstBar,
    expression,
    _secondBar,
    increment,
    block
  ) {
    return new ast.FLoop(
      assignment.ast(),
      expression.ast(),
      increment.ast(),
      block.ast()
    )
  },
  Conditional(
    _ifmelon,
    expression1,
    block1,
    _elifmelon,
    expression2,
    block2,
    _elsemelon,
    block3
  ) {
    return new ast.Conditional(
      [expression1.ast(), ...expression2.ast()],
      [block1.ast(), ...block2.ast()],
      [...block3.ast()]
    )
  },
  Call(id, _left, args, _right) {
    return new ast.Call(id.ast(), args.ast())
  },
  Break(_split, _bar) {
    return new ast.Break()
  },
  Args(expressions) {
    return new ast.Arguments(expressions.asIteration().ast())
  },
  // Parameters(params) {
  //   return params.asIteration().ast()
  // },
  Parameter(type, id) {
    return new ast.Parameter(type.ast(), id.ast())
  },
  Increment(id, sign) {
    return new ast.Increment(id.ast(), sign.ast())
  },
  Literal(value) {
    return new ast.Literal(value.ast())
  },
  SimpleType(typename) {
    return typename.sourceString
  },
  strLit(_open, chars, _close) {
    return chars.sourceString
  },
  intLit(_negative, _digits) {
    return Number(this.sourceString)
  },
  floatLit(_negative, _whole, _point, _fraction) {
    return Number(this.sourceString)
  },
  boolLit(truthiness) {
    return Boolean(truthiness.sourceString === "gmo" ? false : true)
  },
  Exp_binary(expression1, _orange, expression2) {
    return new ast.BinaryExpression(
      "orange",
      expression1.ast(),
      expression2.ast()
    )
  },
  Exp2_binary(expression1, _apple, expression2) {
    return new ast.BinaryExpression(
      "apple",
      expression1.ast(),
      expression2.ast()
    )
  },
  Exp3_binary(expression1, relop, expression2) {
    return new ast.BinaryExpression(
      relop.sourceString,
      expression1.ast(),
      expression2.ast()
    )
  },
  Exp4_binary(expression1, addop, expression2) {
    return new ast.BinaryExpression(
      addop.sourceString,
      expression1.ast(),
      expression2.ast()
    )
  },
  Exp5_binary(expression1, mulop, expression2) {
    return new ast.BinaryExpression(
      mulop.sourceString,
      expression1.ast(),
      expression2.ast()
    )
  },
  Exp6_binary(expression1, _power, expression2) {
    return new ast.BinaryExpression(
      "to the power of",
      expression1.ast(),
      expression2.ast()
    )
  },
  Exp7_unary(prefix, expression) {
    return new ast.UnaryExpression(prefix.sourceString, expression.ast())
  },
  Exp8_parens(_open, expression, _close) {
    return expression.ast()
  },
  _terminal() {
    this.sourceString
  }
})

export default function parse(source) {
  const match = medleyGrammar.match(source)
  if (!match.succeeded()) {
    throw new Error(match.message)
  }
  return astBuilder(match).ast()
}
