order cred max (cred i, cred j) {
    should (i > j) {
        execute i
    } else {
        execute j
    }
}