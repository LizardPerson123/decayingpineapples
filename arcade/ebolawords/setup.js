function parseText(text, startValue=0) {
  let textArray = text.split(" ")
  textArray = removeItemAll(textArray, "")
  let index

  while (true) {
    index = textArray.indexOf("")
    if (index == -1) {break}
    textArray.splice(index, 1)
  }

  textArray.forEach((value, index) => {
    textArray[index] = `<a style="color: ${defaultColor}; text-decoration: none" id="${index + startValue}" href="javascript:cure(${index + startValue})" ondrag="javascript:cure(${index + startValue})">${value}</a>`
  })

  return textArray.join(" ")
}

async function GetHighScore() { 
  if (localStorage.getItem("highscore") != null) {getById("highscore").innerText = "High Score: " + localStorage.getItem("highscore")}
}