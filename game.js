// Handles all the objects and events of the game

// Variables:
let paused = false;
let unit = Math.floor(window.innerWidth / 160) * 8; // unit = 1/20 of the screen width
let gravity = 3.5; // vertical acceleration
let friction = 0.7; // coefficient of friction
let stepCounter = 0; // animation step digit
let step = 0; // actual animation step
let time = 1; // -1 = BACKWARDS TIME
let frame = 0; // CORE OPERATION: up when forward, down when backward!!!!

function clear(context, coor) {
    if (!coor) context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    else context.clearRect(coor[0] - unit / 4, coor[1] - unit / 4, unit * 1.5, unit * 1.5);
}

document.addEventListener("keydown", function(event) {
	keyPressed(event.keyCode, 1);
});
document.addEventListener("keyup", function(event) {
	keyPressed(event.keyCode, 0);
});

// Event processor!
function keyPressed(code, num) {
	if (code > 36 && code < 41) avatar.keys[code - 37] = num;
	else if (code === 65) avatar.keys[0] = num;
	else if (code === 87) avatar.keys[1] = num;
	else if (code === 68) avatar.keys[2] = num;
	else if (code === 83) avatar.keys[3] = num;
    else if (code === 32 && num) var space = true; // space button down
}

var avatar = {
    keys: [0, 0, 0, 0], // [A, W, D, S] 1 = down.
    action: 0, // 0-still 1-left 2-right 3-inAir
    coor: [200, 400], // position of the avatar, in pixels
    vcoor: [0, 0], // velocity of the avatar
    xv: 20, // max speed.
    xa: [2, 0.5], // max acceleration: [ground, air].
    yv: 30, // jump speed.
    size: [40, 40], // size of the avatar.
    img: new Image(),
    init: function () {
        this.img.src = "assets/AvatarTilesetReal.png";
    },
    draw: function (a) { // a: [xOnTileset, yOnTileset]
        canvases.FCctx.drawImage(this.img, a[0] * 128, a[1] * 128, 128, 128, this.coor[0], this.coor[1], unit, unit);
    },
    physics: function (a) {
        // physics for the avatar.
        clear(canvases.FCctx, this.coor);

        if (this.keys[0] + this.keys[1] + this.keys[2] == 0) this.action = 0;
        else if (this.keys[0] == this.keys[2]) this.action = 0;
        else if (this.keys[0]) this.action = 1;
        else if (this.keys[2]) this.action = 2;
        if (this.keys[1] && !this.vcoor[1]) {
            // set vertical jump velocity
            this.vcoor[1] = this.yv;
        }

        let acc = 0; // acceleration for on ground

        // ARE YOU IN THE AIR???????
        // This makes no sense; will use collisions later for this.
        if (this.vcoor[1]) { // "in air"
            acc = 1;
        } else { // "not in air"
            acc = 0;
        }

         
        switch (this.action) {
            case 0:
                // accelerate to stopped.
                this.vcoor[0] = Math.sign(this.vcoor[0]) * (Math.abs(this.vcoor[0]) - this.xa[acc]);
                if (acc) this.vcoor[1] -= gravity;
                break;
            case 1:
                // accelerate left.
                this.vcoor[0] -= this.xa[acc];
                break;
            case 2:
                // accelerate right.
                this.vcoor[0] += this.xa[acc];
                break;
        }

        // collision detection ought to happen here.
        // set vcoor[1] to 0 a lot.
        if (this.vcoor[1] <= -1 * this.yv) this.vcoor[1] = 0;

        this.coor[0] += this.vcoor[0];
        this.coor[1] -= this.vcoor[1]; // - because down is positive. takes care of all this.

        this.draw([step, 0]);
    }
}

var levels = {
    size: [60, 14] // height of 14, but we will only use the top 10.
}