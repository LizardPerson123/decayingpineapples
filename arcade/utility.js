function getRndInteger(min, max) {return Math.floor(Math.random() * (max - min) ) + min}
let getById = id => {return document.getElementById(id) }
let getByClss = className => {return Array.from(document.getElementsByClassName(className))}

function removeItem(array, itemToRemove) {
  const index = array.indexOf(itemToRemove)

  if (index !== -1) {
    array.splice(index, 1)
  }
}

function generateRandomCode(times, min, max) {
  let total = []
  for (let i = 0; i < times; i++) {
    total.push(getRndInteger(min, max))
  }

  return total.join("")
}

function shuffle(array) {
  let currentIndex = array.length

  while (currentIndex != 0) {

    let randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]]
  }
}