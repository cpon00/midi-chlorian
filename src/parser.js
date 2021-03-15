//import fs from 'fs'
import ohm from 'ohm-js'
import * as ast from './ast.js'

const midiChlorianGrammar = ohm.grammar(String.raw`
Midichlorian {
  Program         = Directive*
   Directive       = Command                      --vardec
                   | Function
                   | Designation "=" Exp          --assign                
                   | WhileLoop
                   | ForLoop
                   | Call                         --call
                   | IfStmt
                   | Print
                   | Return                       --return
                   | Increment                    --increment
                   | Break                        --break
   Command         = lifeform id "=" Exp
   Designation     = id "=" Exp
   IfStmt          = should Exp Body (altshould Exp Body)*
                     (elseshould Body)?
   WhileLoop       = as Exp Body
   ForLoop         = force Designation ";" Exp ";" Increment Body 
   Body            = "{"Directive*"}"
   Function        = order lifeform id "(" Params ")" Body
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
//add some interesting feature beacause we are dynamically typed
//functions as types
//ASK ABOUT MULTILINE COMMENTS

const astBuilder = midiChlorianGrammar.createSemantics().addOperation('ast', {
    Program(body) {
        return new ast.Program(body.ast())
    },
    Directive_vardec(_lifeform, id, _eq, expression) {
        return new ast.VariableDeclaration(id.sourceString, expression.ast())
    },
    Directive_assign(id, _eq, expression) {
      return new ast.Assignment(id.ast(), expression.ast())
    },
    Directive_call(id, _left, args, _right) {
      return new ast.Call(id.ast(), args.ast())
    },
    Directive_return(_execute, expression) {
      const returnValueTree = expression.ast()
      if (returnValueTree.length === 0) {
        return new ast.ShortReturnStatement()
      }
      return new ast.ReturnStatement(returnValueTree[0])
    },
    Directive_break(_unleash) {
      return new ast.Break()
    },
    Function(_order, _lifeform, id, parameters, _semicolons, body) {
      const returnTypeTree = returnType.ast()
      return new ast.FunctionDeclaration(
        id.sourceString,
        parameters.ast(),
        returnTypeTree.length === 0 ? null : returnTypeTree[0],
        body.ast()
      )
    },
    Directive_increment(id, operation) {
      return new ast.Increment(id.ast(), operation.ast())
    },
    
    WLoop(_as, expression, body) {
      return new ast.WLoop(expression.ast(), body.ast())
    },
    FLoop(
      _force,
      assignment,
      _semicolon,
      expression,
      _semicolon,
      increment,
      body
    ) {
      return new ast.FLoop(
        assignment.ast(),
        expression.ast(),
        increment.ast(),
        body.ast()
      )
    },
    
    IfStmt(
      _should,
      expression1,
      body1,
      _altshould,
      expression2,
      body2,
      _elseshould,
      body3
    ) {
      return new ast.IfStmt(
        expression1.ast(),
        body1.ast(),
        expression2.ast(),
        body2.ast(),
        body3.ast()
      )
    },
    Directive_print(_emit, expression) {
      return new ast.PrintStatement(expression.ast())
    },
    Body(_left, body, _right) {
      return body.ast()
    },
    Params(_left, param, _right) {
      return param.asIteration().ast()
    },
    Param(lifeform, id) {
      return new ast.Parameter(id.sourceString, lifeform.ast())
    },
    
    Args(expressions) {
      return new ast.Arguments(expressions.asIteration().ast())
    },
    Arg(id, _colon, expression) {
      return new ast.Argument(id.sourceString, expression.ast())
    },
    id(_first, _rest) {
        return new ast.IdentifierExpression(this.sourceString)
    },
    
    ArrayType(_tome, _semicolon, lifeform, _semicolon) {
        return new ast.ArrayType(lifeform.ast())
    },
    DictType(_holocron, _tilde1, keytype, _comma, valuetype, _tilde4) {
        return new ast.Dictionary(keytype.ast(), valuetype.ast())
    },
    LitList(_tilde1, content, _tilde2) {
        return new ast.LiteralList(content.asIteration().ast())
    },
    DictObj(_tilde1, content, _tilde2) {
        return new ast.DictionaryList(content.asIteration().ast())
    },
    DictContent(literal, _comma, expression) {
        return new ast.DictContent(literal.sourceString, expression.ast())
    },
    Call(id, _left, args, _right) {
      return new ast.Call(id.ast(), args.ast())
    },
    Args(expressions) {
      return new ast.Arguments(expressions.asIteration().ast())
    },
    Params(type1, id1, _comma, type2, id2) {
      return new ast.Params(type1.ast(), id1.ast(), type2.ast(), id2.ast())
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
    ket(_whole, _point, _fraction) {
      return Number(this.sourceString)
    },
    
    Exp(left, op, right) {
      return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    },
    Exp2(left, op, right) {
      return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    },
    Exp3(left, op, right) {
      return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    },
    Exp4(left, op, right) {
      return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    },
    Exp5(left, op, right) {
      return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    },
    Exp6(left, op, right) {
      return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    },
    Exp7(left, op, right) {
      return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    },

})


export default function parse(sourceCode) {
    const match = midiChlorianGrammar.match(sourceCode)
    if (!match.succeeded()) {
        throw new Error(match.message)
    }
    return astBuilder(match).ast()
    //return match.succeeded()
}
