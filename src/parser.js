//import fs from 'fs'
import ohm from 'ohm-js'
import * as ast from './ast.js'

const midiChlorianGrammar = ohm.grammar(String.raw`
Midichlorian {
  Program         = Directive*
  Directive       =  Command                      
                   | Function
                   | Designation                                  
                   | WhileLoop
                   | ForLoop
                   | Call                         
                   | IfStatement
                   | Print
                   | Return                       
                   | Increment                    
                   | Break
                   | Exp                        
  Command         = lifeform id "=" Exp
  Designation     = id "=" Exp
  IfStatement     = should Exp Body (altshould Exp Body)*
                     (elseshould Body)?
  WhileLoop       = as Exp Body
  ForLoop         = force "(" Command "; " Exp "; " Increment ")" Body 
  Body            = "{"Directive*"}"
  Function        = order lifeform id Params Body
  Print           = emit Exp
  Return          = execute Exp?
  Break           = unleash
  Call            = id "(" Args ")"
  Args            = ListOf<Arg, ",">
  Arg             = id ":" Exp
  Params          = "(" ListOf<Param, ","> ")"
  Param           = lifeform id
  LitList         = "<" ListOf<Literal, ","> ">"
  HolocronObj     = "<" ListOf<HolocronContent, ","> ">"
  HolocronContent = Literal ":" Exp
  Exp             = Exp or Exp1                   --binary
                  | Exp1
  Exp1            = Exp1 and Exp2                 --binary
                  | Exp2
  Exp2            = Exp2 relop Exp3               --binary
                  | Exp3
  Exp3            = Exp3 addop Exp4               --binary
                  | Exp4
  Exp4            = Exp4 mulop Exp5               --binary
                  | Exp5
  Exp5            = Exp5 absolutepower Exp6  --binary
                  | Exp6
  Exp6            = prefix Exp7                   --unary
                  | Exp7
  Exp7            = Call
                  | Literal
                  | HolocronObj
                  | LitList
                  | id
                  | "(" Exp ")"                    --parens
                  | "[" ListOf<Exp, ","> "]"       --subscript
  Increment       = id ("++" | "--")
  relop           = "<=" | ">=" | "<" | ">" | "onewith"
  addop           = "+" | "-"
  mulop           = "*" | "/" | "%"
  absolutepower   = "**"
  prefix          = "-" | "darth"
  Literal         = transmissionLit
                  | ketLit
                  | credLit
                  | absoluteLit
  lifeform        = primitive
                  | tome "<"lifeform">"             --arraytype
                  | holocron "<"lifeform", " lifeform ">" --dicttype
  primitive       = transmission
                  | ket
                  | cred
                  | absolute
  transmissionLit = "\'" midichlorian* "\'" | "\"" midichlorian* "\""
  midichlorian    = ~"\n" ~"\r" ~"\\" ~"\'" ~"\""  any
  credLit         = digit+
  ketLit          = digit+ "." digit+
  absoluteLit     = "light" | "dark"
  order           = "order" ~alnum
  emit            = "emit" ~alnum
  execute         = "execute" ~alnum
  unleash         = "unleash" ~alnum
  tome            = "tome" ~alnum
  holocron        = "holocron" ~alnum
  should          = "should" ~alnum
  altshould       = "altshould" ~alnum
  elseshould      = "elseshould" ~alnum
  as              = "as" ~alnum
  force           = "force" ~alnum
  transmission    = "transmission" ~alnum
  ket             = "ket" ~alnum
  cred            = "cred" ~alnum
  absolute        = "absolute" ~alnum
  or              = "or" ~alnum
  and             = "and" ~alnum
  keyword         = order
                  | emit
                  | execute
                  | unleash
                  | tome
                  | holocron
                  | should
                  | altshould
                  | elseshould
                  | as
                  | force
                  | transmission
                  | ket
                  | cred
                  | absolute
  id              = ~keyword letter alnum*
  comment         = "><" (~"\n" any)* ("\n" | end)   --singleLine
  space           += comment
 }`)
//functions as types
//ASK ABOUT MULTILINE COMMENTS
//cant have apostrophe in transmissions
//how to pass literals i.e. "dark", "You are strong in the ways of the dark side."

