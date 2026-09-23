let idList
let curedList
let ebolaList = []
let score = 0
let wipeouts = 0
let intervals = []
let difficulty
let clearedIntervals = false
let gamemode = "triple"
let expandListWhenScoreIncrease = true
let scoreUpdate = 10

//Expand Function Is Only Used In Time Attack Mode
//It Is A Copy Of The interval1 Code
//It Is Used In Time Attack To Make Ebola On The Page (Without The Interval)
let expandFunction

function setEbolaInterval(difficultyVar) { 
  let infectWordSpeed
  difficulty = difficultyVar
  
  switch (difficultyVar) {
    case (0): infectWordSpeed = 1500; break
    case (1): infectWordSpeed = 1100; break
    case (2): infectWordSpeed = 900; break
  }
  
  //Make Easier On Mobile
  if (window.innerWidth < 500 && difficultyVar == 1) {infectWordSpeed = 1300}

  if (gamemode == "triple") {
    switch (difficultyVar) {
      case (0): infectWordSpeed = 1800; break
      case (1): infectWordSpeed = 1500; break
      case (2): infectWordSpeed = 1200; break
    }
    
    //Make Easier On Mobile
    if (window.innerWidth < 500 && difficultyVar == 1) {infectWordSpeed = 1600}
    if (window.innerWidth < 500 && difficultyVar == 2) {infectWordSpeed = 1200}
  }

  async function interval1Func(checkForGameOver = false) {
    let choice = getRndInteger(0, curedList.length)
    let toReturn = curedList[choice]
    
    //If Chosen Word Is A Period (And There Is Actual Text), Do Not Apply Ebola
    if ((getById(toReturn).innerText === ". " || getById(toReturn).innerText === ".") && idList.length > 1 && !allPeriods()) {return}

    await addEbola(choice, checkForGameOver)

    return toReturn
  }
  
  //See Comment Above
  expandFunction = interval1Func

  if (gamemode == "attack") {
    beginTimeAttack()
    expandListWhenScoreIncrease = false
    return
  }

  let interval1 = setInterval(interval1Func, infectWordSpeed)

  let interval2 = setInterval(() => { 
    let i = 0

    ebolaList.forEach(async (value) => {
      try { 
        //Has To Be Explicitly Converted To A Number For Some Reason
        value = Number(Object.keys(ebolaList[i])[0])

        infectNearbyWord = getRndInteger(1, 10) == 1
        
        if (infectNearbyWord && !clearedIntervals) { 
          let direction = getRndInteger(0, 2) //0 is left, 1 is right
          if (direction == 1) {value += 1}
          else {value -= 1}
          
          //If Chosen Word Does Not Exist, Or Is A Period (And There Is Actual Text), Do Not Apply Ebola
          if (curedList.indexOf(value) == -1 || ((getById(value).innerText === ". " || getById(value).innerText === ".") && idList.length > 1 && !allPeriods())) {
            i++
            return
          }


          await addEbola(curedList.indexOf(value))

          i++
        }
      } catch (error) {}
    })
  }, infectWordSpeed)

  intervals.push(interval1)
  intervals.push(interval2)
}

async function addEbola(choice, checkForGameOver = false) {
  let curedListStr = curedList[choice]
  curedList.splice(choice, 1)
  
  let properties = {}
  properties[`${curedListStr}`] = getRndInteger(1, 4)

  let color

  switch (properties[`${curedListStr}`]){
    case(3): {color = "red"; break}
    case(2): {color = "orange"; break}
    case(1): {color = "green"; break}
  }

  if (gamemode != "triple") {
    properties[`${curedListStr}`] = 1
    color = "red"
  }
  
  getById(curedListStr).style.color = color
  
  ebolaList.push(properties)
  updateEbola()
  if (ebolaList.length >= 10 && !checkForGameOver) {
    await manageGameFinished(score)
  }
}

