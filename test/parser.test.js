import assert from 'assert'
import parse from '../src/parser.js'

describe('The parser', () => {
    it('accepts good programs', () => {})
    it('rejects bad programs', () => {})
})

const goodPrograms = [
    `emit("May the force be with you.")`,
    `order cred fibonacci (cred c) {
        cred a = 0
        cred b = 1
        as b < c {
            a = b
            b = a + b
        }
        execute b
    }
    
    fibonacci (c: 20)`,
    `tome<cred> b = [3, 6 ,9]`,
    `cred x = 500`,
    `ket y = 100`,
    `order cred f(cred q, ket p) { p = 20 }
    f(q: 2, p: 5)`,
    `absolute orderSixtySix = light`,
    `cred x = 10`,
    `transmission x = "the force"`,
    `transmission message = "Help me Obi-Wan, you're my only hope"`,
    `ket y = 2.0`,
    `squadron red {
        imprint (cred x, transmission y) {
            x = x
            y = y
        }
    }`,
]

const badPrograms = [`let y = 1`, `pogguers y = true`]

describe('The Parser ', () => {
    for (let program of goodPrograms) {
        it(`accepts the good program starting with ${program.slice(
            0,
            10
        )}`, () => {
            assert.ok(parse(program))
        })
    }
    for (let program of badPrograms) {
        it(`rejects the bad program starting with  ${program.slice(
            0,
            10
        )}`, () => {
            assert.ok(!parse(program))
        })
    }
})
