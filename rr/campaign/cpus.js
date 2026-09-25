class Specialist extends Bot {
  whatToDoDecision() {
    let player = players[0]
    const chosenAction = "shoot"
    const attackedPlayer = players.indexOf(player)

    return [chosenAction, attackedPlayer]
  }

  whatToDo() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(this.whatToDoDecision())
      }.bind(this), 2000)
    }.bind(this))
  }

  constructor(name) {
    super(name)
    this.description = "Attacks Only You"
    this.img = "specialist.png"
    this.name = "Specialist"
  }
}

class Tank extends Bot {
  constructor(name) {
    super(name)
    this.hp = 5
    this.description = "Has 5 Hearts"
    this.img = "tank.png"
    this.name = "Tank"
  }
}

class Duplex extends Bot {
  constructor(name) {
    super(name)
    this.hp = 2
    this.description = "Splits Into Two Upon Death"
    this.img = "duplex.png"
    this.name = "Duplex"
  }

  damage(hp, attacker) {
    const damageResult = super.damage(hp, attacker)

    if (this.hp < 1) {
      for (let i = 1; i <= 2; i++) {
        const newTwin = new Twin(`Twin ${i} (${this.name})`)
        newTwin.hp = 1

        players.push(newTwin)
      }

      removeItem(players, this)
      updatePlayers()

      players.forEach(function(player) {
        player.alcoholEffects.forEach(function(alcoholEffect) {
          getById(`${player.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${alcoholEffect.id}Effect'>${alcoholEffect.name}</p>`
        })
      })
    }

    return damageResult
  }
}

class Expendable extends Bot {
  constructor(name) {
    super(name)
    this.hp = 2
    this.description = "Only Shoots Itself, If It Kills Itself You Take 2 Hearts Of Damage; If You Kill It Nothing Happens"
    this.img = "bomb.png"
    this.name = "Expendable"
  }

  whatToDoDecision() {
    const chosenAction = "shoot"
    const attackedPlayer = players.indexOf(this)

    return [chosenAction, attackedPlayer]
  }

  whatToDo() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(this.whatToDoDecision())
      }.bind(this), 2000)
    }.bind(this))
  }

  damage(hp, attacker) {
    let damageResult = super.damage(hp, attacker)
    
    // If They Kill Themself Than The Player Takes Two Hearts Of Damage
    if (this.hp < 1 && attacker && attacker.name === this.name) {
      players.forEach(function(player) {
        if (player instanceof Human) {
          player.damage(2)
          damageResult += "Player Takes 2 Hearts Of Damage"
        }
      })
    }
    
    return damageResult
  }
}

class CantDie extends Bot {
  constructor() {
    super()

    // Grab AlcoholEffect Invincible From Red Wine And Add It, Remove Its Name, Then Set Its Turns So That It Basically Never Ends
    const alcoholEffect = new Red_Wine().AlcoholEffect
    alcoholEffect.name = ""
    alcoholEffect.turns = 50000
    this.alcoholEffects.push(alcoholEffect)
    
    const takeDamageName = ""
    const turns = 50000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 5
    const doNotRemoveUnnaturally = true

    function naturalDamageTake(player, result) {
      player.damage(1)
      const msg = "Took Natural Damage"

      // Required To Work With Alcohol Effect Manager
      if (result !== undefined) {
        return [result, msg]
      }

      return msg
    }

    const onShoot = naturalDamageTake
    const onAlcohol = naturalDamageTake
    const giveUpAlcoholEffect = new Effect(takeDamageName, turns, onDamage, onShoot, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    this.alcoholEffects.push(giveUpAlcoholEffect)

    this.hp = 5
    this.description = "Cannot Take Damage From Other Players, Instead, It Takes One Heart Of Damage Every Round"
    this.img = "milk.png"
    this.name = "Milkman"
  }
}

class Innocent extends Bot {
  altOutcome() {
    return "Can't Do Anything"
  }

