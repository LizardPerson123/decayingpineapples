let currentSection = 0
let subSection = 0
let shortCutChoice
let currentMapChoice
let forkDecision = 0
let inSubSection = false
let mapImage
let bossName

function startCampaign() {
  saveDataDelete()
  gameMode = gameModes.campaign
  difficulty = "easy"
  getById("campaign").style.display = "none"
  startGameLink(true)
}

async function manageEndCampaign(won) {
  window.removeEventListener("beforeunload", addUnload)
  
  if (won===true) {
    // Go To Win Screen
    const action = "intermed"
    if (inSubSection) {
      subSection++
    }
    else {
      currentSection++
    }
    
    saveDataExport(action)
    reload()
    return
  }
  
  // Add 20 XP
  if (won === "veryMuchSo") {
    window.addEventListener("beforeunload", function() {
      achi.laterRegi("The End", "silver")

      if (bossName) {
        handleBossAchi(bossName)
      }
    })
    
    document.body.innerHTML = "Please Wait..."
    await sendXP("veryMuchSo")
  }
  
  saveDataDelete()
  history.replaceState("", "", "?")
  reload()
}

function saveDataExport(action, player=players[0], boss) {
  const saveData = {
    player: player,
    action: action,
    currentSection: currentSection,
    forkDecision: forkDecision,
    subSection: subSection,
    currentMap: currentMap,
    mapImage: mapImage,
    thereIsData: true,
    boss: boss || bossName || 0
  }

  localStorage.setItem("rrSaveData", JSON.stringify(saveData))
}

function saveDataExportFirst() {
  const saveData = {
    currentMap: currentMap,
    mapImage: mapImage,
    thereIsData: false
  }

  localStorage.setItem("rrSaveData", JSON.stringify(saveData))
}

function saveDataImport() {
  let data = JSON.parse(localStorage.getItem("rrSaveData"))
  let skips
  data && data.thereIsData && (skips = data.player.skips)
  
  if (!data) {
    alert("Your Save Data Is Missing. This May Have Happened If You Ran Out Of Skips And Exited Improperly")
    manageEndCampaign(false)
    return
  }

  if (data && !data.thereIsData) {
    currentMap = data.currentMap
    mapImage = data.mapImage
    data = null
  }

  if (!data) {
    const player = new Human("Player")
    player.hp = 8
    player.skips = skips || 2

    window.addEventListener("beforeunload", addUnload)
    saveDataDelete()

    return player
  }
  
  bossName = data.boss
  const playerSaveData = data.player
  const player = new Human()
  player.name = playerSaveData.name
  player.hp = playerSaveData.hp
  player.skips = playerSaveData.skips
  player.originalName = playerSaveData.originalName

  playerSaveData.activeAlcohol.forEach(function(alcohol) {
    alcohol = importAlcohol(alcohol)
    player.activeAlcohol.push(alcohol)

    // Add Alcohol To UI
    getById("statusEffects").innerHTML +=  `<p onclick="displayAlcoholInfo('${alcohol.name.replace(/'/g, "\\'")}', '${alcohol.description.replace(/'/g, "\\'")}', '${alcohol.img}')" id="alcohol${alcohol.id}" style="font-size: 2em; margin-top: 1px; margin-bottom: 0px; cursor: pointer">${alcohol.name}</p>`
  })

  currentMap = data.currentMap
  mapImage = data.mapImage

  if (data.action === "intermed") {
    currentSection = data.currentSection
    subSection = data.subSection
    forkDecision = data.forkDecision

    const result = ["intermed", player]
    return ["special", result]
  }

  if (data.boss) {
    currentSection = data.currentSection
    subSection = data.subSection
    forkDecision = data.forkDecision
    return ["boss", data.boss, player]
  }

  if (Array.isArray(currentMap[data.currentSection]) && currentMap[data.currentSection][data.forkDecision][data.subSection]) {
    currentMapChoice = currentMap[data.currentSection][data.forkDecision][data.subSection]
    inSubSection = true
    currentSection = data.currentSection
    subSection = data.subSection
    forkDecision = data.forkDecision

    subSection === currentMap[data.currentSection][data.forkDecision].length - 1 && (inSubSection = false)
  }
  else {
    subSection = 0
    inSubSection = false
    forkDecision = 0
    currentSection = data.currentSection++
  }

  window.addEventListener("beforeunload", addUnload)
  saveDataDelete()

  return player
}

function addUnload(event) {
  if (players[0].skips < 1) {
    event.preventDefault()
    event.returnValue = ''
    saveDataDelete()
    return
  }

  players[0].skips--
  saveDataExport("", players[0])
}

function saveDataDelete() {
  localStorage.removeItem("rrSaveData")
}

