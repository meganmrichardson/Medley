import ohm from "ohm-js";

const medleyGrammar = ohm.grammar(String.raw`
Medley {
  Program    = Statement+
  Statement  = Function                              
             | Assignment
             | Reassign
             | Declaration
             | Conditional
             | WLoop
             | FLoop
             | Print
             | Return
             | Call "|"                              --call
             | Increment "|"                         --increment
             | Comment
             | Array
             | Dictionary
  Assignment = Type id is Exp "|"
  Declaration= Type id "|"
  Reassign   = id (is Exp) "|"
  Array      = berrybasket "~"Type"~" id is "~"LitList"~" "|"
  Dictionary = fruitbasket "~"Type"," Type"~" id is "~"DictList"~" "|"
  DictContent= Literal "," Literal
  Conditional= ifmelon Exp Block (elifmelon Exp Block)*
               (elsemelon Block)?
  WLoop      = whilemelon Exp Block
  FLoop      = formelon ((Assignment)? (Exp "|")? Increment?) Block
  Block      = "->"Statement*"<-"
  Function   = blend id "(" Params ")" Block
  Print      = juice Exp "|"
  Return     = squeeze Exp "|"
  Call       = id "(" Args ")"
  Args       = ListOf<Exp, ",">
  Params     = Type id ("," Type id)*
  LitList    = ListOf<Literal, ";">
  DictList   = ListOf<DictContent, ";">
  Exp        = Exp orange Exp2                          --binary
             | Exp2
  Exp2       = Exp2 apple Exp3                          --binary
             | Exp3
  Exp3       = Exp3 relop Exp4                          --binary
             | Exp4
  Exp4       = Exp4 addop Exp5                          --binary
             | Exp5
  Exp5       = Exp5 mulop Exp6                          --binary
             | Exp6
  Exp6       = Exp7 power Exp6                          --binary
             | Exp7
  Exp7       = prefix Exp8                              --unary
             | Exp8
  Exp8       = Call
             | Literal
             | id
             | "(" Exp ")"                              --parens                         
  Increment  = id ("++" | "--")
  Literal    = strLit
             | intLit
             | floatLit
             | boolLit
  Type       = stringberry | intberry | boolberry | floatberry
  strLit     = "\"" char* "\"" | "\'" char* "\'"
  char       = ~"\\" ~"\"" ~"\n" any
  intLit     = digit+
  floatLit   = digit+ ("." digit+)?
  boolLit    = "organic" | "gmo"
  noneLit    = "none"
  blend      = "blend" ~alnum
  juice      = "juice" ~alnum
  stringberry= "stringberry" ~alnum
  intberry   = "intberry" ~alnum
  floatberry = "floatberry" ~alnum
  boolberry  = "boolberry" ~alnum
  orange     = "orange" ~alnum
  apple      = "apple" ~alnum
  less       = "less" ~alnum
  more       = "more" ~alnum
  lesseq     = "less equals" ~alnum
  moreeq     = "more equals" ~alnum
  equals     = "equals" ~alnum
  times      = "times" ~alnum
  divby      = "divby" ~alnum
  mod        = "mod" ~alnum
  plus       = "plus" ~alnum
  minus      = "minus" ~alnum
  power      = "to the power of" ~alnum
  is         = "is" ~alnum
  berrybasket= "berrybasket" ~alnum
  fruitbasket= "fruitbasket" ~alnum
  ifmelon    = "ifmelon" ~alnum
  elifmelon  = "elifmelon" ~alnum
  elsemelon  = "elsemelon" ~alnum
  whilemelon = "whilemelon" ~alnum
  formelon   = "formelon" ~alnum
  squeeze    = "squeeze" ~alnum
  relop      = "less" | "more" | "less equals" | "more equals" | "equals"
  mulop      = "times" | "divby" | "mod"
  addop      = "plus" | "minus"
  prefix     = "-" | "not"
  keyword    = juice | blend | orange | apple | less | more
             | lesseq | moreeq | equals | times | divby | mod
             | plus | minus | power | is | berrybasket | fruitbasket
             | ifmelon | elifmelon | elsemelon | whilemelon | elsemelon
             | squeeze
  id         = ~keyword letter alnum*
  Comment    = "::" (~"\n" any)* ("\n" | end)
             | ":::" (~"\n" any)* ":::"
}`
);