  constructor(name) {
    super(name)
    this.description = "Does Nothing; You Do Not Have To Kill It"
    this.img = "innocent.png"
    this.name = "Innocent"
  }

  damage(hp, attacker) {
    const result = super.damage(hp, attacker)

    if (attacker && attacker.name === players[0].name && this.hp < 1) {
      achi.register("Heartless Monster", "bronze")
    }

    return result
  }
}

class CanGoInsane extends Bot {
  constructor(name) {
    super(name)
    
    const effectName = ""
    const turns = 50000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 0
    const onAlcohol = undefined
    const doNotRemoveUnnaturally = true

    function onShoot(player, result) {
      if (player.hasGoneInsane) {
        result = true
        return [result, "Guranteed Live"]
      }
      
      let msg = ""
      const goInsane = getRndInt(1, 5) === 1

      if (goInsane) {
        msg = "Has Now Gone Insane"
        player.hasGoneInsane = true
      }

      return [result, msg]
    }

    const insaneEffect = new Effect(effectName, turns, onDamage, onShoot, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    this.alcoholEffects.push(insaneEffect)
    this.description = "Acts Like A Normal CPU, But Randomly Goes Insane; When It Is Insane It Has Infinite Guranteed Lives"
    this.img = "insane.png"
    this.name = "Psychotic"
  }
}

class InfiniteAlcohol extends Bot {
  constructor(name) {
    super(name)
    
    const effectName = ""
    const turns = 50000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 0
    const onShoot = undefined
    const doNotRemoveUnnaturally = true

    function onAlcohol(player) {
      const newAlcohol = new gameAlcohol[getRndInt(0, gameAlcohol.length)]()
      player.activeAlcohol.push(newAlcohol)
      return ""
    }

    const giveUpAlcoholEffect = new Effect(effectName, turns, onDamage, onShoot, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    this.alcoholEffects.push(giveUpAlcoholEffect)

    this.description = "Has Infinite Alcohol"
    this.img = "infinitealcohol.png"
    this.name = "Boozer"
  }
}

class Sniper extends Bot {
  constructor(name) {
    super(name)
    
    const effectName = ""
    const turns = 50000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 0

    function supercharge(player, result, playerDamaged) {
      playerDamaged.damage(1)
      result = true
      const msg = "Extra Damage Done"
      
      player.altOutcome = player.altOutcomeFunction
      player.untilSupercharged = player.untilSuperchargedMax
      return [result, msg]
    }

    const onShoot = supercharge
    const onAlcohol = undefined
    const doNotRemoveUnnaturally = true

    const superchargeEffect = new Effect(effectName, turns, onDamage, onShoot, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    this.alcoholEffects.push(superchargeEffect)

    this.hp = 2
    this.untilSuperchargedMax = 3
    this.untilSupercharged = this.untilSuperchargedMax
    this.altOutcome = this.altOutcomeFunction

    this.description = "Takes Up Several Rounds To Charge Up A Shot, This Shot Does 2 Damage"
    this.img = "sniper.png"
    this.name = "Sniper"
  }

  altOutcomeFunction() {
    this.untilSupercharged--
    
    if (this.untilSupercharged > 0) {
      return `${this.untilSupercharged} Turn(s) Until Supercharged`
    }
    
    this.altOutcome = undefined
    return `${this.name} Is Now Supercharged`
  }

  async whatToDoDecision() {
    const chosenAction = "shoot"
    const player = players.find(player => player instanceof Human)
    const playerIndex = players.indexOf(player)

    return [chosenAction, playerIndex]
  }

  whatToDo() {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(this.whatToDoDecision())
      }.bind(this), 2000)
    }.bind(this))
  }
}

class SuperDuplex extends Bot {
  static upname = "Super Duplex"
  
  constructor(name) {
    super(name)
    this.hp = 4
    this.description = "Splits Into Two Duplexes Upon Death"
    this.img = "superduplex.png"
    this.name = "Super Duplex"
    this.enemyNumber = 0
    this.messages = ["The Super Duplex Splits Into Two Smaller Duplexes"]
  }

