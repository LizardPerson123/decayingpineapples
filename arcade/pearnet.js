let onMessageFunctions = []
let onUserLeft = function() {}
let onNewUser = function() {}
let onMessageFrom = function() {}
let ws

function newSessionApi(username, password, assume="Unknown Realm") {
  return new Promise(function (resolve, reject) {
    beginMultiplayer()
    ws.send(JSON.stringify({purpose: "NEW SESSION", username: username, password: password, assume: assume}))
    onMessageFunctions.push(function checkForSessionStart(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.sessionID) {
        removeItem(onMessageFunctions, checkForSessionStart)
        resolve(eventData.sessionID)
      }
      else {
        reject(new Error(eventData.msg))
      }
    })
  })
}

function joinSessionApi(username, password, sessionID) {
  return new Promise(function (resolve, reject) {
    ws.send(JSON.stringify({purpose: "JOIN SESSION", username: username, password: password, sessionID: sessionID}))
    beginMultiplayer()
    onMessageFunctions.push(function checkForSessionJoin(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.host) {
        removeItem(onMessageFunctions, checkForSessionJoin)
        resolve([eventData.host, eventData.assume, eventData.users])
      }
      else {
        reject(new Error(eventData.msg))
      }
    })
  })
}

function endJoiningApi() {
  return new Promise(function (resolve, reject) {
    let identifier = generateRandomCode(5, 0, 9)

    ws.send(JSON.stringify({purpose: "endJoin", identifier: identifier})); 
    onMessageFunctions.push(function endJoinReturnFunction(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.identifier == identifier) {
        removeItem(onMessageFunctions, endJoinReturnFunction)
        resolve()
      }
    })
  })
}

function getMembersApi() {
  return new Promise(function (resolve, reject) {
    let identifier = generateRandomCode(5, 0, 9)
    ws.send(JSON.stringify({purpose: "getMembers", identifier: identifier}));

    onMessageFunctions.push(function getMembersReturnFunction(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.identifier == identifier) {
        removeItem(onMessageFunctions, getMembersReturnFunction)
        resolve(eventData.members)
      }
    })
  })
}

function broadcast(content) {
  return new Promise(function (resolve, reject) {
    let identifier = generateRandomCode(5, 0, 9)
    ws.send(JSON.stringify({purpose: "broadcast", content: content, identifier: identifier}));

    onMessageFunctions.push(function broadcastReturnFunction(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.identifier == identifier) {
        removeItem(onMessageFunctions, broadcastReturnFunction)
        resolve()
      }
    })
  })
}

function sendTo(target, content) {
  return new Promise(function (resolve, reject) {
    let identifier = generateRandomCode(5, 0, 9)
    ws.send(JSON.stringify({purpose: "sendTo", content: content, target: target, identifier: identifier}))

    onMessageFunctions.push(function sendToReturnFunction(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.identifier == identifier) {
        removeItem(onMessageFunctions, sendToReturnFunction)
        resolve()
      }

    })
  })
}

function kick(target) {
  return new Promise(function (resolve, reject) {
    let identifier = generateRandomCode(5, 0, 9)
    ws.send(JSON.stringify({purpose: "kick", target: target, identifier: identifier}))

    onMessageFunctions.push(function kickReturnFunction(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.identifier == identifier) {
        removeItem(onMessageFunctions, kickReturnFunction)
        resolve()
      }
    })
  })
}

function endSession() {
  return new Promise(function (resolve, reject) {
    let identifier = generateRandomCode(5, 0, 9)
    ws.send(JSON.stringify({purpose: "endSession", identifier: identifier}))

    onMessageFunctions.push(function endSessionReturnFunction(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.identifier == identifier) {
        removeItem(onMessageFunctions, endSessionReturnFunction)
        resolve()
      }
    })
  })
}

function openJoin() {
  return new Promise(function (resolve, reject) {
    let identifier = generateRandomCode(5, 0, 9)
    ws.send(JSON.stringify({purpose: "openJoin", identifier: identifier}))

    onMessageFunctions.push(function openJoinReturnFunction(event) {
      let eventData = JSON.parse(event.data)

      if (eventData.identifier == identifier) {
        removeItem(onMessageFunctions, openJoinReturnFunction)
        resolve()
      }
    })
  })
}

function beginMultiplayer() {
    ws.onmessage = async function (event) {
      let eventData = JSON.parse(event.data)
      let msg = eventData.msg

      switch (msg) {
        case "NEW USER": 
          await onNewUser(event)
          break
        
        case "SESSION ENDED":
          alert("Session Ended")
          window.location.reload()
        
        case "USER LEFT":
          await onUserLeft(event)
          break
        
        default:
          if (eventData.from) {
            await onMessageFrom(event, eventData.from)
          }
          else {
            onMessageFunctions.forEach(async function (item) {
              await item(event)
            })
          }
      } 
    }
}