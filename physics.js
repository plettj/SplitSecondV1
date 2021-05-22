// Runs and computes all the physics of the game.

// Josiah will mainly be working with this file.

// con = physical constants
var con = {
    u: Math.floor(window.innerWidth / 160) * 8, // unit = 1/20 of the screen
    ya: 20, // vertical acceleration
    friction: 0.7, // coefficient of friction
}