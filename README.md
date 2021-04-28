<div align="center">
<img src="https://raw.githubusercontent.com/cpon00/midi-chlorian/main/docs/midichlorianlogo.png" />
</div>

# Introduction

This repository is the home of Midi-Chlorian, a language inspired by the mind of George Lucas. One of our team members had just finished five hours of reading Star Wars wiki articles, and proposed the name SkywalkerScript. After a bit of deliberation, our team settled on Midi-Chlorian, named after the "intelligent microscopic life-forms that lived symbiotically inside the cells of all living things"[[1]](https://starwars.fandom.com/wiki/Midi-chlorian).

Midi-Chlorian is created by [Carter Pon](https://github.com/cpon00), [Adrian Leung](https://github.com/AdrianLearn), [Isaiah Anyimi](https://github.com/ianyimi), and [Jason Kalili](https://github.com/jkalili).

</br>

# Shortcuts

- [ Types ](#types)
- [ Operational Logic ](#operational-logic)
  - [ Unary Operators](#unary-operators)
- [ Comments ](#comments)
- [ Midi-Chlorian Examples ](#examples)
  - [Print](#print)
  - [Variabale Declaration](#variable-declaration)
  - [If Statements](#if-statements)
  - [For Loop](#for-loop)
  - [While Loop](#while-loop)
- [Example Programs](#example-programs)

# Types

| Type in Javascript | Midi-chlorian |          Declaration           |
| :----------------: | :-----------: | :----------------------------: |
|        int         |     cred      |           Cred a = 9           |
|       double       |      ket      |          ket c = 0.5           |
|      boolean       |   absolute    |       absolute d = true        |
|        char        | midichlorian  |      midichlorian e = 's'      |
|       string       | transmission  | transmission f = 'Hello There' |

<br>

# Complex Types

| Type in Javascript | Midi-chlorian |                       Declaration                       |
| :----------------: | :-----------: | :-----------------------------------------------------: |
|       array        |     tome      | tome\<transmission> g = ['Execute',"Order','Sixty-Six'] |
|     dictionary     |   holocron    |   holocron\<transmission,cred> g = <exe:34, evc: 32>    |

</br>

# Boolean/Absolute Values

| Javascript | Midi-chlorian |
| :--------: | :-----------: |
|    true    |     light     |
|   false    |     dark      |

# Operational Logic

| Javascript | Midi-chlorian |
| :--------: | :-----------: |
|   a + b    |     a + b     |
|   a - b    |     a - b     |
|   a / b    |     a / b     |
|   a \* b   |    a \* b     |
|   a % b    |     a % b     |
|   a == b   |  a oneWith b  |
|   a > b    |     a > b     |
|   a < b    |     a < b     |
|   a <= b   |    a <= b     |
|   a && b   |    a and b    |
|   a or b   |    a or b     |

</br>

### Unary Operators

| Operation         | Compatability |
| ----------------- | ------------- |
| increment: `++`   | `Numbers`     |
| decrement: `--`   | `Numbers`     |
| negative: `-`     | `Numbers`     |
| negation: `darth` | `Booleans`    |

<br/>

# Comments

- Single Line: `>< comment goes here`

<br/>

# Examples

## Print

```
emit ("May the force be with you.")
```

## Variable Declaration

```
cred numberOfSith = 9

```

## If Statements

```
cred x = 5
should (x onewith 5) {
  emit x
} else {
  emit "nope"
}
```

## For Loop

```
force (cred i = 0; i < 5; i++) {
  emit i
}
i++
```

## While Loop

```
cred x = 0
as (x > 5) {
    emit x
    should (x onewith 2) {
      unleash
    }
}

```

# Example Programs

## Fibonacci

> ### Javascript

```Javascript
function fibonacci (n) {
    if (count <= 1) {
        return 1
    }
    return fibonacci(count-1) + fibonacci(count-2)
}
```

> ### Midi-Chlorian

```
order cred fibonacci (cred count) {
  should (count <= 1) {
    execute 1
    }
    execute(fibonacci(count-1) + fibonacci(count-2))
}
```

## Returns the Larger of Two Integers

> ### Javascript

```JavaScript
function max (i, j) {
    if (i > j) {
        return i
    } else {
        return j
    }
}
```

> ### Midi-Chlorian

```
order cred max (cred i, cred j) {
    should (i > j) {
        execute i
    } else {
        execute j
    }
}
```

## Else If

> ### Javascript

```JavaScript
let i = 0
    if (i < 5) {
      console.log("hello")
    } else
    if (i > 0) {
      console.log("deathStar")
    } else {
      console.log("order66")
    }
    i++
```

> ### Midi-Chlorian

```
 cred i = 0
    should (i < 5) {
      emit("hello")
    } else should (i > 0) {
      emit("deathStar")
    } else {
      emit("order66")
    }
    i++
```

## Call

> ### Javascript

```JavaScript
function f() {}
function g() {}
f() //call in a statement
console.log(g()) // call in an expression
```

> ### Midi-Chlorian

```
order cred f() {}
order cred g() {}
f()   >< call in a statement
emit(g())  >< call in an expression
```

## Functions

> ### Javascript

```JavaScript
function square(x) {
    return (x)
    }
function fncall() {
    console.log(square(2))
    }
```

> ### Midi-Chlorian

```
order cred square(cred x) {
    execute x
    }
order cred fncall() {
    emit square(2)
    }
```
