//import fs from 'fs'
import ohm from 'ohm-js'
import * as ast from './ast.js'

const midiChlorianGrammar = ohm.grammar(String.raw`Midichlorian {
    Program   = Directive+
    Directive = Command 
              | Order
              | Designation "=" Exp                --assign
              | emit Exp                           --print
              | WhileStmt
              | Call
              | IfStmt
              | unleash
              | endure
              | execute Exp?                       --return
              | Class
    Command   = lifeform id "=" Exp
    Designation = id "=" Exp
    Params    = "(" ListOf<Param, ","> ")"
    Param     = lifeform id
    Call      = id "(" Args ")"
    Args = ListOf<Arg, ",">
    lifeform = | "cred" | "ket" | "parsec" | "absolute" | "midichlorian" | "transmission"
                        | "tome" "<" lifeform ">"			       		  --arraytype
                        | "holocron" "<" lifeform "," lifeform ">"		      --dicttype
    Order   = "order" lifeform id Params Body
    Class     = "squadron" id "{" (Constructor | Method | Field )* "}"
    Constructor = "imprint" "(" Params? ")" Body
    Method = "method"
    Field = Command
    
    WhileStmt = as Exp Body
    IfStmt    = should Exp Body else (Body | IfStmt)  --long
    Body      = "{" Directive* "}"

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
              | id
    Exp7      = absolute
              | digit+ ("." digit+)?                --numLit
              | letter+
              | transmission+
              | "(" Exp ")"                         --parens
              | "[" ListOf<Exp, ","> "]"            --array
              | "{" ListOf<Exp, ":"> "}"            --dict
    Arg      = id ":" Exp
    relop     = "<=" | "<" | "oneWith" | "!oneWith" | ">=" | ">"
    cred       = digit+
    ket = digit+ ("." digit+)? 
    parsec = digit+ ("." digit+)? 
    transmission = "\"" midichlorian* "\""
    midichlorian      = ~"\n" ~"\r" ~"\\" ~"\"" any
              | "\\" ("n" | "t" | "\"" | "\\")      --escape
              | "\\u{" h h? h? h? h? h? "}"         --codepoint
    h         = hexDigit
    designation       = "designation" ~alnum
    order  = "order" ~alnum
    emit     = "emit" ~alnum
    should        = "should" ~alnum
    else      = "else" ~alnum
    as     = "as" ~alnum
    unleash     = "unleash" ~alnum
    endure  = "endure" ~alnum
    execute    = "execute" ~alnum
    absolute = ("light" | "dark") ~alnum
    keyword   = designation | order | emit | should | else
              | as | execute | unleash | endure | absolute
    id        = ~keyword letter alnum*
    space     += "//" (~"\n" any)* ("\n" | end)   --comment
  }`)
//add some interesting feature beacause we are dynamically typed
//functions as types

