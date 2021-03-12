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
]

// const starWarsLines = [
//     `"'Help me, Obi-Wan Kenobi. You’re my only hope.' — Leia Organa"`,
//     `"'I find your lack of faith disturbing.' — Darth Vader"`,
//     `"'It's the ship that made the Kessel run in less than twelve parsecs. I’ve outrun Imperial starships. Not the local bulk cruisers, mind you. I’m talking about the big Corellian ships, now. She’s fast enough for you, old man.' — Han Solo"`,
//     `"'The Force will be with you. Always.' — Obi-Wan Kenobi"`,
//     `"'Never tell me the odds!' — Han Solo"`,
//     `"'Fear is the path to the dark side. Fear leads to anger; anger leads to hate; hate leads to suffering. I sense much fear in you.' — Yoda"`,
//     `"'I’m just a simple man trying to make my way in the universe.' — Jango Fett"`,
//     `"'So this is how liberty dies. With thunderous applause.' — Padmé Amidala"`,
//     `""`,
// ]

// const droidCommunications = [
//     0x4a656469205363756d,
//     0x4c6f6f6b212041204a65646921,
//     0x4669726521,
//     0x5765206e656564206d6f7265206261636b757021,
//     0x526f67657220726f676572,
//     0x47454e4552414c204b454e4f4249,
//     12345678910,
//     '\\c',
//     66,
//     27000,
// ]

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
