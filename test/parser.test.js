import assert from "assert";
import util from "util";
import parse from "../src/parser.js";

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
];
const goodPrograms = [
  `emit (a)`,
  `cred a = 5
   a = 4`,
  `emit("May the force be with you.")`,
  `order cred fibonacci(cred c) {
        cred a = 0
        cred b = 1
        as b < c {
            a = b
            b = a + b
        }
        execute b
    }

    fibonacci (c:20)`,

  `tome<cred> b = [3,6,9]`,

  `cred x = 500`,
  `ket y = 100`,
  `order cred f(cred q, ket p) { emit("nice") }
    f(q:2, p:5)`,
  `absolute orderSixtySix = light`,
  `cred x = 10`,
  `transmission x = "the force"`,
  `transmission message = "Help me Obi-Wan, you\\'re my only hope"`, //ask about apostrophe as midichlorian
  `ket y = 2.0`,
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
        }  elseshould {
            execute j
        }
    }`,
  `emit ("hello")`,
  `order cred c(cred i) {
    }
    c(i:3)`,
  `emit a[12]`,
  `execute`,
  `cred x = 1024
  order tome<cred> next(cred n) {
      tome<cred> a = [1, 2, 3]
      a[1] = 100
      execute a
    }
    as x > 3 {
      absolute y = dark and (light or 2 >= x)
      cred x = (0 + x) / 2 ** next[0]
      should dark {
        cred hello = 5
        order cred g() { emit hello execute }
        unleash
      } altshould light {
        next(a : 99)   >< call statement
        cred hello = y >< a different hello
      } elseshould {
      }
      emit x   >< TADA 🥑
    }`,
  ``,
];

describe("The Parser ", () => {
  for (let program of goodPrograms) {
    it(`accepts the good program starting with ${program.slice(0, 10)}`, () => {
      //prints ast
      console.log(util.inspect(parse(program), { depth: null }));
      assert.ok(parse(program));
    });
  }
  for (let program of badPrograms) {
    it(`rejects the bad program starting with  ${program.slice(0, 10)}`, () => {
      assert.throws(() => parse(program));
    });
  }
});