function importAlcohol(alcohol) {
  let realAlcohol
  AlcoholTypes.forEach(function(alcohol2) {
    if (alcohol2.name === alcohol.name || alcohol2.name === alcohol.oname) {
      realAlcohol = new alcohol2()
    }
  })

  AllSuperAlcohols.forEach(function(alcohol2) {
    if (alcohol2.name === alcohol.name || alcohol2.name === alcohol.oname) {
      realAlcohol = new alcohol2()
    }
  })
  
  return realAlcohol
}

function continueCampaign() {
  gameMode = gameModes.campaign
  startGameLink()
}

function handleSpecialAction(action) {
  switch (action[0]) {
    case ("intermed"): showWinScreen(action[1]); break
  }
}

async function showWinScreen(player) {
  showButtonsDiv = false

  if (currentMap[currentSection] === undefined) {
    alert("You Won Campaign")
    await manageEndCampaign("veryMuchSo")
  }

  const extraHeart = {
    img: "life.png",
    description: "",
    name: "Extra Heart"
  }

  const extraAlcohol = {
    img: "alcohol.png",
    description: "",
    name: "Extra Alcohol"
  }

  const extraSkip = {
    img: "skip.png",
    description: "",
    name: "Extra Skip"
  }

  gameAlcohol = [extraHeart, extraAlcohol, extraSkip]

  getById("centerThing").style.gridArea = "1/1/5/6"
  getById("op2Img").style.width = "50%"
  getById("op3Img").style.width = "50%"
  getById("op1Img").style.width = "50%"
  getById("wheel").src = mapImage
  getById("eventHeader").innerHTML = "You Won"
  getById("event").innerHTML = "Choose A Reward"
  getById("chooseAlcohol").innerHTML = "Choose A Reward"
  getById("chooseAlcoholMobileUIText").innerHTML = "Choose A Reward"
  getById("buttonsdiv").style.display = "none"

  dontTurnWheel = true

  if (currentSection === currentMap.length - 1) {
    getById("firstAlcohol").style.display = "none"
    getById("wheelDiv").style.display = "flex"
    getById("chooseAlcoholMobileUI").style.display = "none"
    getById("game").style.display = gameDisplay

    players.push(new Human())

    player.hp += 2
    player.skips = 0

    await displayMessageAndWaitForConfirmation("Next Round Is A Boss", "Ok")
    await displayMessageAndWaitForConfirmation("You Have Had 2 Hearts Added", "Ok")

    const boss = new bosses[getRndInt(0, bosses.length)]()
    
    announceBoss = await bossManager(boss)

    const whatToDo = await nextRoundOrExit()
    const action = "nextRound"

    if (whatToDo === "next") {
      saveDataExport(action, player, boss.name)
      reload()
    }

    if (whatToDo === "leave") {
      saveDataExport(action, player, boss.name)
      exitGame()
    }

    return
  }

  const choice = await firstAlcohol()

  if (choice[0] === extraHeart) {
    player.hp++
  }

  if (choice[0] === extraAlcohol) {
    player.activeAlcohol.push(new AllSuperAlcohols[getRndInt(0, AllSuperAlcohols.length)]())
  }

  if (choice[0] === extraSkip) {
    player.skips++
  }

  await manageShortcut()

  const action = "nextRound"
  
  const whatToDo = await nextRoundOrExit()

  if (whatToDo === "next") {
    saveDataExport(action, player)
    reload()
  }

  if (whatToDo === "leave") {
    saveDataExport(action, player)
    exitGame()
  }
}

function chooseBetweenTwo(msg, buttonOneMsg, buttonTwoMsg) {
  return new Promise(function(resolve) {
    getById("event").style.display = "none"
    getById("eventHeader").innerHTML = msg
  
    // Repurpose Shoot Someone And Alcohol Button For Next Or Leave
    getById("buttons").style.display = "flex"
    getById("shootButton").innerHTML = buttonOneMsg
    getById("alcoholButton").innerHTML = buttonTwoMsg

    getById("shootButton").addEventListener("click", function() {
      resolve("one")
    })

    getById("alcoholButton").addEventListener("click", function() {
      resolve("two")
    })
  })
}

async function nextRoundOrExit() {
  const msg = "Choose An Action"
  const option1 = "Next Round"
  const option2 = "Save And Exit"
  const action = await chooseBetweenTwo(msg, option1, option2)
  
  if (action === "one") {
    return "next"
  }

  return "leave"
}

async function skipRound() {
  if (players[0].skips < 1) {
    await specialAlert("You Have No Skips")
    return
  }

  if (!confirm("Are You Sure You Want To Use Your Skip? You Have " + players[0].skips + " Skip(s) Left")) {
    return
  }
  
  players[0].skips--
  saveDataExport()
  window.removeEventListener("beforeunload", addUnload)
  reload()
}

