## Welcome to Medley

Medley is a fruitful take on a programming language, with strengths in both enjoyability and ease of use. Medley employs a more natural language approach to programming, all while having a unique theme that makes it both easy and fun to use. The target is for either younger or newer beginning programmers, where a lot of the more complex concepts of programming is simplified by making it similar to English.

To learn more about Medley and explore the different aspects of the language visit [Medley's Github Repository](https://github.com/meganmrichardson/Medley). We hope you enjoy!

### Creators

Medley is created by [@Henno Kublin](https://github.com/hjkublin), [@Amanda Marques](https://github.com/amandacmarques), [@Nick Morgan](https://github.com/nmorgan8), [@Megan Richardson](https://github.com/meganmrichardson), [@Josh Seaman](https://github.com/jseaman1), and [@Tigerlilly Zietz](https://github.com/tigerlillyz).

## Program Examples

#### Hello World

```
juice "Hello, World!" |
```

#### While Loop

```
intberry i is 2 |
whilemelon i less 10 ->
  juice " " plus i |
  i++ |
<-
```

### For Loop

```
formelon intberry i is 10 | i more equals num | i-- ->
  juice "the number is " plus i |
<-
```

#### If Statement

```
ifmelon 1 plus 1 equals 2  ->
  juice "this is factual information" | :: this is a comment
<-
```

#### Fibonacci

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

#### First Factorial

```
blend firstFactorial(intberry num) ->
  ifmelon num equals 0 orange num equals 1 ->
    squeeze 1 |
  <-
  squeeze num times firstFactorial(num minus 1) |
<-
```
