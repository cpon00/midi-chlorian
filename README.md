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

MAX_SAFE_INT : AnakinsMidichlorianCount: 27700

### Control Flow

> if statement

# Example Programs

## Javascript

Searches for element in Tome

```Javascript
function searchTome(a,b){
    counter = 0
    for(int i = 0; i <a.length; i++){
        if(b == a){
            return counter
        }
    }
    return -1
}
```

## Midi-Chlorian

Searches for element in Tome

```
// Searches for element in Tome
Order Cred searchTome(Tome a, Cred b){
    Cred counter = 0;
    for(counter until a.length){
        should(b oneWith a[counter]){
            execute counter
        }
    }
    execute -1
}
Execute Order searchTome(a, b)
```

## Javascript

Returns the larger of two integers

```JavaScript
function max (i, j) {
    if (i > j) {
        return i;
    } else {
        return j;
    }
}
```

## Midi-Chlorian

Returns the larger of two integers

```
Order max (Cred i, Cred j) {
    should (i > j) {
        execute i;
    } orElse {
        execute j;
    }
}
```

## Javascript

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

```JavaScript
const twoSum = function(nums, target) {
    const comp = {};
    for(let i=0; i<nums.length; i++){
        if(comp[nums[i] ]>=0){
            return [ comp[nums[i] ] , i]
        }
        comp[target-nums[i]] = i
    }
}
```

## Midi-Chlorian

Returns the larger of two integers

```
const twoSum = Order (nums, target) {
    const comp = {};
    Cred i = 0;
    for (i until nums.length) {
        should (comp[nums[i] >=0 ){
            return [ comp[nums[i] ] , i]
        }
        comp[target-nums[i]] = i
    }
}
```

## Javascript

While Loop

```JavaScript
var i = 0;

while (i < 10) {
 i++
 console.log(i)
}
```

## Midi-Chlorian

While Loop

```
Transmission text = ""
Cred i = 0;

force (i < 10) {
 i++
 console.log(i)  //COME UP WITH SOMETHIG  FOR THIS
}
```