async function addToScore(amount) {
  score += amount
  getById("score").innerText = "Score: " + score

  if (text[id] === undefined) {
    let newText
    do {
      newText = await GetText()
      newText = newText.split(".")
    }
    while(newText[0] == "")
    
    text = text.concat(newText)
  }

  if (score > 9 && text[id] !== undefined && score % scoreUpdate == 0 && expandListWhenScoreIncrease) {
    updateWords()
  }

  if (score % 30 == 0 && expandListWhenScoreIncrease) {
    if (wipeouts == 0) {
      getById("wipeout").style.display = "block"
    }

    wipeouts++

    if (wipeouts == 5) {achi.register("Wipeout Mania", "silver")}
  }
}

function updateWords() {
  let newtext = text[id]
  newtext += ". "

  parse = parseText(newtext, idList.length)
  newtext = newtext.split(" ")

  newtext = removeItemAll(newtext, "")
  
  getById("ebolaCanvas").innerHTML += parse

  let idLength = idList.length

  idList = idList.concat(Array.from(Array(newtext.length).keys(), mapFn => mapFn + idLength))
  curedList = curedList.concat(Array.from(Array(newtext.length).keys(), mapFn => mapFn + idLength))
  id++
  ApplyMode()
}

function updateEbola() {getById("ebola").innerHTML = "Words With Ebola: " + ebolaList.length}

function cure(id, wipeout) {
  let i = 0
  let index

  ebolaList.forEach(function(a) {
    if (Object.keys(a)[0] == id) {index = i}
    i++
  })

  if (!ebolaList[index]) {return}

  if ((Object.values(ebolaList[index])[0] == 1 || wipeout)) {
    getById(id).style.color = defaultColor

    ebolaList.splice(index, 1)
    curedList.push(id)
    
    addToScore(1)
    updateEbola()
  }
  else {
    let key = Object.keys(ebolaList[index])[0]

    ebolaList[index][key]--

    switch (ebolaList[index][key]) {
      case (2): {getById(id).style.color = "orange"; break}
      case (1): {getById(id).style.color = "green"}
    }
  }
}

function wipeout() {
  if (ebolaList.length <= 8) {achi.register("Barely Made It", "silver")}
  
  let tempEbolaList = ebolaList.slice()

  tempEbolaList.forEach((id) => {cure(Object.keys(id), true)})

  wipeouts--

  if (wipeouts < 1) {
    getById("wipeout").style.display = "none"
  }
}

async function beginTimeAttack() {
  await text
  scoreUpdate = 10
  let length = 20
  let oldLength
  let time = 30
  let pauseTime = false
  let level = 1

  getById("time").style.display = "block"

  let interval = setInterval(function() {if (pauseTime) {return}; time--; getById("time").innerHTML = "Time Left: " + time; if (time < 1) {manageGameFinished(score); clearInterval(interval)}}, 1000)
  
  async function b() {
    while (idList.length < length) {
      pauseTime = true
      if (text[id] === undefined) {
        let newText = await GetText()
        newText = newText.split(".")
        text = text.concat(newText)
      }
      updateWords()
    }

    pauseTime = false

    idList.forEach(function(id) {
      try {
        if (idList.length == oldLength) {return}
         getById(id).addEventListener("click", function() {
           let isEbola = getById(id).style.color == "red"

           if (isEbola && ebolaList.length == 1) {
            scoreUpdate += 5
            length += 20
            time = Math.round(scoreUpdate / 2) + 10

            if (scoreUpdate % 30 == 0) {
              time += 20
            }

            getById("time").innerHTML = "Time Left: " + time

            b() 
          }
        })
      }
      catch (e) {}
    })

    oldLength = idList.length

    for (let i = 0; i < scoreUpdate; i++) {await expandFunction(true)}
  }

  b()
}

function allPeriods() {
  let allPeriods = true

  idList.forEach(function(id) {
    let text = getById(id).innerText
    if (!(text === ". " || text == ".")) {allPeriods = false}
  })

  return allPeriods
}

//joke code, i cannot explain
ErrorEvent.hIV = cure