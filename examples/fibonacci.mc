order fibonacci (cred count) {
    should (count <= 1) {
        execute 1
    }
    execute fibonacci(n-1) + fibonacci(n-2)
}