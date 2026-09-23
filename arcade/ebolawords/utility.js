let getById = id => {return document.getElementById(id) }
let getByClss = className => {return Array.from(document.getElementsByClassName(className)) }

//credit: w3schools
function getRndInteger(min, max) {return Math.floor(Math.random() * (max - min) ) + min;}

function clearIntervals() {
  clearedIntervals = true
  intervals.forEach((value) => {
    clearInterval(value)
  })
}

async function manageGameFinished(score) {
    clearIntervals()

    getById("ebolaWords").innerHTML = "Submit Score"
    getById("selectedMode").style.display = "none"
    getById("score").style.display = "none"
    getById("ebola").style.display = "none"
    getById("wipeout").style.display = "none"
    getById("highscore").style.display = "none"
    getById("ebolaCanvas").style.display = "none"
    getById("submitScore").style.display = "block"
    getById("time").style.display = "none"

    alert("Game Over! Your Score: " + score)

    let addToScore = 0
    if (difficulty == 1) {
      addToScore = Math.round(score / 2)
      alert("Normal Mode Bonus: " + addToScore)
    }
    else if (difficulty == 2) {
      addToScore = score
      alert("Hard Mode Bonus: " + addToScore)
    }

    score += addToScore

    if (gamemode == "classic") {gamemode = ""}

    let highscore = localStorage.getItem("highscore" + gamemode) || 0
    let newHighScore = score > highscore

    if (score >= 1000) {
      let gameModesWith1000 = localStorage.getItem("gameModes1000") || []
      if (gameModesWith1000 == "") {gameModesWith1000 = []}
      else {gameModesWith1000 = JSON.parse(gameModesWith1000)}

      if (!(gameModesWith1000.includes(gamemode))) {gameModesWith1000.push(gamemode)}

      if (gameModesWith1000.length == 3) {achi.laterRegi("I Give Up", "gold")}

      localStorage.setItem("gameModes1000", JSON.stringify(gameModesWith1000))
    }

    if (!newHighScore) {
      await manageEnd(score)
    }
    else {
      alert("New High Score!")
      
      if (score >= 100 && gamemode == "") {achi.laterRegi("Ebola Novice", "bronze")}
      if (score >= 500 && gamemode == "") {achi.laterRegi("Ebola Medior", "silver")}
      if (score >= 1000 && gamemode == "") {achi.laterRegi("Ebola Expert", "gold")}

      if (localStorage.getItem("highscore")) {achi.laterRegi("Even Higher", "bronze")}

      localStorage.setItem("highscore" + gamemode, score)

      let preUsername = localStorage.getItem("username") || ""
      let prePassword = localStorage.getItem("password") || ""
      
      getById("username").value = preUsername
      getById("password").value = prePassword

      getById("submit").addEventListener("click", async function() {
        try {
          let username = getById("username").value

          let accountExists = await isAccount(username)

          if (accountExists == "false") {
            let doConfirm = confirm("Account Not Found. Would You Like To Create An Account?")

            if (doConfirm) {
              username = prompt("What Do You Want The Username To Be?", username)
              password = prompt("What Do You Want The Password To Be?")

              let createAccResult = await createAccount(username, password)

              if (createAccResult != 200) {
                throw "Error"
              }
            }
            else {window.location.reload()}
          }
          else if (accountExists == "error") {
            throw "Error"
          }
          else {
            password = getById("password").value
          }

          let isScoreCheck

          switch (gamemode) {
            case ("triple"): {isScoreCheck = await isScoreTripleEbola(score, username); break}
            case ("attack"): {isScoreCheck = await isScoreTimeAttack(score, username); break}
            default: {isScoreCheck = await isScore(score, username)}
          }

          if (isScoreCheck == "false") {
            throw "Score Not High Enough To Submit"
          }
          else if (isScoreCheck == "error") {
            throw "Error"
          }
        
          let submitScoreChk

          switch (gamemode) {
            case ("triple"): {submitScoreChk = await submitScoreTripleEbola(username, password, score); break}
            case ("attack"): {submitScoreChk = await submitScoreTimeAttack(username, password, score); break}
            default: {submitScoreChk = await submitScore(username, password, score)}
          }
        
          if (submitScoreChk.status == 200) {
            localStorage.setItem("username", username)
            localStorage.setItem("password", password)
            throw "Succesfully Submitted"
          }
          else {
            let submitScoreErrMsg = await submitScoreChk.text()

            if (submitScoreErrMsg == "INCORRECT PASSWORD") {
              throw "Incorrect Password"
            }
            else if (submitScoreErrMsg == "TOO YOUNG") {
              throw "Your Account Is Too Young, It Must Be At Least 7 Days Old"
            }
            else if (submitScoreErrMsg == "ACCOUNT BANNED") {
              throw "Your Account Is Banned, You Can Learn More On Your Account Page"
            }
            else {
              throw "Error"
            }

          }
        }
        catch(e) {
          alert(e)
          if (e != "Incorrect Password") {await manageEnd(score)}
        }
      })
    }
}
  

function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

async function manageEnd(score) {
    if (localStorage.getItem("username") && score > 100) {
      document.querySelector("body").innerText = "Please Wait..."
              
      try {
        await fetch("https://api.rottingpears.com/xp", {
            method: "POST",
            body: JSON.stringify({
              n: localStorage.getItem("username"),
              p: localStorage.getItem("password"),
              t: 1
            }),
            headers: {
              "Content-type": "application/json; charset=UTF-8"
            }
        })
      }
      catch (err) {}
    }
            
    window.location.reload()
}

function generateRandomCode(times, min, max) {
  let total = []
  for (let i = 0; i < times; i++) {
    total.push(getRndInteger(min, max))
  }

  return total.join("")
}