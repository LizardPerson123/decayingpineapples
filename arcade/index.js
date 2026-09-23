function letThereBeLight() {
  getById("styleTag").innerHTML = ""
  getById("imgMode").src = "../moon.svg"
}

function letThereBeDark() {
  getById("styleTag").innerHTML = `
    body {background-color: rgb(19, 20, 20); color: white}

    .outerBoxDiv {
      background-color: #e5dbce; 
      color: black;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(255, 255, 255, 0.5);
    }

    button, input {
      background-color: white !important;
      color: black !important;
    }
  `

  getById("imgMode").src = "../sun.svg"
}

function applyMode() {
  let currentMode = localStorage.getItem("mode")

  if (currentMode == "light") {
    letThereBeLight()
  }
  else {
    letThereBeDark()
  }
}

function changeMode() {
  let currentMode = localStorage.getItem("mode")

  if (currentMode == "light") {
    letThereBeDark()
    localStorage.setItem("mode", "dark")
  }
  else {
    letThereBeLight()
    localStorage.setItem("mode", "light")
  }
}

addEventListener("pageshow", function() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const origin = urlParams.get('origin')

    if (origin == "rotpear") {
      getById("back").onclick = () => {window.location.href = '../../cardgame.html'}
    }
    else if (origin == "about") {
      getById("back").onclick = () => {window.location.href = '../../about-cardgame.html'}
    }
  }
  catch(err) {}
})

addEventListener("pageshow", function() {
  applyMode()
})

applyMode()