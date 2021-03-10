import fs from 'fs'
import ohm from 'ohm-js'
import * as ast from './ast.js'

const midiChlorianGrammar = ohm.grammar(String.raw`Midichlorian {
  Directive    = Order                        -- Directive
  Order        = (Transmission)*              -- Order
  Transmission = "\"" Midichlorian* "\""      -- Transmission
  Midichlorian = "\\n"                        -- Midichlorian
               | "\\'"
               | "\\\""
               | "\\\\"
               | "\\u{" hexDigit+ "}"         --hex
               | ~"\"" ~"\\" any
}`)

const astBuilder = midiChlorianGrammar.createSemantics().addOperation('ast', {
    Directive(body) {
        return new ast.Directive(body.ast())
    },
    Order(body) {
        return new ast.Order(body.ast())
    },
    Transmission(body) {
        return new ast.Transmission(body.ast())
    },
    Midichlorian(body) {
        return new ast.Midichlorian(body.ast())
    },
})

export default function parse(source) {
    const match = midiChlorianGrammar.match(source)
    if (!match.succeeded()) {
        throw new Error(match.message)
    }
    return astBuilder(match).ast()
}
