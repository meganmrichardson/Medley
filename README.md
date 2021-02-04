<p align="center">
  <img src="logo.png" width="30%">
</p>

## Introduction

Welcome to Medley! Medley is...

Medley is created by [@Henno Kublin](https://github.com/hjkublin), [@Amanda Marques](https://github.com/amandacmarques), [@Nick Morgan](https://github.com/nmorgan8), [@Megan Richardson](https://github.com/meganmrichardson), [@Josh Seaman](https://github.com/jseaman1), and [@Tigerlilly Zietz](https://github.com/tigerlillyz).

## Features

- Statically Typed

## Types & Variable Declarations

| Keywords in Javascript | Medley       |
| ---------------------- | ------------ |
| function               | blend        |
| return                 | squeeze      |
| if()                   | ifmelon()    |
| else if()              | elifmelon()  |
| else                   | elsemelon    |
| for()                  | formelon()   |
| while()                | whilemelon() |

## Built In Functions

| JavaScript                     | Medley                    |
| ------------------------------ | ------------------------- |
| `console.log(“Hello World!”);` | `juice "Hello World!" \|` |

## Primitive Types

| Types in JavaScript | Types in Medley | Variable Declarations Example        |
| ------------------- | --------------- | ------------------------------------ |
| string              | `stringberry`   | `stringberry title is "medley" \|`   |
| boolean             | `boolberry`     | `boolberry bestLanguagee is true \|` |
| int                 | `intberry`      | `intberry teamSize is 6 \|`          |
| float               | `floatberry`    | `floatberry ourIQ is 156.7 \|`       |

| Booomglean Types In Javascript | Boolean Types In Medley |
| ------------------------------ | ----------------------- |
| `true`                         | `organic`               |
| `false`                        | `gmo`                   |

## Data Types

| Types in Javascript | Types in Medley | Variable Declaration Example in Medley                                             |
| ------------------- | --------------- | ---------------------------------------------------------------------------------- |
| Array               | `berrybasket`   | `berrybasket~stringberry~ s is ~"strawberry" ; "blueberry"~ \|`                     |
| Dictionary          | `fruitbasket`   | `fruitbasket~stringberry, stringberry~ s is ~"key1","value1" ; "key2","value2"~ \|` |

## Binary Operators

| Operation                              | Type Compatability           |
| -------------------------------------- | ---------------------------- |
| add `plus`                             | `Strings, Numbers`           |
| subtract `minus`                       | `Numbers`                    |
| multiply `times`                       | `Numbers`                    |
| divide `divby`                         | `Numbers`                    |
| modulus `mod`                          | `Numbers`                    |
| less than `less`                       | `Numbers`                    |
| greater than `more`                    | `Numbers`                    |
| less than or equal to `less equals`    | `Numbers`                    |
| greater than or equal to `more equals` | `Numbers`                    |
| strictly equal `equals`                | `Strings, Numbers, Booleans` |
| logical AND `apple`                    | `Booleans`                   |
| logical OR `orange`                    | `Booleans`                   |

## Unary Operators

| Operation      | Type Compatability |
| -------------- | ------------------ |
| negative `-`   | `Numbers`          |
| negation `nut` | `Booleans`         |
| increment `++` | `Numbers`          |
| decrement `--` | `Numbers`          |

## Comments

- Single Line: `::`
- Block: `::: :::`

## Medley Examples

### If Statements

```
ifmelon 1 plus 1 equals 2  ->
  juice "this is factual information" |
<-
```

### For Loops

```
formelon intberry i is 10 | i more equals num | i-- ->
  juice "the number is " plus i |
<-
```

### While Loops

```
intberry i is 2 | 
whilemelon i less 10 ->
  juice " " plus i |
  i++ |
<-
```

### Hello World

Javascript:

```
console.log('Hello World');
```

Medley:

```
juice "Hello, World!" |
```

### Fibonacci

Javascript:

```
function fibonacci(num) {
    var num1 = 0;
    var num2 = 1;
    var sum;
    var i = 0;
    for (i = 0; i < num; i++) {
        sum = num1 + num2;
        num1 = num2;
        num2 = sum;
    }
    return num2;
}
```

Medley:

```
blend fibonacci(intberry num) ->
    intberry num1 is 0 |
    intberry num2 is 1 |
    intberry sum |
    intberry i is 0 |
    formelon i is 0 | i less num | i++ ->
        sum is num1 plus num2 |
        num1 is num2 |
        num2 is sum |
    <-
    squeeze num2 |
<-
```

### Function to find if a number is odd

Javascript:

```
def odd_or_even(num):
    if(num % 2 == 0) {
        console.log("The number is even.");
    } else {
        console.log("The number is odd.");
    }
```

Medley:

```
blend oddOrEven(intberry num) ->
    ifmelon num mod 2 equals 0 ->
        juice "The number is even." |
    <- elsemelon ->
        juice "The number is odd." |
    <-
<-
```

### Fahrenheit to celsius

Javascript:

```
function toCelsius(fahrenheit) {
    return (5/9) * (fahrenheit-32);
}
```

Medley:

```
blend toCelsius(floatberry fahrenheit) ->
    squeeze (5 divby 9) times (fahrenheit minus 32) |
<-
```

### First factorial

Javascript:

```
function firstFactorial(x) {
    if (x == 0 || x == 1) {
        return 1;
    }
    return x * firstFactorial(x - 1);
}
```

Medley:

```
blend firstFactorial(intberry num) ->
    ifmelon num equals 0 or num equals 1 ->
        squeeze 1 |
    <-
    squeeze num times firstFactorial(num minus 1) |
<-
```

### Types of Static Semantic Errors

- Incompatible types
- Variable has already been declared
- Use of a non-initialized variable
- Invalid variable type
- Invalid types used with add, sub, mult, div, or mod 
- Incorrect use of unary operator
- Index out of range
- Type mismatch in declaration
- Function missing return statement
- Mismatched function return type
- Incorrect number of function parameters
- Function call does not exist
- Break outside of loops or task
- Unreachable statement
- Types are not compatible
