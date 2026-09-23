let host
let users = []
let usersData
let dealerNum
let dealer = 0
let dealerCards
let player
let currentlyShowing = "Player"

function joinSession(username, password, sessionID) {
  return new Promise(async function (resolve, reject) {
    getById("multiplayerMenu").style.display = "none";
    getById("multiplayerJoin").style.display = "block";  

    currentlyShowing = "Player"
    player = username

    try {
      onMessageFrom = getBetNum

      let [hostUsername, assume, usernames] = await joinSessionApi(username, password, sessionID)

      host = hostUsername
      users = usernames

      if (assume != "blackjack") {alert("This Is Not A Blackjack Session"); window.location.reload()}

      users.forEach((item) => {getById("usernames2").innerHTML += `<p id="${item}" style="font-size: 1.3em; margin-top: 0px;">${item}</p>`})

      getById("host").innerText = "Host: " + host

      onNewUser = function(event) {
        let eventData = JSON.parse(event.data)

        users.push(eventData.username)
        getById("usernames2").innerHTML += `<p id="${eventData.username}" style="font-size: 1.3em; margin-top: 0px;">${eventData.username}</p>`
      }

      onUserLeft = function(event) {
         let eventData = JSON.parse(event.data)
         let removedUser = eventData.username
         getById(removedUser).remove()
         removeItem(users, removedUser)
      }

      resolve()
    }
    catch (err) {
      err = err.message

      switch (err) {
        case ("NO USER"): alert("That User Does Not Exist"); break
        case ("INCORRECT PASSWORD"): alert("Wrong Password"); break
        case ("USERNAME AND PASSWORD REQUIRED"): alert("Please Provide Username And Password"); break
        case ("NO SESSION"): alert("No Session"); break
        case ("ACCOUNT BANNED"): alert("Your Account Is Banned, View Your Account Page For More Information"); break
        default: alert("Something Happened")
      }

      window.location.reload()
    }

  })
}

function newSession(username, password) {
  return new Promise(async function (resolve, reject) {
    getById("multiplayerMenu").style.display = "none";  
    getById("multiplayerNewMenu").style.display = "block";  

    try {
      let sessionID = await newSessionApi(username, password, "blackjack")
      getById("status").innerText = "Session Code: " + sessionID

      onUserLeft = function (event) {
        let eventData = JSON.parse(event.data)

        let removedUser = eventData.username
        getById(removedUser).remove()
        removeItem(users, removedUser)

        if (users.length < 1) {
          getById("startMultiplayerGame").style.display = "none"
        }

        if (users.length == 4) {openJoin()}
      }

      onNewUser = function(event) {
        let eventData = JSON.parse(event.data)

        users.push(eventData.username)

        getById("usernames").innerHTML += `<p id="${eventData.username}" style="font-size: 1.3em;  margin-top: 0px;">${eventData.username}</p>`

        getById("startMultiplayerGame").style.display = "inline"

        if (users.length == 5) {alert("Max Users Reached"); endJoiningApi()}
      }

      host = username
      player = host
       
      resolve()
    }
    catch (err) {
      switch (err.message) {
        case ("NO USER"): alert("That User Does Not Exist"); break
        case ("INCORRECT PASSWORD"): alert("Wrong Password"); break
        case ("USERNAME AND PASSWORD REQUIRED"): alert("Please Provide Username And Password"); break
        case ("ACCOUNT BANNED"): alert("Your Account Is Banned, View Your Account Page For More Information"); break
        default: alert("Something Happened")
      }

      window.location.reload()
    }
    
  })
}

function checkIfCanBegin() {
  for (const [key, value] of Object.entries(usersData)) {
    if (!value.ready) {
      return false
    }
  }

  began = true
  return true
}

async function beginRound() {
  getById("multiplayerNewMenu").innerHTML = "<h1>Waiting For Other Players</h1>"

  onMessageFrom = async function(event) {
    let eventData = JSON.parse(event.data)
    let from = eventData.from
    eventData = JSON.parse(eventData.content)

    if (!isNaN(eventData.betAmount) && eventData.betAmount <= usersData[from].score) {
      usersData[from].betAmount = eventData.betAmount
      usersData[from].ready = true
      await handleBeginning()
    }

  }

  onUserLeft = async function(event) {
    let eventData = JSON.parse(event.data)

    let removedUser = eventData.username
    getById(removedUser).remove()

    delete usersData[removedUser]

    let users = await getMembersApi()

    if (users.length < 2) {alert("Not Enough Players To Continue"); window.location.reload()}

    await handleBeginning()
  }

  await broadcast(JSON.stringify({msg: "getBetNum", usersData: usersData}))

  usersData[host].betAmount = handleBettingMulti(usersData[host].score)
  usersData[host].ready = true

  achi.register("Play Blackjack Multiplayer", "bronze")

  await handleBeginning()
}

async function beginGame() {
  await endJoiningApi()
  let members = await getMembersApi()

  if (members.length < 2) {
    alert("Not Enough Players")
    return
  }

  users = members

  usersData = {}

  users.forEach((item) => {
    usersData[item] = {cards: [], cardNum: 0, score: 5, username: item, ready: false, betAmount: undefined}
  })

  beginRound()
}
