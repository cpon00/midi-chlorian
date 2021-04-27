order cred fibonacci (cred count) {
  should (count <= 1) {
    execute 1
  }
    execute(fibonacci(count-1) + fibonacci(count-2))
}