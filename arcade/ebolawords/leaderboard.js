function applyLeaderboard(leaderboardData, leaderboardDiv) {
  for (element in leaderboardData) { 
    let entry = document.createElement("div")
    entry.innerHTML = `<h1 style="margin-bottom: 0px">${element}: ${leaderboardData[element]}</h1>`
    entry.className = "leaderboardEntry"
    leaderboardDiv.appendChild(entry)
  }
}

async function setUpLeaderboard(leaderboardType) {
  getById("leaderboard").innerHTML = ""
  ApplyMode()
  let leaderboardData
  if (leaderboardType == "normal") {leaderboardData = await getLeaderboard(1)}
  else if (leaderboardType == "triple_ebola") {leaderboardData = await getLeaderboardTripleEbola(1)}
  else if (leaderboardType == "time_attack") {leaderboardData = await getLeaderboardTimeAttack(1)}
  let leaderboardDiv = getById("leaderboard")
  applyLeaderboard(leaderboardData, leaderboardDiv)
  leaderboardPage = 1
}

let leaderboardPage = 1
setUpLeaderboard("normal")

async function loadMoreLeaderboard(addToLeaderboardPage = 1) {
  if ((leaderboardPage + addToLeaderboardPage) < 1) {return}
  leaderboardPage += addToLeaderboardPage
  let leaderboardData = await getLeaderboard(leaderboardPage)
  if (Object.entries(leaderboardData).length == 0) {return}
  
  getByClss("leaderboardEntry").forEach(node => node.remove())
  let leaderboardDiv = getById("leaderboard")
  applyLeaderboard(leaderboardData, leaderboardDiv)
}

addEventListener("pageshow", function() {
  ApplyMode()
})

addEventListener("DOMContentLoaded", function() {
  achi.register("Visit The Leaderboard", "bronze")
})