async function start(difficulty) {
  achi.register("Play Ebola Words", "bronze")

  let gameModesPlayed = localStorage.getItem("gameModes") || []
  if (gameModesPlayed == "") {gameModesPlayed = []}
  else {gameModesPlayed = JSON.parse(gameModesPlayed)}

  if (!(gameModesPlayed.includes(gamemode))) {gameModesPlayed.push(gamemode)}
  if (gameModesPlayed.length == 3) {achi.register("Health Care", "bronze")}
  localStorage.setItem("gameModes", JSON.stringify(gameModesPlayed))

  getById("score").style.display = "block"
  getById("ebola").style.display = "block"
  getById("ebolaCanvas").style.display = "block"
  getById("start").style.display = "block"
  getById("start").innerText = "Loading... This May Take A Few Seconds"

  coolTip()

  getById("start1").style.display = "none"
  getById("start2").style.display = "none"
  getById("start3").style.display = "none"

  let text = []
  do {
    text = await GetText()
    text = text.split(".")
    text[0] += ". "
  }
  while (text[0] == ". ")

  getById("ebolaCanvas").innerHTML = parseText(text[0])
  idList = Array.from(Array(text[0].split(" ").length-1).keys())
  curedList = Array.from(Array(text[0].split(" ").length-1).keys())

  setEbolaInterval(difficulty)
  return text
}

function coolTip() {
  let coolTips = ["Wipeouts Will Cure All Words With Ebola", "Ebola Words Difficulties Change How Fast Words Get Ebola", "Check Out Ebola Words' Achievements On Rotting Pears!", "Periods Can't Get Ebola On Their Own!", "Words With Ebola Will Infect Nearby Words", "Check Out The Leaderboard", "Check Out The How To Play Page"]
  let chosenTip = getRndInteger(0, coolTips.length)
  chosenTip = coolTips[chosenTip]
  getById("coolTip").style.display = "inline"
  getById("coolTip").innerText = chosenTip
}

let id = 1

console.log("v2.0.0")

addEventListener("pageshow", function() {
  ApplyMode()
  GetHighScore()
})