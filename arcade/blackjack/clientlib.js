let resolveShouldContinue
let plebNum = 0
let haveShownPlayerCards = false
let shownDealerNum = false

//When Host Asks For Bet Number
function getBetNum(event) {
  let eventData = JSON.parse(event.data)

  if (eventData.from == host) {
    achi.register("Play Blackjack Multiplayer", "bronze")
    getById("chatButton").style.display = "none"
    getById("outer").style.display = "grid"
    getById("didBeat").style.display = "none"
    getById("continueButtons").style.display = "none"
    getById("userList").innerHTML = ""

    eventData = JSON.parse(eventData.content)
    usersData = eventData.usersData

    let betAmount = handleBettingMulti(usersData[player].score)
    sendTo(host, JSON.stringify({"betAmount": betAmount}))

    getById("currentlyPlaying").style.display = "block"
    getById("playerNum").style.display = "none"
    getById("dealerNum").style.display = "none"
    getById("currentlyPlaying").innerHTML = "Waiting For Other Players..."
    getById("multiplayerJoin").innerHTML = "<h1>Waiting For Other Players</h1>"

      onMessageFrom = async function(event, from) {
        let eventData = JSON.parse(event.data)

        if (JSON.parse(eventData.content).msg == "message") {
          chat.register(from, JSON.parse(eventData.content).chat)
        }
        else if (eventData.from == host) {
          eventData = JSON.parse(eventData.content)

          if (eventData.msg == "dealer") {shownDealerNum = event}
          else {getById("chatButton").style.display = "inline-block"}

          if (eventData.msg == "getCard") {
            if (shownDealerNum) {await dealerNumShow(shownDealerNum); shownDealerNum = false}

            await waitForCardsBeingShown()

            getById("currentlyPlaying").innerHTML = `Currently Playing: ${eventData.username}`
            currentSwitch = "player"
            getById("switchDealerPlayer").innerText = "Switch to Dealer"
            getById("outerDealer").style.display = "none"
            getById("outer" + currentlyShowing).style.display = "none"
            getById("outer" + eventData.username).style.display = "block"
            currentlyShowing = eventData.username

            if (eventData.username == player) {
              let hitButton = getById("hitButton")
              hitButton.style.display = "inline"
              hitButton.innerText = "Hit"
              hitButton.style.marginBottom = "10px"
              hitButton.setAttribute("onclick", "sendTo(host, 'hit')")

              let stayButton = getById("stayButton")
              stayButton.style.display = "inline"
              stayButton.style.marginBottom = "10px"
              stayButton.setAttribute("onclick", "sendTo(host, 'stay'); getById('stayButton').style.display = 'None'; getById('hitButton').style.display = 'None';")
            }
          }

          else if (eventData.msg == "card") {
            showCard(`${eventData.username}cards`, eventData.card)

            if (eventData.card[1] > 10) {eventData.card[1] = 10}

            if (eventData.username == player) {
              plebNum += eventData.card[1]
              getById("playerNum").innerText = `Your Number: ${plebNum}`
            }
          }
          
          else if (eventData.msg == "bust") {
            getById(`${eventData.username}cards`).innerHTML = "<h1>BUST</h1>"

            if (eventData.username == player) {
              getById('stayButton').style.display = "None"
              getById("hitButton").style.display = "None"
            }
          }

          else if (eventData.msg == "endGame") {
            firstGetCard = true
            getById("chatButton").style.display = "none"
            getById("outer").style.display = "none"
            getById("didBeat").style.display = "block"
            getById("dealerNum").innerHTML = "Dealer Number: " + eventData.dealer
            plebNum = 0

            if (eventData.wonGame[player]) {
              getById("currentlyPlaying").innerHTML = "You Beat The Dealer"
            }
            else {
              getById("currentlyPlaying").innerHTML = "You Did Not Beat The Dealer"
            }

            let members = await getMembersApi()
            for (const [key, value] of Object.entries(usersData)) {
              try {
                if (!members.includes(key)) {continue}
                getById(`outer${key}`).remove()
                getById("userList").innerHTML += "<p style='font-size: 2em'>" + key + "'s Tokens: " + eventData.tokens[key]
              }
              catch(e) {
                console.error(`ERROR (CONTINUING): ${e}`)
              }
            }

            onMessageFrom = getBetNum
          }
          
        }
      }
      
    }
}

function showPlayersCards() {
  let i = 1
  getById("outerDealer").style.display = "none"
  getById("dealerCards").innerHTML = ""
  currentSwitch = "player"
  getById("switchDealerPlayer").innerText = "Switch to Dealer"

  users.forEach(function (item) {
    getById("outerCards").innerHTML += `
     <div style="display: none; flex-direction: column; justify-content: center; width: 90%; height: inherit;" id="outer${item}">
      <div id="${item}cards" class="cardDeck" style="display: flex; align-items: center; height: inherit;">
      </div>
     </div>
    `

    i++
  })

  getById("outer" + host).style.display = "block"
  currentlyShowing = host
  haveShownPlayerCards = true
}

