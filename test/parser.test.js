import assert from 'assert'
import util from 'util'
import parse from '../src/parser.js'

const goodPrograms = [
  `cred x = 3 * 4`,
  `cred y = 2**2`,
  `absolute y = a or b`,
  `absolute y = a and b`,
  `emit 5`,
  `emit "Only Siths deal in absolutes"`,
  `emit 2.0`,
  `emit dark`,
  `absolute x = darth x`,
  `holocron<cred, transmission> x = <1:hello>`,

  `emit [3,4,5,6,7]`,

  `force (cred x = 3; x < 3; x++) {
        should(x){
            unleash
        }
        x++
    }`,
  `cred a=4
   cred b=4
   emit (a onewith b)`,
  `emit [3, 2.0, "heck",light]`,
  `function()`,
  `cred i = 4
    execute i`,
  `force (cred i = 0; i < 5; i++) {
        should (i onewith 3) {
            unleash >< break from loop
        }
    }`,

  `order cred max (cred i, cred j) {
        should (i > j) {
            execute i
        }  else {
            execute j
        }
    }`,
  `emit ("hello")`,
  `emit a[12]`,
  `execute`,
  ``,
]

const badPrograms = [
  `.awessfgsdf`,
  `absolute x  5`,
  `"hello`,
  `foce (cred x = 3; x < 3; x ++) {
    should (x) {
        break
    }
    x++
}`,
  `[1,2,3}`,
  `[1,2,3)`,
  `<3, 4)`,
]

describe('The Parser ', () => {
  for (let program of goodPrograms) {
    it(`accepts the good program starting with ${program.slice(0, 10)}`, () => {
      assert.ok(parse(program))
    })
  }
  for (let program of badPrograms) {
    it(`rejects the bad program starting with  ${program.slice(0, 10)}`, () => {
      assert.throws(() => parse(program))
    })
  }
})
