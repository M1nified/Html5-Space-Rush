const settings = {
  canvas: {
    width: document.body.clientWidth - 30,
    height: document.body.clientHeight - 30,
    style: "border: solid 3px #000;"
  },
  spaceship: {
    width: 35,
    height: 35,
    bulletSpeed: 100,
    stepLength: 3
  }
}
settings.alien = {
  width: 30,
  height: 30,
  stepLength: 5,
  posMinRandomX: 0,
  posMaxRandomX: settings.canvas.width,
  posMinRandomY: 0,
  posMaxRandomY: settings.canvas.height / 3
}
console.log(settings)
const IMAGES = {
  spaceship: "https://d30y9cdsu7xlg0.cloudfront.net/png/13581-200.png",
  alien: "https://d30y9cdsu7xlg0.cloudfront.net/png/445596-200.png"
}

const Directions = {
  Left: "Left",
  Right: "Right",
  Up: "Up",
  Down: "Down"
}

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.width = settings.canvas.width
canvas.height = settings.canvas.height
canvas.style = settings.canvas.style

class Bullet {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
    this.x = 0
    this.y = 0
    this.speed = settings.spaceship.bulletSpeed
    this.lastUpdate = Date.now()
    this.events = {
      onOutOfBounds: []
    }
  }
  show() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
    this.ctx.stroke();
    return this
  }
  setPosition(x, y) {
    this.x = x
    this.y = y
    return this
  }
  update() {
    const now = Date.now()
    const elapsed = now - this.lastUpdate
    this.y -= elapsed / 1000 * this.speed
    if (this.y < -10) {
      this.events.onOutOfBounds.forEach(action => action(this))
    }
    return this
  }
  addEventListener(eventName, action) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    let evts = this.events[eventName]
    evts.push(action)
  }
}

class Spaceship {

  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
    this.image = new Image()
    this.image.src = IMAGES.spaceship
    this.x = 0
    this.y = 0
    this.listenForCommands()

    this.bullets = []

    this.keyDown = {}

  }

  show() {
    this.ctx.drawImage(this.image, this.x - (settings.spaceship.width / 2), this.y - (settings.spaceship.height / 2), settings.spaceship.width, settings.spaceship.height)
    return this
  }
  showBullets() {
    this.bullets.forEach(bullet => bullet.show())
    return this
  }
  updateBullets() {
    this.bullets.forEach(bullet => bullet.update())
    return this
  }

  moveTo(x, y) {
    this.x = x
    this.y = y
    return this
  }

  moveLeft() {
    this.x -= settings.spaceship.stepLength
    return this
  }
  moveRight() {
    this.x += settings.spaceship.stepLength
    return this
  }
  moveUp() {
    this.y -= settings.spaceship.stepLength
    return this
  }
  moveDown() {
    this.y += settings.spaceship.stepLength
    return this
  }

  listenForCommands() {
    window.addEventListener("keydown", (event) => {
      console.log(event.which)
      this.keyDown[event.which] = true
    })
    window.addEventListener("keyup", (event) => {
      this.keyDown[event.which] = false
    })
    this.intervalMovement = setInterval(() => {
      if (this.keyDown[37]) this.moveLeft()
      if (this.keyDown[38]) this.moveUp()
      if (this.keyDown[39]) this.moveRight()
      if (this.keyDown[40]) this.moveDown()
    }, 10)
    this.intervalFire = setInterval(() => {
      if (this.keyDown[32]) this.fire();
    }, 50)
    return this
  }

  fire() {
    const bullet = new Bullet(this.canvas)
    bullet.setPosition(this.x, this.y)
    this.bullets.push(bullet)
    bullet.addEventListener('onOutOfBounds', (b) => this.bullets.splice(this.bullets.findIndex(el => el == b), 1))
  }

  checkHits(aliens) {
    this.bullets.forEach((bullet, bi) => {
      aliens.forEach((alien, ai) => {
        if (alien.didHit(bullet.x, bullet.y)) {
          aliens.splice(ai, 1)
          this.bullets.slice(bi, 1)
        }
      })
    })
  }

}

class Alien {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")
    this.x = 0
    this.y = 0
    this.image = new Image()
    this.image.src = IMAGES.alien
    this.lastUpdate = Date.now()
    this.events = {
      onDeath: []
    }
  }
  setPos(x, y) {
    this.x = x
    this.y = y
    return this
  }
  show() {
    this.ctx.drawImage(this.image, this.x - (settings.alien.width / 2), this.y - (settings.alien.height / 2), settings.alien.width, settings.alien.height)
    return this
  }
  didHit(x, y) {
    return x >= this.x - (settings.alien.width / 2) && x <= this.x + (settings.alien.width / 2) && y >= this.y - (settings.alien.height / 2) && y <= this.y + (settings.alien.height / 2);
  }
  randomPos() {
    this.x = Math.random() * (settings.alien.posMaxRandomX - settings.alien.posMinRandomY) + settings.alien.posMinRandomX
    this.y = Math.random() * (settings.alien.posMaxRandomY - settings.alien.posMinRandomX) + settings.alien.posMinRandomY
    return this
  }
}

const spaceship = new Spaceship(canvas)
spaceship.moveTo(settings.canvas.width / 2, settings.canvas.height - settings.spaceship.height - 20)
console.log(spaceship)

let aliens = []

const animationStep = (time) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  spaceship.show().showBullets().updateBullets().checkHits(aliens)
  aliens.forEach(alien => alien.show())
  if (Math.random() < 0.01) {
    const alien = new Alien(canvas)
    alien.randomPos()
    aliens.push(alien)
  }
  animate()
}

const animate = () => {
  window.requestAnimationFrame(animationStep)
}

animate()