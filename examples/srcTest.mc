cred x = 1024
order tome<cred> next(cred n) {
    tome<cred> a = [1, 2, 3]
    a[1] = 100
    execute a
  }
  as x > 3 {
    absolute y = dark and (light or 2 >= x)
    cred x = (0 + x) / 2 ** next[0]
    should dark {
      cred hello = 5
      order cred g() { emit hello execute }
      unleash
    } altshould light {
      next(a : 99)   >< call statement
      cred hello = y >< a different hello
    } elseshould {
    }
    emit x   >< TADA 🥑
  }