//Check If Bet Number Has Been Given By All Players, And, If So: Generate And Give Out Dealer Card
async function handleBeginning() {
  if (checkIfCanBegin()) {
    getById("chatButton").style.display = "inline-block"
    getById("playerNum").style.display = "block"
    let card = getBljCard()
    dealer += card[0][1]

    users = await getMembersApi()
    getById("multiplayerNewMenu").style.display = "none"
    getById("outer").style.display = "grid"
    getById("outerPlayer").style.display = "none"

    showPlayersCards()

    //This Has To Go After
    showCard("dealerCards", card[1])

    getById("dealerNum").style.display = "block"
    getById("dealerNum").innerHTML = `Dealer Number: ${card[0][1]}`

    removeItem(users, host)
    users = [host].concat(users)

    for (const [key, value] of Object.entries(usersData)) {
      for (let i = 0; i < 2; i++ ) {
        let card = getBljCard()

        value.cards.push(card[1])

        value.cardNum += card[0][1]

        if (key == player) {
          getById("playerNum").innerText = `Your Number: ${value.cardNum}`
        }

        showCard(`${key}cards`, card[1])
      } 
    }

    await broadcast(JSON.stringify({msg: "dealer", card: card, usersData: usersData}))

    onUserLeft = async function(event) {
      let eventData = JSON.parse(event.data)

      playerCardDeck = getById(`outer${eventData.username}`)

      if (playerCardDeck) {
        playerCardDeck.remove()
      }

      delete usersData[eventData.username]

      if (eventData.username == keyVar) {
        resolveFunc()
      }

      let usernames = await getMembersApi()

      if (usernames.length < 2) {
        alert("Not Enough Players To Continue")

        window.location.reload()
      }
    }

    getById("currentlyPlaying").style.display = "block"

    for (const [key, value] of Object.entries(usersData)) {
      if (usersData[key]) {
        currentSwitch = "player"
        getById("switchDealerPlayer").innerText = "Switch to Dealer"
        getById("currentlyPlaying").innerHTML = `Currently Playing: ${key}`
        getById("outer" + currentlyShowing).style.display = "none"
        getById("outerDealer").style.display = "none"
        getById("outer" + key).style.display = "block"
        currentlyShowing = key
        
        await broadcast(JSON.stringify({msg: "getCard", username: key}))

        if (key == host) {
          await hostCard(key, value)
        }
        else {
          await clientCard(key, value)
        }
      }
    }

    card = getBljCard()[0]
    dealer += card[1]

    if (dealer < 16) {
      card = getBljCard()[0]
      dealer += card[1]
    }

    let wonGame = {}

    for (const [key, value] of Object.entries(usersData)) {
      value.cards.forEach(function (item) {
        if (item[1] == 1 && value.cardNum + 10 <= 21) {
          item[1] = 11
          value.cardNum += 10
        }
      })

      if ((value.cardNum >= dealer && value.cardNum <= 21) || (dealer > 21 && value.cardNum <= 21)) {
        wonGame[key] = true
        value.score += value.betAmount
      }
      else {
        wonGame[key] = false
        value.score -= value.betAmount
      }
    }
    
    let tokens = {}
    let members = await getMembersApi()

    for (const [key, value] of Object.entries(usersData)) {
      if (!members.includes(key)) {continue}

      getById("userList").innerHTML += "<p style='font-size: 2em'>" + key + "'s Tokens: " + value.score
      tokens[key] = value.score
    }

    broadcast(JSON.stringify({msg: "endGame", wonGame: wonGame, tokens: tokens, dealer: dealer}))
    
    getById("outer").style.display = "none"
    getById("didBeat").style.display = "block"
    getById("dealerNum").innerHTML = "Dealer Number: " + dealer
    getById("currentlyPlaying").innerText = "You Did Not Beat The Dealer"

    if (wonGame[host]) {
      getById("currentlyPlaying").innerText = "You Beat The Dealer"
    }
    
    restartGame()
  }
}

let keyVar
let valueVar
let resolveFunc

function clientCard(key, value) {
  return new Promise(function(resolve, reject) {
    keyVar = key
    valueVar = value
    resolveFunc = resolve

    onMessageFrom = async function(event, from) {
      if (checkIfChatMsg(event, from)) {return}

      let eventData = JSON.parse(event.data)
      if (eventData.from == key) {
        let content = eventData.content

        if (content == "hit") {
          let card = getBljCard()

          value.cards.push(card[1])

          value.cardNum += card[0][1]

          if (value.cardNum > 21) {
            await broadcast(JSON.stringify({msg: "bust", username: key}))
            getById(`${key}cards`).innerHTML = "<h1>BUST</h1>"
            onMessageFrom = function(event, from) {checkIfChatMsg(event, from)}
            setTimeout(resolve, 3000)
          }
          else {
            showCard(`${key}cards`, card[1])
            await broadcast(JSON.stringify({msg: "card", username: key, card: card[1]}))
          }
        }
        else {
          onMessageFrom = function(event, from) {checkIfChatMsg(event, from)}
          resolve()
        }
      }
    }
  })
}