async function campaignBegin() {
  showButtonsDiv = false
  const confirmMsg = "OK"
  const messages = [
    "This Is Your Map",
    "When There Is A Fork In The Road You Will Need To Choose Which Path To Take",
    "Battles Will Start Out Easy, But Will Get More Difficult",
    "The Final Battle Will Be A Boss Fight",
    "If You Leave During A Round, Then A Skip Will Automatically Be Used",
    "If You Have No Skips, You Will Lose Your Save Data"
  ]

  for (let i = 0; i <= messages.length - 1; i++) {
    await displayMessageAndWaitForConfirmation(messages[i], confirmMsg)
  }
}

async function bossManager(boss) {
  const messages = boss.messages
  const confirmMsg = "Ok"

  for (let i = 0; i <= messages.length - 1; i++) {
    await displayMessageAndWaitForConfirmation(messages[i], confirmMsg)
  }
}

async function displayMessageAndWaitForConfirmation(msg, buttonMessage) {
  return new Promise(function(resolve) {
    getById("buttons").style.display = "flex"
    getById("alcoholButton").style.display = "none"
    getById("event").style.display = "none"
    getById("eventHeader").innerHTML = msg
    getById("shootButton").style.display = "inline"
    getById("shootButton").innerHTML = buttonMessage

    getById("shootButton").addEventListener("click", function() {
      getById("buttons").style.display = "none"
      getById("alcoholButton").style.display = "inline"
      getById("eventHeader").innerHTML = ""
      resolve()
    })
  })
}

// Very Technical Info, Does Not Need To Be Edited
const point = "point"
const map1 = [point, point, [[point, point, point, point], [point, point]], point]
const map2 = [point, point, point, point, point, point, point]
const map3 = [point, [[point, point], [point]], point, [[point], [point]], point, point]
const map4 = [point, point, point, [[point, point, point], [point, point]], point]
const map5 = [point, point, point, point, point, point, point]
const map6 = [point, point, point, point, [[point, point], [point]], point]
const maps = [map1, map2, map3, map4, map5, map6]
let currentMap

function segmentFind(map, segment=0) {
  if (map[segment] === undefined) {
    return
  }

  if (Array.isArray(map[segment])) {
    segmentFind(map[segment])
  }
  else {
    alert(map[segment])
  }

  segmentFind(map, ++segment)
}

async function manageShortcut() {
  if (Array.isArray(currentMap[currentSection]) && subSection < 1) {
    return shortcutUI()
  }

  return null
}

async function shortcutUI() {
  const msg = "Fork In The Road"
  const option1 = "Silver Path"
  const option2 = "Golden Path"
  const action = await chooseBetweenTwo(msg, option1, option2)
  
  if (action === "one") {
    forkDecision = 0
    return 0
  }
  
  forkDecision = 1
  return 1
}

function createCPUSCampaign() {
  const level1CPUS = [0, 1]
  const level2CPUS = [2, 3, 4]

  let numberOfPlayers

  if (level1CPUS.includes(currentSection)) {
    numberOfPlayers = 1
  }
  else if (level2CPUS.includes(currentSection)) {
    numberOfPlayers = 2
  }
  else {
    numberOfPlayers = 3
  }

  for (let i = 1; i <= numberOfPlayers; i++) {
    const chosenPlayer = cpus[getRndInt(0, cpus.length)]
    removeItem(cpus, chosenPlayer)
    players.push(new chosenPlayer())
  }
}

function generateMap() {
  const mapNumber = getRndInt(0, 6)
  currentMap = maps[mapNumber]
  mapImage = `images/maps/m${mapNumber + 1}.png`
}

function findBoss(name) {
  let bossR
  bosses.forEach(function(boss) {
    if (boss.name === name || boss.upname === name) {
      bossR = boss
    }
  })

  return bossR
}

function bossHandle(name, player) {
  let boss = findBoss(name)
  players.push(player)

  let bossObject = new boss()
  players.push(bossObject)

  bossName = bossObject.name
  
  let numberOfPlayers = bossObject.enemyNumber

  for (let i = 1; i <= numberOfPlayers; i++) {
    const chosenPlayer = bossObject.cpus[getRndInt(0, bossObject.cpus.length)]
    removeItem(bossObject.cpus, chosenPlayer)
    players.push(new chosenPlayer())
  }
}

function handleBossAchi(bossName) {
  let bossData = localStorage.getItem("rrBossData")

  if (bossData) {
    bossData = JSON.parse(bossData)
  }
  else {
    bossData = []
  }

  if (!bossData.includes(bossName)) {
    bossData.push(bossName)
  }

  if (bossData.length === bosses.length) {
    achi.laterRegi("Mass Murderer", "gold")
  }

  localStorage.setItem("rrBossData", JSON.stringify(bossData))
}