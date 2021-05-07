import assert from 'assert'
import optimize from '../src/optimizer.js'
import * as ast from '../src/ast.js'
//prettier-ignore
const tests = [
  //   [
  //     `force(cred i = 0; i < 10; i++){
  //     cred x = 1

  //     emit(x+x+x+x+x+x+x+x+x)
  //   }
  // `,
  //   ],
  //   [
  //     `absolute x = light
  //  if(light || x){
  //      emit(x)
  //  }`,
  //   ],
  //   [
  //     `absolute x = light
  //     if(x || light){
  //         emit(x)
  //     }`,
  //   ],
  [
    `cred x = 5
    emit(x+0)`
  ],
  [
    `cred x = 5
     emit(x-0)`
  ],
  //  [
  //    `cred x = 0
  // cred y = 1
  //  cred z = 0
  //  emit(x+y+z)`,
  // ],
  //   [
  //     `if(dark){
  //       emit('error')
  //   }`,
  //   ],
  //   [
  //     `order cred sayHello() {
  //       execute('1')
  //       emit('hello, Coruscant')
  //   }`,
  //   ],
  //   [
  //     `cred y = 15
  //     y = y`,
  //   ],
  //   [
  //     `cred x = 9
  //     emit(x+0)`,
  //   ],
  //   [
  //     `cred x = 0
  //     emit(darth x)`,
  //   ],
  //   [`1**`],
  //   [
  //     `cred x = 5
  //     0**x`,
  //   ],
  //   [
  //     `cred x = 15
  //       emit(x*1)`,
  //   ],
  //   [
  //     `cred y = 15
  //     emit(y/1)`,
  //   ],
  //   [
  //     `force(cred i = 0; i < 0; i++){
  //         emit("I dont like sand")
  //     }`,
  //   ],
  //   [
  //     `absolute x = light
  //       should(x && light)`,
  //   ],
  //   [
  //     `absolute x = light
  //     should(light && x)`,
  //   ],
  //   [`0*`],
  //   [`-0`],
  //   [`+0`],
  //   [`as(dark){
  //     emit('hello')
  //}`]
]

describe('The optimizer', () => {
  for (const [scenario, before, after] of tests) {
    it(`${scenario}`, () => {
      assert.deepStrictEqual(optimize(before), after)
    })
  }
})