async function hostCard(key, value) {
  return new Promise(function (resolve, reject) {
    onMessageFrom = function(event, from) {checkIfChatMsg(event, from)}

    resolveFunc = resolve
    keyVar = key
    valueVar = value

    let hitButton = getById("hitButton")
    hitButton.style.display = "inline"
    hitButton.innerText = "Hit"
    hitButton.style.marginBottom = "10px"
    hitButton.setAttribute("onclick", "hostHitButtonManage(keyVar, valueVar)")

    let stayButton = getById("stayButton")
    stayButton.style.display = "inline"
    stayButton.style.marginBottom = "10px"
    stayButton.setAttribute("onclick", "getById('stayButton').style.display = 'None'; getById('hitButton').style.display = 'None'; resolveFunc()")
  })
}

async function hostHitButtonManage(key, value) {
  let card = getBljCard()

  value.cards.push(card[1])

  value.cardNum += card[0][1]

  getById("playerNum").innerText = `Your Number: ${usersData[key].cardNum}`

  if (value.cardNum > 21) {
    await broadcast(JSON.stringify({msg: "bust", username: key}))

    getById(`${key}cards`).innerHTML = "<h1>BUST</h1>"

    getById('stayButton').style.display = 'None'
    getById("hitButton").style.display = "None"
    
    setTimeout(resolveFunc, 3000)
  }
  else {
    showCard(`${key}cards`, card[1])
    await broadcast(JSON.stringify({msg: "card", username: key, card: card[1]}))
  }
}

function getBljCard() {
  let card = generateCard()

  //Unlink from card
  let originalCard = [card[0], card[1]]

  if (card[1] > 10) {
    card[1] = 10
  }

  return [card, originalCard]
}

async function restartGame() {
  resetCards()
  dealer = 0

  getById("chatButton").style.display = "none"
  
  for (const [key, value] of Object.entries(usersData)) {
    if (value.score == 0) {
      value.score = 5
    }

    value.ready = false
    value.cards = []
    value.cardNum = 0
    
    getById(`outer${key}`).remove()
  }

  let shouldContinue = await shouldContinueFunc()

  resolveShouldContinue = false

  getById("didBeat").style.display = "none"
  getById("outer").style.display = "grid"

  if (shouldContinue) {
    getById("currentlyPlaying").innerHTML = "Waiting For Other Players..."
    getById("userList").innerHTML = ""
    beginRound()
  }
  else {
    alert("Ending Session")
    endSession()
    window.location.reload()
  }
}

function shouldContinueFunc() {
  return new Promise(function(resolve) {
    resolveShouldContinue = resolve
  })
}

function waitForCardsBeingShown() {
  let resolveFunc
  return new Promise(function a(resolve) {
    if (resolveFunc == null) {resolveFunc = resolve}
    if (haveShownPlayerCards) {resolveFunc(true)}
    else {setTimeout(a, 10)}
  })
}

function checkIfChatMsg(event, from) {
  try {
    let eventData = JSON.parse(event.data)
    eventData = JSON.parse(eventData.content)
    if (eventData.msg == "message") {chat.register(from, eventData.chat); return true}
  }
  catch(e) {}
}

async function dealerNumShow(event) {
  let eventData = JSON.parse(event.data)
  let from = eventData.from
  eventData = JSON.parse(eventData.content)
  let card = eventData.card

  if (from == host) {
    users = await getMembersApi()

    getById("multiplayerJoin").style.display = "none"
    getById("outer").style.display = "grid"
    getById("outerPlayer").style.display = "none"

    showPlayersCards()

    removeItem(users, player)
    users = [player].concat(users)

    getById("dealerNum").style.display = "block"
    getById("playerNum").style.display = "block"
    getById("dealerNum").innerHTML = `Dealer Number: ${card[0][1]}`
    showCard("dealerCards", card[1])

    usersData = eventData.usersData

    for (const [key, value] of Object.entries(usersData)) { 
      for (card of value.cards) {
        showCard(`${key}cards`, card)
      }

      if (key == player) {
        for (card of value.cards) {
          if (card[1] > 10) {
            card[1] = 10
          }

          plebNum += card[1]
        }

        getById("playerNum").innerText = `Your Number: ${plebNum}`
      }
    }   

    onUserLeft = function(event) {
      let eventData = JSON.parse(event.data)

      getById(`outer${eventData.username}`).remove()
    }
  }
}