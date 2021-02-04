import ohm from "ohm-js";

const medleyGrammar = ohm.grammar(`

`);

export default function parse(source) {
  const match = medleyGrammar.match(source);
  return match.secceeded;
}
