# Midi-chlorian

<div align="center">
<img src="https://raw.githubusercontent.com/cpon00/midi-chlorian/main/docs/midichlorian%20title.png" />
</div>

### Introductions

This repository is the home of Midi-chlorian, a compiler inspired by the mind of George Lucas. One of our team members had just finished five hours of reading Star Wars wiki articles, and proposed the name SkywalkerScript. After a bit of deliberation, our team settled on Midi-chlorian, named after the "intelligent microscopic life-forms that lived symbiotically inside the cells of all living things"[[1]](https://starwars.fandom.com/wiki/Midi-chlorian). As such, features of our compiler include:

## Features

### Types

- Cred a = 9; // int
- Parsec b = 900000000; // long
- Ket c = 0.5; // double
- Absolute d = true //Boolean
- Transmission e = "These are not the droids you are looking for." //String
- Tome<Transmission> c = ["Execute" , "Order" , "Sixty" , "Six"] //Array
- Holocron<Cred, Transmission> f = {0: "I have a", 1: "bad", 2: "feeling", 3: "about", 4: "this..."}

### Operational Logic

| Javascript | Midi-chlorian |
| :--------: | :-----------: |
|   a + b    |     a + b     |
|   a - b    |     a - b     |
|   a \_ b   |    a \_ b     |
|   a / b    |     a / b     |
|   a % b    |     a % b     |
|     -a     |    darth a    |
|     !a     |      !a       |
|   a == b   |  a oneWith b  |
|   a != b   | a !oneWith b  |
|   a > b    |     a > b     |
|   a < b    |     a < b     |
|   a <= b   |    a <= b     |
|   a && b   |    a and b    |
|   a or b   |    a or b     |




# Example Programs

## Searches for element in Tome

>### Javascript

```Javascript
function searchTome(a,b){
    counter = 0
    for(int i = 0; i <a.length; i++){
        if(b == a[i]){
            return counter
        }
    }
    return -1
}
searchTome(a,b)
```
>### Midi-Chlorian

```
Order Cred searchTome(Tome a, Cred b){
    Cred counter = 0;
    for(counter until a.length){
        should(b oneWith a[counter]){
            execute counter
        }
    }
    execute -1
}
searchTome(a, b)
```

## Returns the larger of two integers
>### Javascript



```JavaScript
function max (i, j) {
    if (i > j) {
        return i;
    } else {
        return j;
    }
}
```

>### Midi-Chlorian
```
Order max (Cred i, Cred j) {
    should (i > j) {
        execute i;
    } orElse {
        execute j;
    }
}
```

## Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
>### Javscript


```JavaScript
const twoSum = (nums, target) => {
    const comp = {};
    for(let i=0; i<nums.length; i++){
        if(comp[nums[i]] >=0){
            return [comp[nums[i]], i]
        }
        comp[target-nums[i]] = i
    }
}
```

>### Midi-Chlorian

```
const twoSum = (nums, target) => {
    const comp = {};
    Cred i = 0;
    for (i until nums.length) {
        should(comp[nums[i]] >=0){
            execute [comp[nums[i]], i]
        }
        comp[target-nums[i]] = i
    }
}
```

