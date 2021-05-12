import assert from 'assert'
import util from 'util'
import parse from '../src/parser.js'
import analyze from '../src/analyzer.js'
import generate from '../src/generator.js'
import optimize from '../src/optimizer.js'

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, '').trim()
}

const tests = [
  {
    name: 'basic types',
    source: `
    absolute y = light
    ket x = 2.16
    cred a = 300
    cred b = -200
    transmission onlyhope = "Obi-Wan"
    absolute t = light and dark
    absolute s = dark or light
    absolute h = darth y
    absolute i = darth light
    cred j = -a
    `,
    expected: dedent`
      let y_1 = true
      let x_2 = 2.16
      let a_3 = 300
      let b_4 = -200
      let onlyhope_5 = "Obi-Wan"
      let t_6 = false
      let s_7 = true
      let h_8 = !y_1
      let i_9 = false
      let j_10 = -a_3

    `,
  },
  {
    name: 'complex types',
    source: `
    tome<cred> nums = [1,2,3,4,5]
    holocron<cred, transmission> deathStarPlans = <0: "exhaust hole", 1: "proton torpedo">
    emit(nums[2])
    
    `,
    expected: dedent`
    let nums_1 = [1,2,3,4,5]
    let deathStarPlans_2 = { 0: "exhaust hole" , 1: "proton torpedo" }
    console.log(nums_1[2])
    `,
  },
  {
    name: 'designation',
    source: `
    cred x = 5
    x = 55
    `,
    expected: dedent`
    let x_1 = 5
    x_1 = 55
    `,
  },
  {
    name: 'long if statement',
    source: `
    cred x = 5
    should (x onewith 5) {
      emit x
    } else {
      emit "nope"
    }
    `,
    expected: dedent`
    let x_1 = 5
    if (x_1 === 5) {
        console.log(x_1)
    } else {
        console.log("nope")
    }
    `,
  },
  {
    name: 'short if statement',
    source: `
    cred x = 5
    should (x onewith 5) {
      emit x
    }
    `,
    expected: dedent`
    let x_1 = 5
    if (x_1 === 5) {
        console.log(x_1)
    }
    `,
  },
  {
    name: 'while',
    source: `
        cred x = 0
        as (x > 5) {
          emit x
          should (x onewith 2) {
            unleash
          }
        }
      `,
    expected: dedent`
        let x_1 = 0
        while (x_1 > 5) {
          console.log(x_1)
          if (x_1 === 2) {
            break
          }
        }
      `,
  },
  {
    name: 'functions',
    source: `
    order cred square(cred x) { execute x }
    order cred fncall() {emit square(2)}
    `,
    expected: dedent`
    function square_1(x_2) {
      return (x_2)
    }
    function fncall_3() {
      console.log(square_1(2))
    }
    `,
  },
  {
    name: 'for loops',
    source: `
    force (cred i = 0; i < 5; i++) {
        emit i
    }
    i++
    `,
    expected: dedent`
    for (let i_1 = 0; i_1 < 5; i_1++) {
        console.log(i_1)
    }
    i_1++
    `,
  },
  {
    name: 'else if',
    source: `
    cred i = 0
    should (i < 5) {
      emit("hello")
    } else should (i > 0) {
      emit("deathStar")
    } else {
      emit("order66")
    }
    i++
    `,
    expected: dedent`
    let i_1 = 0
    if (i_1 < 5) {
      console.log("hello")
    } else 
    if (i_1 > 0) {
      console.log("deathStar")
    } else {
      console.log("order66")
    }
    i_1++
    `,
  },
  {
    name: 'fibonacci',
    source: `
    order cred fibonacci (cred count) {
      should (count <= 1) {
        execute 1
      }
        execute(fibonacci(count-1) + fibonacci(count-2))
    }
    emit fibonacci(2)
    `,
    expected: dedent`
    function fibonacci_1(count_2) {
      if (count_2 <= 1) {
        return (1)
      }
      return (fibonacci_1(count_2 - 1) + fibonacci_1(count_2 - 2))
    }
    console.log(fibonacci_1(2))
    `,
  },
  {
    name: 'call',
    source: `
    order cred f() {
    }
    order cred g() {
    }
    f()   >< call in a statement
    emit(g())  >< call in an expression  
    `,
    expected: dedent`
    function f_1() {
    }
    function g_2() {
    }
    f_1()
    console.log(g_2())
    `,
  },
]

const badTests = [
  {
    name: 'double declaration',
    source: `
     cred x = 5
     ket x = 2.2
     emit x
     `,
    expected: dedent`
     let x_1 = 5
     let x_1 = 2.2
     console.log(x)
     `,
    errorMessage: 'throws on double declaration',
  },
  {
    name: 'assignment without decl',
    source: `
     x = 5
     `,
    expected: dedent`
     x_1 = 5
     `,
    errorMessage: 'throws on assignment without declaration',
  },
  {
    name: 'use return outside statement',
    source: `
     cred x = 5
     execute x
     `,
    expected: dedent`
     let x_1 = 5
     return (x_1)
     `,
    errorMessage: 'throws on return outside statement',
  },
]

describe('The code generator', () => {
  for (const test of tests) {
    it(`produces expected js output for ${test.name}`, () => {
      const actual = generate(optimize(analyze(parse(test.source))))
      assert.deepStrictEqual(actual, test.expected)
    })
  }
  for (const test of badTests) {
    it(`throws on ${test.name}`, () => {
      assert.throws(
        () => generate(optimize(analyze(parse(test.source)))),
        test.errorMessage
      )
    })
  }
})