  damage(hp, attacker) {
    const damageResult = super.damage(hp, attacker)

    if (this.hp < 1) {
      for (let i = 1; i <= 2; i++) {
        const newTwin = new Duplex()
        newTwin.name = "Duplex " + i

        players.push(newTwin)
      }

      removeItem(players, this)
      updatePlayers()

      players.forEach(function(player) {
        player.alcoholEffects.forEach(function(alcoholEffect) {
          getById(`${player.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${alcoholEffect.id}Effect'>${alcoholEffect.name}</p>`
        })
      })
    }

    return damageResult
  }
}

class Twin extends Bot {
  constructor(name) {
    super(name)
    this.hp = 2
    this.description = "Basic Enemy; Came From Duplex"
    this.img = "basic.png"
    this.enemyNumber = 0
  }
}

class Judge extends Bot {
  constructor(name) {
    super(name)
    this.hp = 5
    this.description = "Judges Your Actions"
    this.actAsDead = true
    this.name = "Judge"
    
    const effectMsg = "Judgement"
    const effectTurns = 5000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 0
    const onAlcohol = undefined
    const doNotRemoveUnnaturally = true

    const effect = new Effect(effectMsg, effectTurns, onDamage, function onShoot(player, result, playerDamaged) {
      let msg = ""

      if (player.name !== playerDamaged.name) {
        player.trustScore -= 1
      }

      if (player.trustScore < 1) {
        msg = this.giveEffect(player, msg)

        const newTrustScore = getRndInt(2, 5)
        player.trustScore = newTrustScore
        player.maxTrustScore = this.trustScore
      }
      
      // When Using Alcohol
      if (result === undefined) {
        return msg
      }

      return [result, msg]
    }, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)
    
    const newTrustScore = getRndInt(3, 6)
    players[0].trustScore = newTrustScore
    players[0].maxTrustScore = players[0].trustScore
    players[0].onAlcohol = effect.onShoot

    const altOutcome = function() {
      this.altOutcomeLast -= 1

      if (this.altOutcomeLast < 1) {
        this.altOutcome = undefined
        players[0].alcoholEffects.forEach(function(effect) {
          (effect.name === "Judgement") && (getById(effect.id + "Effect").remove())
        })
      }
      return "In Prison"
    }

    effect.forcedBlanks = new Brandy().AlcoholEffect
    effect.forcedAlcohols = new SuperBrandy().AlcoholEffect
    effect.removeAlcohol = "removeAlcohol"
    effect.prison = altOutcome
    effect.effectPool = [effect.forcedAlcohols, effect.forcedBlanks, effect.removeAlcohol, effect.prison]

    effect.giveEffect = function(player, msg) {
      const chosenEffect = effect.effectPool[getRndInt(0, effect.effectPool.length)]
      
      if (chosenEffect instanceof Effect) {
        player.alcoholEffects.push(chosenEffect)
        getById(`${player.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${chosenEffect.id}Effect'>${chosenEffect.name}</p>`
        msg = "Judge Gave Player " + chosenEffect.name
      }

      else if (chosenEffect === this.prison) {
        player.altOutcome = this.prison
        player.altOutcomeLast = 3
        getById(`${player.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${this.id}Effect'>Prison</p>`
        msg = "Judge Sent Player To Prison"
      }
      
      else if (chosenEffect === this.removeAlcohol) {
        player.activeAlcohol = []
        getById("statusEffects").innerHTML = "<h1>Alcohol</h1>"
        msg = "Judge Removed All Alcohol"
      }

      return msg
    }

    players[0].alcoholEffects.push(effect)
    players[0].addForfeit = true

    const effectMsgForfeit = "Forfeit"
    const effectTurnsForfeit = 5000
    const onDamageForfeit = undefined
    const onEndForfeit = undefined
    const importanceForfeit = 0
    const onAlcoholForfeit = undefined
    const doNotRemoveUnnaturallyForfeit = true
    const onShootForfeit = undefined

    const effectForfeit = new Effect(effectMsgForfeit, effectTurnsForfeit, onDamageForfeit, onShootForfeit, onEndForfeit, importanceForfeit, onAlcoholForfeit, doNotRemoveUnnaturallyForfeit, function(player) {
      player.trustScore < player.maxTrustScore && (player.trustScore++)
    })

    players[0].alcoholEffects.push(effectForfeit)

    this.messages = ["The Next Boss Is The Judge", 
      "If You Commit Too Many Bad Acts, The Judge Will Punish You",
      "To Improve Your Score With The Judge, Forfeit A Turn"
    ]

    this.enemyNumber = 3
    this.img = "judge.png"
    this.cpus = [Bot, Tank, Specialist, Sniper]
  }
}

class General extends Bot {
  altOutcome() {
    const decisions = [
      // Shoot Player
      ["shoot", 0],

      // Shoot Self
      ["shoot", "findSelf"],
      
      // Use Alcohol
      ["alcohol", "getAlcoholName"],
    ]

    const decision = decisions[getRndInt(0, decisions.length)]

    if (decision.includes("getAlcoholName")) {
      let alcohol = getRndInt(0, gameAlcohol.length)
      decision[decision.indexOf("getAlcoholName") + 1] = alcohol
    }

    players.forEach(function(player) {
      if (!(player instanceof Bot)) return

      player.toDo = decision.slice(0)

      if (player.toDo.includes("findSelf")) {
        const index = players.indexOf(player)
        player.toDo[player.toDo.indexOf("findSelf")] = index
      }

      if (player.toDo.includes("getAlcoholName")) {
        const alcohol = new gameAlcohol[player.toDo[2]]()
        player.activeAlcohol.push(alcohol)
        const alcoholIndex = player.activeAlcohol.indexOf(alcohol)

        player.toDo[player.toDo.indexOf("getAlcoholName")] = alcoholIndex
      }

      player.whatToDo = function() {
        return new Promise(function(resolve) {
          setTimeout(function() {
            resolve(player.toDo)
          }, 1400)
        })
      }
    })
    
    let cmd = ""

    if (decision === decisions[0]) {
      cmd = "Shoot Player"
    }
    else if (decision === decisions[1]) {
      cmd = "Shoot Themselves"
    }
    else if (decision === decisions[2]) {
      cmd = "Use " + (new gameAlcohol[decision[2]]).name
    }

    return "Commanded Enemies To " + cmd
  }

  constructor(name) {
    super(name)
    this.description = "Commands Her Troops"
    this.name = "General"
    this.enemyNumber = 3
    this.cpus = [Bot, Tank, BotWithCoolName]

    this.messages = ["The General Commands Enemies", 
      "They Will All Perform The Action He Commands Them To",
      "If You Kill The General, They Will Act Scattered"
    ]

    this.img = "general.png"
  }

  damage(hp, attacker) {
    const result = super.damage(hp, attacker)

    if (this.hp < 1) {
      players.forEach(function(player) {
        if (!(player instanceof Bot)) return

        player.whatToDo = (new Bot()).whatToDo
      })
    }

    return result
  }
}

class BotWithCoolName extends Bot {
  constructor() {
    super("Bot 2")
  }
}

class Wizard extends Bot {
  altOutcomeDecision() {
    let msg = ""
    let action = getRndInt(0, 4)

    if (action === 3 && getRndInt(0, 2) === 0) {
      action = 2
    }
  
    if (action === 0) {
      msg = "Hypnotized Player"
      players[0].oldWhatToDo = players[0].whatToDo
      players[0].whatToDo = this.whatToDoHypnosis
    }
    else if (action === 1) {
      this.giveEffect()
      msg = "Gave Everyone Random Effects"
    }
    else if (action === 2) {
      msg = "Removed One Alcohol From Everyone"
      this.removeAlcohol()
    }
    else if (action === 3) {
      msg = "Gave Everyone One Heart"
      this.removeHearts()
    }

    const shootNextRound = getRndInt(0, 3) === 0

    if (shootNextRound) {
      this.altOutcome = undefined
    }

    return msg
  }

  giveEffect() {
    const effectPool = [
      // Forced Blanks
      (new Brandy()).AlcoholEffect,

      // Invincibility
      (new Red_Wine()).AlcoholEffect,

      // Guranteed Live
      (new Beer()).AlcoholEffect,

      // Forced Alcohols
      (new SuperBrandy()).AlcoholEffect,

      // Confusion
      (new Rum()).AlcoholEffect,

      // Weakness
      (new Cider()).AlcoholEffect
    ]

    players.forEach(function(player) {
      const alcoholEffect = effectPool[getRndInt(0, effectPool.length)]
      player.alcoholEffects.push(alcoholEffect)

      if (alcoholEffect.name === "Confusion") {
        player.confused = true
      }

      getById(`${player.id}Effects`).innerHTML += `<p style='margin-top: 0px; margin-bottom: 2px' id='${alcoholEffect.id}Effect'>${alcoholEffect.name}</p>`
    })
  }

  removeAlcohol() {
    players.forEach(function(player) {
      if (player.activeAlcohol.length < 1) return

      const alcoholToRemove = player.activeAlcohol[getRndInt(0, player.activeAlcohol.length)]

      removeItem(player.activeAlcohol, alcoholToRemove)

      if (player instanceof Human) {
        getById("alcohol" + alcoholToRemove.id).remove()
      }
    })
  }

  removeHearts() {
    players.forEach(function(player) {
      player.hp > 0 && player.damage(-1)
    })
  }

  whatToDoHypnosis() {
    let whatToDoSuper = new Player().whatToDo
    return new Promise(async function(resolve) {
      async function whatToDoLocal() {
        let whatToDoBind = whatToDoSuper.bind(this)
        let chosenAction = whatToDoBind()
        return chosenAction
      }

      this.whatToDo = this.oldWhatToDo

      setTimeout(async function() {
        const decision = await whatToDoLocal.bind(this)()
        resolve(decision)
      }.bind(this), 2000)
    }.bind(this))
  }

  constructor(name) {
    super(name)
    this.description = "Casts Spells"
    this.name = "Wizard"
    this.altOutcome = this.altOutcomeDecision

    const shootEffect = function(player, result) {
      let msg = "Wizard Blank"
      result = false

      if (getRndInt(0, 3) !== 0) {
        msg = "Wizard Live"
        result = true
      }
      
      this.altOutcome = this.altOutcomeDecision

      return [result, msg]
    }.bind(this)

    const effectMsg = ""
    const effectTurns = 5000
    const onDamage = undefined
    const onEnd = undefined
    const importance = 0
    const onAlcohol = undefined
    const doNotRemoveUnnaturally = true

    const effect = new Effect(effectMsg, effectTurns, onDamage, shootEffect, onEnd, importance, onAlcohol, doNotRemoveUnnaturally)

    this.alcoholEffects.push(effect)

    this.enemyNumber = 2
    this.cpus = [Bot, Tank, Specialist, Tank]
    this.img = "wizard.png"

    this.messages = ["The Wizard Performs Spells", 
      "These Spells Do Random Effects",
      "When The Wizard Shoots Someone, It Is Highly Likely To Be Live"
    ]
  }

  whatToDo() {
    return new Promise(async function(resolve) {
      setTimeout(async function() {
        const index = getRndInt(0, players.length)
        resolve(["shoot", index])
      }.bind(this), 2000)
    }.bind(this))
  }
}

const cpus = [Bot, Specialist, Expendable, Duplex, CantDie, CanGoInsane, Innocent, Tank, Sniper]
const bosses = [Wizard, Judge, General, SuperDuplex]