const astBuilder = carlosGrammar.createSemantics().addOperation('ast', {
    Program(body) {
        return new ast.Program(body.ast())
    },
    Command(kind, id, _eq, initializer) {
        const [name, readOnly] = [id.sourceString, kind.sourceString == 'const']
        return new ast.VariableDeclaration(name, readOnly, initializer.ast())
    },
    FunDecl(_fun, id, parameters, _colons, returnType, body) {
        const returnTypeTree = returnType.ast()
        return new ast.FunctionDeclaration(
            id.sourceString,
            parameters.ast(),
            returnTypeTree.length === 0 ? null : returnTypeTree[0],
            body.ast()
        )
    },
    Params(_left, bindings, _right) {
        return bindings.asIteration().ast()
    },
    Param(id, _colon, type) {
        return new ast.Parameter(id.sourceString, type.ast())
    },
    TypeExp_array(_left, baseType, _right) {
        return new ast.ArrayType(baseType.ast())
    },
    TypeExp_function(inputType, _arrow, outputType) {
        return new ast.FunctionType(inputType.ast(), outputType.ast())
    },
    TypeExp_named(id) {
        return new ast.TypeName(id.sourceString)
    },
    TypeExps(_left, memberTypeList, _right) {
        return memberTypeList.asIteration().ast()
    },
    Statement_assign(variable, _eq, expression) {
        return new ast.Assignment(variable.ast(), expression.ast())
    },
    Statement_print(_print, expression) {
        return new ast.PrintStatement(expression.ast())
    },
    WhileStmt(_while, test, body) {
        return new ast.WhileStatement(test.ast(), body.ast())
    },
    IfStmt_long(_if, test, consequent, _else, alternative) {
        return new ast.IfStatement(
            test.ast(),
            consequent.ast(),
            alternative.ast()
        )
    },
    unleash(_) {
        return new ast.BreakStatement()
    },
    endure(_) {
        return new ast.ContinueStatement()
    },
    execute(_return, expression) {
        const returnValueTree = expression.ast()
        if (returnValueTree.length === 0) {
            return new ast.ShortReturnStatement()
        }
        return new ast.ReturnStatement(returnValueTree[0])
    },
    Body(_open, body, _close) {
        // This one is fun, don't wrap the statements, just return the list
        return body.ast()
    },
    Exp_or(first, _ors, rest) {
        return new ast.OrExpression([first.ast(), ...rest.ast()])
    },
    Exp_and(first, _ors, rest) {
        return new ast.AndExpression([first.ast(), ...rest.ast()])
    },
    Exp1_binary(left, op, right) {
        return new ast.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp2_binary(left, op, right) {
        return new ast.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp3_binary(left, op, right) {
        return new ast.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp4_binary(left, op, right) {
        return new ast.BinaryExpression(
            op.sourceString,
            left.ast(),
            right.ast()
        )
    },
    Exp4_unary(op, operand) {
        return new ast.UnaryExpression(op.sourceString, operand.ast())
    },
    Exp6_call(callee, _left, args, _right) {
        return new ast.Call(callee.ast(), args.ast())
    },
    Exp6_subscript(array, _left, subscript, _right) {
        return new ast.SubscriptExpression(array.ast(), subscript.ast())
    },
    Exp6_id(id) {
        return new ast.IdentifierExpression(id.sourceString)
    },
    Exp7_array(arrayType, _left, args, _right) {
        return new ast.ArrayLiteral(arrayType.ast(), args.ast())
    },
    Exp7_parens(_open, expression, _close) {
        return expression.ast()
    },
    Args(expressions) {
        return expressions.asIteration().ast()
    },
    true(_) {
        return true
    },
    false(_) {
        return false
    },
    num(_whole, _point, _fraction, _e, _sign, _exponent) {
        return Number(this.sourceString)
    },
    stringlit(_open, chars, _close) {
        return chars.sourceString
    },
})

const astBuilder = midiChlorianGrammar.createSemantics().addOperation('ast', {
    // Program(body) {
    //     return new ast.Program(body.ast())
    // },
    // Directive(body) {
    //     return new ast.Directive(body.ast())
    // },
    // Command(left, op, right) {
    //     return new ast.Command(op.sourceString, left.ast(), right.ast())
    // }
    // Designation(left, op, right) {
    //     return new ast.Designation(op.sourceString, left.ast(), right.ast())
    // },
    // Command(type, id, body) {
    //     return new ast.Command(type.ast(), id.sourceString, body.ast())
    // },
    //  Exp1_binary(left, op, right) {
    //          return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    //      },
    //      Exp2_binary(left, op, right) {
    //          return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    //      },
    //      Exp3_binary(left, op, right) {
    //          return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    //      },
    //      Exp4_binary(left, op, right) {
    //          return new ast.BinaryExpression(op.sourceString, left.ast(), right.ast())
    //      },
    //      Exp4_unary(op, operand) {
    //          return new ast.UnaryExpression(op.sourceString, operand.ast())
    //      },
    //********************  Up to here should be good **************************
    // Statement_assign(variable, _eq, expression) {
    //     return new ast.Assignment(variable.ast(), expression.ast())
    // },
    // FunDecl(_fun, id, parameters, _colons, returnType, body) {
    //         const returnTypeTree = returnType.ast()
    //     return new ast.FunctionDeclaration(
    //         id.sourceString,
    //             parameters.ast(),
    //         returnTypeTree.length === 0 ? null : returnTypeTree[0],
    //         body.ast()
    //         )
    //     },
    //     Params(_left, bindings, _right) {
    //         return bindings.asIteration().ast()
    //     },
    //     Param(id, _colon, type) {
    //         return new ast.Parameter(id.sourceString, type.ast())
    //     },
    //     TypeExp_array(_left, baseType, _right) {
    //         return new ast.ArrayType(baseType.ast())
    //     },
    //     TypeExp_function(inputType, _arrow, outputType) {
    //         return new ast.FunctionType(inputType.ast(), outputType.ast())
    //     },
    //     TypeExp_named(id) {
    //         return new ast.TypeName(id.sourceString)
    //     },
    //     TypeExps(_left, memberTypeList, _right) {
    //         return memberTypeList.asIteration().ast()
    //     },
    //     Statement_print(_print, expression) {
    //         return new ast.PrintStatement(expression.ast())
    //     },
    //     WhileStmt(_while, test, body) {
    //         return new ast.WhileStatement(test.ast(), body.ast())
    //     },
    //     IfStmt_long(_if, test, consequent, _else, alternative) {
    //         return new ast.IfStatement(
    //             test.ast(),
    //             consequent.ast(),
    //             alternative.ast()
    //         )
    //     },
    //     IfStmt_short(_if, test, consequent) {
    //         return new ast.ShortIfStatement(test.ast(), consequent.ast())
    //     },
    //     break(_) {
    //         return new ast.BreakStatement()
    //     },
    //     continue(_) {
    //         return new ast.ContinueStatement()
    //     },
    //     Statement_return(_return, expression) {
    //         const returnValueTree = expression.ast()
    //         if (returnValueTree.length === 0) {
    //             return new ast.ShortReturnStatement()
    //         }
    //         return new ast.ReturnStatement(returnValueTree[0])
    //     },
    //     Block(_open, body, _close) {
    //         // This one is fun, don't wrap the statements, just return the list
    //         return body.ast()
    //     },
    //     Exp_or(first, _ors, rest) {
    //         return new ast.OrExpression([first.ast(), ...rest.ast()])
    //     },
    //     Exp_and(first, _ors, rest) {
    //         return new ast.AndExpression([first.ast(), ...rest.ast()])
    //     },
    //     Exp1_binary(left, op, right) {
    //         return new ast.BinaryExpression(
    //             op.sourceString,
    //             left.ast(),
    //             right.ast()
    //         )
    //     },
    //     Exp2_binary(left, op, right) {
    //         return new ast.BinaryExpression(
    //             op.sourceString,
    //             left.ast(),
    //             right.ast()
    //         )
    //     },
    //     Exp3_binary(left, op, right) {
    //         return new ast.BinaryExpression(
    //             op.sourceString,
    //             left.ast(),
    //             right.ast()
    //         )
    //     },
    //     Exp4_binary(left, op, right) {
    //         return new ast.BinaryExpression(
    //             op.sourceString,
    //             left.ast(),
    //             right.ast()
    //         )
    //     },
    //     Exp4_unary(op, operand) {
    //         return new ast.UnaryExpression(op.sourceString, operand.ast())
    //     },
    //     Exp6_call(callee, _left, args, _right) {
    //         return new ast.Call(callee.ast(), args.ast())
    //     },
    //     Exp6_subscript(array, _left, subscript, _right) {
    //         return new ast.SubscriptExpression(array.ast(), subscript.ast())
    //     },
    //     Exp6_id(id) {
    //         return new ast.IdentifierExpression(id.sourceString)
    //     },
    //     Exp7_arraylit(arrayType, _left, args, _right) {
    //         return new ast.ArrayLiteral(arrayType.ast(), args.ast())
    //     },
    //     Exp7_parens(_open, expression, _close) {
    //         return expression.ast()
    //     },
    //     Args(expressions) {
    //         return expressions.asIteration().ast()
    //     },
    //     true(_) {
    //         return true
    //     },
    //     false(_) {
    //         return false
    //     },
    //     num(_whole, _point, _fraction, _e, _sign, _exponent) {
    //         return Number(this.sourceString)
    //     },
    //     stringlit(_open, chars, _close) {
    //         return chars.sourceString
    //     },
    // })
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
    //     Return(execute, expression, _bar) {
    //         return new ast.Return(expression.ast())
    //     },
    //     VarDecl(kind, id, _eq, initializer) {
    //         const [name, readOnly] = [id.sourceString, kind.sourceString == 'const']
    //         return new ast.VariableDeclaration(name, readOnly, initializer.ast())
    //     },
    //     FunDecl(_fun, id, parameters, _colons, returnType, body) {
    //         const returnTypeTree = returnType.ast()
    //         return new ast.FunctionDeclaration(
    //             id.sourceString,
    //             parameters.ast(),
    //             returnTypeTree.length === 0 ? null : returnTypeTree[0],
    //             body.ast()
    //         )
    //     },
    //     Params(_left, bindings, _right) {
    //         return bindings.asIteration().ast()
    //     },
    //     Param(id, _colon, type) {
    //         return new ast.Parameter(id.sourceString, type.ast())
    //     },
    //     TypeExp_array(_left, baseType, _right) {
    //         return new ast.ArrayType(baseType.ast())
    //     },
    //     TypeExp_function(inputType, _arrow, outputType) {
    //         return new ast.FunctionType(inputType.ast(), outputType.ast())
    //     },
    //     TypeExp_named(id) {
    //         return new ast.TypeName(id.sourceString)
    //     },
    //     TypeExps(_left, memberTypeList, _right) {
    //         return memberTypeList.asIteration().ast()
    //     },
    //     Statement_assign(variable, _eq, expression) {
    //         return new ast.Assignment(variable.ast(), expression.ast())
    //     },
    //     Statement_print(_emit, expression) {
    //         return new ast.PrintStatement(expression.ast())
    //     },
    //     WhileStmt(_while, test, body) {
    //         return new ast.WhileStatement(test.ast(), body.ast())
    //     },
    //     IfStmt_long(_if, test, consequent, _else, alternative) {
    //         return new ast.IfStatement(
    //             test.ast(),
    //             consequent.ast(),
    //             alternative.ast()
    //         )
    //     },
    //     IfStmt_short(_if, test, consequent) {
    //         return new ast.ShortIfStatement(test.ast(), consequent.ast())
    //     },
    //     unleash(_) {
    //         //break
    //         return new ast.BreakStatement()
    //     },
    //     continue(_) {
    //         return new ast.ContinueStatement()
    //     },
    //     Statement_return(_return, expression) {
    //         const returnValueTree = expression.ast()
    //         if (returnValueTree.length === 0) {
    //             return new ast.ShortReturnStatement()
    //         }
    //         return new ast.ReturnStatement(returnValueTree[0])
    //     },
    //     Block(_open, body, _close) {
    //         // This one is fun, don't wrap the statements, just return the list
    //         return body.ast()
    //     },
    //     Exp_or(first, _ors, rest) {
    //         return new ast.OrExpression([first.ast(), ...rest.ast()])
    //     },
    //     Exp_and(first, _ors, rest) {
    //         return new ast.AndExpression([first.ast(), ...rest.ast()])
    //     },
    //     Exp1_binary(left, op, right) {
    //         return new ast.BinaryExpression(
    //             op.sourceString,
    //             left.ast(),
    //             right.ast()
    //         )
    //     },
    //     Exp2_binary(left, op, right) {
    //         return new ast.BinaryExpression(
    //             op.sourceString,
    //             left.ast(),
    //             right.ast()
    //         )
    //     },
    //     Exp3_binary(left, op, right) {
    //         return new ast.BinaryExpression(
    //             op.sourceString,
    //             left.ast(),
    //             right.ast()
    //         )
    //     },
    //     Exp4_binary(left, op, right) {
    //         return new ast.BinaryExpression(
    //             op.sourceString,
    //             left.ast(),
    //             right.ast()
    //         )
    //     },
    //     Exp4_unary(op, operand) {
    //         return new ast.UnaryExpression(op.sourceString, operand.ast())
    //     },
    //     Exp6_call(callee, _left, args, _right) {
    //         return new ast.Call(callee.ast(), args.ast())
    //     },
    //     Exp6_subscript(array, _left, subscript, _right) {
    //         return new ast.SubscriptExpression(array.ast(), subscript.ast())
    //     },
    //     Exp6_id(id) {
    //         return new ast.IdentifierExpression(id.sourceString)
    //     },
    //     Exp7_arraylit(arrayType, _left, args, _right) {
    //         return new ast.ArrayLiteral(arrayType.ast(), args.ast())
    //     },
    //     Exp7_parens(_open, expression, _close) {
    //         return expression.ast()
    //     },
    //     Args(expressions) {
    //         return expressions.asIteration().ast()
    //     },
    //     true(_) {
    //         return true
    //     },
    //     false(_) {
    //         return false
    //     },
    //     num(_whole, _point, _fraction, _e, _sign, _exponent) {
    //         return Number(this.sourceString)
    //     },
    //     stringlit(_open, chars, _close) {
    //         return chars.sourceString
    //     },
    //})
    // export default function parse(source) {
    //     const match = midiChlorianGrammar.match(source)
    //     if (!match.succeeded()) {
    //         throw new Error(match.message)
    //     }
    //     return astBuilder(match).ast()
    //     return match.succeeded()
    // }
})
export default function parse(sourceCode) {
    const match = midiChlorianGrammar.match(sourceCode)
    // if (!match.succeeded()) {
    //     throw new Error(match.message)
    // }
    // return astBuilder(match).ast()
    return match.succeeded()
}
