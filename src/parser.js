//import fs from 'fs'
import ohm from 'ohm-js'
//import * as ast from './ast.js'

const midiChlorianGrammar = ohm.grammar(String.raw`Midichlorian {
    Program   = Directive+
    Directive = Command 
              | Order
              | Designation "=" Exp                         --assign
              | Exp6_call
              | emit Exp                           --print
              | as
              | should
              | unleash
              | endure
              | execute Exp?                         --return
    Command   = lifeform id "=" Exp
    lifeform = | "cred" | "ket" | "parsec" | "absolute" | "midichlorian" | "transmission"
                       | "tome" "<" lifeform ">"			                   		  --arraytype
                       | "holocron" "<" lifeform "," lifeform ">"		   --dicttype
    Order   = order id Params (":" TypeExp)? Block
    Params    = "(" ListOf<Param, ","> ")"
    Param     = id ":" TypeExp
    TypeExp   = "[" TypeExp "]"                     --array
              | TypeExps "->" TypeExp               --function
              | id                                  --named
    TypeExps  = "(" ListOf<TypeExp, ","> ")"
    WhileStmt = as Exp Block
    IfStmt    = should Exp Block else (Block | IfStmt)  --long
              | should Exp Block                        --short
    Block     = "{" Command* "}"
    Exp       = Exp1 ("or" Exp1)+                   --or
              | Exp1 ("and" Exp1)+                   --and
              | Exp1
    Exp1      = Exp2 relop Exp2                     --binary
              | Exp2
    Exp2      = Exp2 ("+" | "-") Exp3               --binary
              | Exp3
    Exp3      = Exp3 ("*"| "/") Exp4                --binary
              | Exp4
    Exp4      = Exp5 "**" Exp4                      --binary
              | Exp5
              | "-" Exp5                            --unary
    Exp5      = Exp6
              | Exp7
    Exp6      = Exp6 "(" Args ")"                   --call
              | Exp6 "[" Exp "]"                    --subscript
              | id                                  --id
    Exp7 = absolute
              | cred
              | transmission
              | TypeExp_array "(" Args ")"          --arraylit
              | "(" Exp ")"                         --parens
    Designation       = Exp6_subscript
              | Exp6_id
    Args      = ListOf<Exp, ",">
    relop     = "<=" | "<" | "==" | "!=" | ">=" | ">"
    cred       = digit+ ("." digit+)? (("E" | "e") ("+" | "-")? digit+)?
    transmission = "\"" midichlorian* "\""
    midichlorian      = ~"\n" ~"\r" ~"\\" ~"\"" any
              | "\\" ("n" | "t" | "\"" | "\\")      --escape
              | "\\u{" h h? h? h? h? h? "}"         --codepoint
    h         = hexDigit
    designation       = "designation" ~alnum
    const     = "const" ~alnum
    order  = "order" ~alnum
    emit     = "emit" ~alnum
    should        = "should" ~alnum
    else      = "else" ~alnum
    as     = "as" ~alnum
    unleash     = "unleash" ~alnum
    endure  = "endure" ~alnum
    execute    = "execute" ~alnum
    absolute = ("light" | "dark") ~alnum
    keyword   = designation | const | order | emit | should | else 
              | as | execute | unleash | endure | absolute
    id        = ~keyword letter alnum*
    space     += "//" (~"\n" any)* ("\n" | end)   --comment
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
