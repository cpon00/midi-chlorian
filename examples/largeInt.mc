order max (cred i, cred j) {
    should (i > j) {
        execute i
    } elseshould {
        execute j
    }
}