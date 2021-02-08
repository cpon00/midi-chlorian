import ohm from 'ohm-js'

const midiChlorianGrammar = ohm.grammar(String.raw`

Midichlorian {
  Directive    = Order
  Order        = (Transmission)*
  Transmission = "\"" midichlorian* "\""
  midichlorian = "\\n"
               | "\\'"
               | "\\\""
               | "\\\\""
               | "\\u{" hexDigit+ "}"          --hex
               |  ~"\"" ~"\\" any
}

`)

export default function parse(source) {
    const match = midiChlorianGrammar.match(source)
    return match.succeeded()
}
