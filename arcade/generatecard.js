//1: Spades, 2: Hearts, 3: Diamonds, 4: Clubs

let Spades = Array.from(Array(13).keys()).map(x => x + 1)

let Hearts = Array.from(Array(13).keys()).map(x => x + 1)

let Diamonds = Array.from(Array(13).keys()).map(x => x + 1)

let Clubs = Array.from(Array(13).keys()).map(x => x + 1)

let cards = [Spades, Hearts, Diamonds, Clubs]

function generateCard() {
  if (cards.every(suit => suit.length === 0)) {
    return null
  }

  let suit = 0
  do {
    suit = getRndInteger(0, 4)
  }
  while (cards[suit].length === 0)

  let card = cards[suit].splice(getRndInteger(0, cards[suit].length), 1)

  return [suit + 1, card[0]]
}

function resetCards() {
  Spades = Array.from(Array(13).keys()).map(x => x + 1)

  Hearts = Array.from(Array(13).keys()).map(x => x + 1)

  Diamonds = Array.from(Array(13).keys()).map(x => x + 1)

  Clubs = Array.from(Array(13).keys()).map(x => x + 1)

  cards = [Spades, Hearts, Diamonds, Clubs]
}