const astBuilder = midiChlorianGrammar.createSemantics().addOperation('ast', {
    Program(body) {
        return new ast.Program(body.ast())
    },
    Command(_lifeform, id, _eq, expression) {
        return new ast.Command(id.sourceString, expression.ast())
    },
    Designation(id, _eq, expression) {
      return new ast.Designation(id.ast(), expression.ast())
    },
    Call(id, _left, args, _right) {
      return new ast.Call(id.ast(), args.ast())
    },
    Return(_execute, expression) {
      const returnValueTree = expression.ast()
      if (returnValueTree.length === 0) {
        return new ast.ShortReturnStatement()
      }
      return new ast.ReturnStatement(returnValueTree[0])
    },
    Break(_unleash) {
      return new ast.Unleash()
    },

    Function(_order, _lifeform, id, parameters, body) {
      return new ast.Order(
        id.sourceString,
        parameters.ast(),
        body.ast()
      )
    },
    
    WhileLoop(_as, expression, body) {
      return new ast.WhileLoop(expression.ast(), body.ast())
    },
    ForLoop(
      _force,
      _open,
      assignment,
      _semicolon1,
      expression,
      _semicolon2,
      increment,
      _close,
      body
    ) {
      return new ast.ForLoop(
        assignment.ast(),
        expression.ast(),
        increment.ast(),
        body.ast()
      )
    },
    
    IfStatement(
      _should,
      expression1,
      body1,
      _altshould,
      expression2,
      body2,
      _elseshould,
      body3
    ) {
      return new ast.IfStatement(
        expression1.ast(),
        body1.ast(),
        expression2.ast(),
        body2.ast(),
        body3.ast()
      )
    },
    Print(_emit, expression) {
      return new ast.Print(expression.ast())
    },
    Body(_left, body, _right) {
      return body.ast()
    },
    Params(_left, param, _right) {
      return param.asIteration().ast()
    },
    Param(lifeform, id) {
      return new ast.Param(id.sourceString, lifeform.ast())
    },
    Args(expressions) {
      return new ast.Args(expressions.asIteration().ast())
    },
    Arg(id, _colon, expression) {
      return new ast.Arg(id.sourceString, expression.ast())
    },
    id(_first, _rest) {
        return new ast.id(this.sourceString)
    },
    // ArrayType(_tome, _semicolon1, lifeform, _semicolon2) {
    //     return new ast.ArrayType(lifeform.ast())
    // },
    // DictType(_holocron, _leftarrow, keytype, _comma, valuetype, _rightarrow) {
    //     return new ast.Dictionary(keytype.ast(), valuetype.ast())
    // },
    LitList(_leftarrow, content, _rightarrow) {
        return new ast.LitList(content.asIteration().ast())
    },
    HolocronObj(_leftarrow, content, _rightarrow) {
        return new ast.HolocronObj(content.asIteration().ast())
    },
    HolocronContent(literal, _comma, expression) {
        return new ast.HolocronContent(literal.sourceString, expression.ast())
    },
    Call(id, _left, args, _right) {
      return new ast.Call(id.ast(), args.ast())
    },
    Increment(id, sign) {
      return new ast.Increment(id.ast(), sign.ast())
    },
    Literal(type) {
      return new ast.Literal(type.ast())
    },
    primitive(typename) {
      return typename.sourceString
    },
    transmissionLit(_open, midichlorians, _close) {
      return midichlorians.sourceString
    },
    credLit(_digits) {
      return Number(this.sourceString)
    },
    ketLit(_whole, _point, _fraction) {
      return Number(this.sourceString)
    },
    absoluteLit(value) {
      return value.sourceString
    },
    Exp_binary(left, _op, right) {
      return new ast.Exp(left.ast(), right.ast())
    },
    Exp1_binary(left, _op, right) {
      return new ast.Exp1(left.ast(), right.ast())
    },
    Exp2_binary(left, _op, right) {
      return new ast.Exp2(left.ast(), right.ast())
    },
    Exp3_binary(left, _op, right) {
      return new ast.Exp3(left.ast(), right.ast())
    },
    Exp4_binary(left, _op, right) {
      return new ast.Exp4(left.ast(), right.ast())
    },
    Exp5_binary(left, _op, right) {
      return new ast.Exp5(left.ast(), right.ast())
    },
    Exp6_unary(_prefix, expression) {
      return new ast.Exp6(expression.ast())
    },
    Exp7_parens(_open, expression, _close) {
      return expression.ast()
    },
    Exp7_subscript( _left, subscript, _right) {
      return new ast.SubscriptExpression(array.ast(), subscript.ast())
    },
    Exp7(expression) {
      return new ast.Exp7(expression)
    },
    _terminal() {
      this.sourceString
    }
})


export default function parse(sourceCode) {
    const match = midiChlorianGrammar.match(sourceCode)
    if (!match.succeeded()) {
        throw new Error(match.message)
    }
    return astBuilder(match).ast()
}
