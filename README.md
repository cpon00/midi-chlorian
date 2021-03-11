# Midi-chlorian

<div align="center">
<img src="https://raw.githubusercontent.com/cpon00/midi-chlorian/main/docs/midichlorianlogo.png" />
</div>

### Introduction

This repository is the home of Midi-chlorian, a language inspired by the mind of George Lucas. One of our team members had just finished five hours of reading Star Wars wiki articles, and proposed the name SkywalkerScript. After a bit of deliberation, our team settled on Midi-chlorian, named after the "intelligent microscopic life-forms that lived symbiotically inside the cells of all living things"[[1]](https://starwars.fandom.com/wiki/Midi-chlorian). As such, features of our compiler include:\
</br>


>## Types

|Type in Javascript|Midi-chlorian|           Declaration              |
|:----------------:|:-----------:| :-------------------------------:  |
|      int         |  cred       |            Cred a = 9              |
|      long        |  parsec     |          Parsec b = 900000         |
|      double      |  ket        |            ket c = 0.5             |
|      boolean     |  absolute   |          absolute d = true         |
|      char        | midichlorian|          midichlorian e = "s"      |
|      string      |transmission |    transmission f = "Hello There"  |
|      array       |tome         | tome g = ["Execute","Order","66"]  |
</br>

>## Operational Logic

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
</br>



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
        return i
    } else {
        return j
    }
}
```

>### Midi-Chlorian
```
Order max (Cred i, Cred j) {
    should (i > j) {
        execute i
    } orElse {
        execute j
    }
}
```

## Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
>### Javscript


```JavaScript
const twoSum = (nums, target) => {
    const comp = {};
    for (let i = 0; i<nums.length; i++){
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
    const comp = {}
    Cred i = 0
    for (i until nums.length) {
        should(comp[nums[i]] >=0){
            execute [comp[nums[i]], i]
        }
        comp[target-nums[i]] = i
    }
}
```