const astBuilder = medleyGrammar.createSemantics().addOperation("ast", {
  Program(statements) {
    return new ast.Program(statements.ast())
  },
  Declaration(type, identifier) {
    return new ast.Declaration(type.ast(), identifier.ast())
  },
  Function(_blend, identifier, _left, parameters, _right, block) {
    return new ast.Function(identifier.ast(), parameters.ast(), block.ast())
  },
  Assignment(type, target, _equals, source) {
    return new ast.Assignment(type.ast(), target.ast(), source.ast())
  },
  Reassignment(target, _equals, source) {
    return new ast.Reassignment(target.ast(), source.ast())
  },
  Return(_squeeze, expression) {
    return new ast.Return(expression.ast())
  },
  Print(_juice, expression) {
    return new ast.Print(expression.ast())
  },
  id(_first, _rest) {
    return new ast.IdentifierExpression(this.sourceString)
  },
  Block(_left, statements, _right) {
    return statements.ast()
  },
  Array(_berrybasket, _tilde1, type, _tilde2, _equals, _tilde3, LitList, _tilde4) {
    return new ast.Array(type.ast(), LitList.ast())
  },
  Dictionary(_fruitbasket, _tilde1, type, _tilde2, _equals, _tilde3, DictList, _tilde4) {
    return new ast.Dictionary(type.ast(), DictList.ast())
  },
  LitList(first, _semis, rest) {
    return [first.tree(), ...rest.tree()]
  },
  DictList(first, _semis, rest) {
    return [first.tree(), ...rest.tree()]
  },
  DictContent(literal1, _comma, literal2) { // ask toal about this
    return new ast.DictContent(literal1.ast(), literal2.ast())
  },
  WhileLoop(_whilemelon, expression, block) {
    return new ast.WLoop(expression.ast(), block.ast())
  },
  ForLoop(_formelon, assignment, expression, increment, block) { // what should we do with optional params?
    return new ast.FLoop(assignment.ast(), expression.ast(), increment.ast(), block.ast())
  },
  Conditionals() {},
  Expressions() {},
  Call() {},
  Args() {},
  Params() {},
  Increment() {},
  Literal() {},
  Comments() {},
  Type() {},
});

export default function parse(source) {
  const match = medleyGrammar.match(source);
  if (!match.succeeded()) {
    throw new Error(match.message);
  }
  return astBuilder(match).ast();
}


// --> BRAINFUCK EXAMPLE BEGIN
// const grammar = ohm.grammar(String.raw`Brainfuck {
//   Program = instruction+
//   instruction = "[" instruction* "]"                 -- loop
//               | simpleInstruction
//   simpleInstruction =  "," | "." | "+" | "-" | "<" | ">"
//   space := ~instruction any
// }
// ` );
 
// const astBuilder = grammar.createSemantics().addOperation('ast', {
//  Program(body) {
//    return new ast.Program(body.ast());
//  },
//  instruction_loop(_left, tokens, _right) {
//    return new ast.LoopInstruction(tokens.ast());
//  },
//  instruction(token) {
//    return new ast.SimpleInstruction(token.sourceString);
//  },
// });
// <-- BRAINFUCK EXAMPLE END


// <-- AEL EXAMPLE BEGIN
// Statement_variable(_let, id, _eq, expression) {
//   return new ast.Variable(id.sourceString, expression.ast())
// },
// Statement_assign(id, _eq, expression) {
//   return new ast.Assignment(
//     new ast.IdentifierExpression(id.sourceString),
//     expression.ast()
//   )
// },
// Statement_print(_print, expression) {
//   return new ast.PrintStatement(expression.ast())
// },
// Exp_binary(left, op, right) {
//   return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
// },
// Term_binary(left, op, right) {
//   return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
// },
// Factor_unary(op, operand) {
//   return new ast.UnaryExpression(op.sourceString, operand.ast())
// },
// Factor_parens(_open, expression, _close) {
//   return expression.ast()
// },
// num(_whole, _point, _fraction) {
//   return new ast.Literal(Number(this.sourceString))
// },
// id(_first, _rest) {
//   return new ast.IdentifierExpression(this.sourceString)
// },
// <-- AEL EXAMPLE END
