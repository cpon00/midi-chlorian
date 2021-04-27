emit 'hello'
cred a = 1
cred b = -7
absolute c = darth dark
absolute d = dark
cred e = 7 * 5
cred f = 7 / 5
cred g = 7 % 5
cred h = 7 + 5 
cred i = 7 - 5
cred j = 7 ** 5
cred k = 7 k++
cred l = 7  l--
order cred fibonacci (cred count) {
  should (count <= 1) {
    execute 1
  }
    execute fibonacci(count-1) + fibonacci(count-2)
}
order cred square(cred m) { 
  execute m 
}
order cred fncall() {
  emit(square(2))
}

cred n = 70
ket o = 99.99
absolute p = light
transmission q = "You are my only hope"