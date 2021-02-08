import assert from 'assert'
import util from 'util'
import parse from '../src/parser.js'

const starWarsLines = [
    "'Help me, Obi-Wan Kenobi. You’re my only hope.' — Leia Organa",
    "'I find your lack of faith disturbing.' — Darth Vader",
    "'It's the ship that made the Kessel run in less than twelve parsecs. I’ve outrun Imperial starships. Not the local bulk cruisers, mind you. I’m talking about the big Corellian ships, now. She’s fast enough for you, old man.' — Han Solo",
    "'The Force will be with you. Always.' — Obi-Wan Kenobi",
    "'Never tell me the odds!' — Han Solo",
    "'Fear is the path to the dark side. Fear leads to anger; anger leads to hate; hate leads to suffering. I sense much fear in you.' — Yoda",
    "'I’m just a simple man trying to make my way in the universe.' — Jango Fett",
    "'So this is how liberty dies. With thunderous applause.' — Padmé Amidala",
]

const droidCommunications = [
    0x4a656469205363756d,
    0x4c6f6f6b212041204a65646921,
    0x4669726521,
    0x5765206e656564206d6f7265206261636b757021,
    0x526f67657220726f676572,
    0x47454e4552414c204b454e4f4249,
]

describe('Say the line, Luke: ', () => {
    for (const line of starWarsLines) {
        it(`Luke says: ${line}`, () => {
            assert.ok(parse(program))
        })
    }
    for (const line of droidCommunications) {
        it(`I've got a bad feeling about: ${program}`, () => {
            assert.ok(!parse(line))
        })
    }
})
