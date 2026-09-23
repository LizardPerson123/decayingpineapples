defaultColor = "black"

function letThereBeDark() {
  document.body.style.backgroundColor = "#131414"
  document.body.style.color = "white"

  for (let element of document.getElementsByTagName("a")) {
    if (element.style.color != "red" && element.style.color != "orange" && element.style.color != "green") {element.style.color = "white"}
  }

  for (let element of document.getElementsByClassName("altChange")) {
    element.style.color = "black"
    element.style.backgroundColor = "white"
  }
  
  try {
   getById("start1").style.background = "none"
   getById("start2").style.background = "none"
   getById("start3").style.background = "none"
   getById("start1").style.color = "#34eb3a"
   getById("start2").style.color = "#e5eb34"
   getById("start3").style.color = "red"
   getById("op1").style.background = "none"
   getById("op2").style.background = "none"
   getById("op3").style.background = "none"
   getById("op4").style.background = "none"
   getById("op1").style.color = "rgb(34, 197, 107)"
   getById("op2").style.color = "blueviolet"
   getById("op3").style.color = "red"
   getById("op4").style.color = "gray"
  }
  catch (e) {}
  
}

function letThereBeLight() {
  document.body.style.backgroundColor = "white"
  document.body.style.color = "black"

  for (let element of document.getElementsByTagName("a")) {
    if (element.style.color != "red" && element.style.color != "orange" && element.style.color != "green") {element.style.color = "black"}
  }

  for (let element of document.getElementsByClassName("altChange")) {
    element.style.color = "white"
    element.style.backgroundColor = "black"
  }

  try {
    getById("start1").style.backgroundColor = "#18a31c"
    getById("start2").style.backgroundColor = "#babd29"
    getById("start3").style.backgroundColor = "#c42020"
    getById("start1").style.color = "black"
    getById("start2").style.color = "black"
    getById("start3").style.color = "black"
    getById("op1").style.backgroundColor = "rgb(34, 197, 107)"
    getById("op2").style.backgroundColor = "blueviolet"
    getById("op3").style.backgroundColor = "#c42020"
    getById("op4").style.backgroundColor = "gray"
    getById("op1").style.color = "black"
    getById("op2").style.color = "black"
    getById("op3").style.color = "black"
    getById("op4").style.color = "black"
  }
  catch(e) {}

  
}

function ChangeMode() {
  if (localStorage.getItem("mode") == "dark") {
    localStorage.setItem("mode", "light")
    letThereBeLight()
    defaultColor = "black"
  }
  else {
    localStorage.setItem("mode", "dark")
    letThereBeDark()
    defaultColor = "white"
  }
}

function ApplyMode() {
  if (localStorage.getItem("mode") == "dark") {
    letThereBeDark()
    defaultColor = "white"
  } 
  else {
    letThereBeLight()
    defaultColor = "black"
  }
}