//import fs from 'fs'
import ohm from 'ohm-js'
//import * as ast from './ast.js'

const midiChlorianGrammar = ohm.grammar(String.raw`Midichlorian {
	Directive = Statement+
    Statement = Declaration | Assignment | Loop | Print | Break | Return
    Declaration = VarDecl | FunDecl
    VarDecl = lifeform IdList "=" ExpList
    FunDecl = order id Params Body
    Params = "(" Param* ")"
    Param = id ":" typename
    typename = cred | parsec | ket | absolute | midichlorian | transmission | tome
    Body = "{" Statement* "}"
    ExpList = Exp ("," Exp)*
    Assignment =  IdList "=" ExpList
    Loop = ForLoop | WhileLoop
    ForLoop = force id in Exp Body
    WhileLoop = while Exp Body
	Print = emit "(" Exp ")"
    Break = unleash
    IdList =  id ("," id)*
    Return = execute Exp
    cred = "cred" ~idchar
    parsec = "parsec" ~idchar
    ket = "ket" ~idchar
    absolute = "absolute" ~idchar
    midichlorian = "midichlorian" ~idchar
    transmission = "transmission" ~idchar
    tome = "tome" ~idchar
    lifeform = "lifeform" ~idchar
    order = "order" ~idchar
    force = "force" ~idchar
    in = "in" ~idchar
    while = "as" ~idchar
    emit = "emit" ~idchar
    unleash = "unleash" ~idchar
    execute = "execute" ~idchar
    keyword = cred | parsec | ket | absolute | midichlorian
    		| transmission | tome
    Exp = Exp ("+" | "<") Term             --add
    	| Term
   	Term = num | id | Call | string
    string = "\"" char* "\""
    char = ~"\"" any
    Call = id "(" ExpList ")"
    num = digit+
    idchar = letter | digit | "~"
    id = ~keyword letter idchar*
    Comment     = ">>" (~"\n" any)* "<<"                 --multiLine
                | "><" (~"\n" any)* ("\n" | end)         --singleLine
}`)

// const astBuilder = midiChlorianGrammar.createSemantics().addOperation('ast', {
//     Directive(body) {
//         return new ast.Directive(body.ast())
//     },
//     Order(body) {
//         return new ast.Order(body.ast())
//     },
//     Transmission(body) {
//         return new ast.Transmission(body.ast())
//     },
//     Midichlorian(body) {
//         return new ast.Midichlorian(body.ast())
//     },
// })

export default function parse(source) {
    const match = midiChlorianGrammar.match(source)
    // if (!match.succeeded()) {
    //     throw new Error(match.message)
    // }
    // return astBuilder(match).ast()
    return match.succeeded()
}
