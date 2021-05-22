// Handles all the objects and events of the game

// Variables:
let paused = false;
let gravity = 1.9; // vertical acceleration
let friction = 0.7; // coefficient of friction
let stepCounter = 0; // animation step digit
let step = 0; // actual animation step
let time = 1; // -1 = BACKWARDS TIME
let frame = 0; // CORE OPERATION: up when forward, down when backward!!!!

function clear(context, coor) {
    if (!coor) context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    else context.clearRect(coor[0], coor[1], unit, unit);
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
    action: 0, // 0-still 1-left 2-right
    dir: 0, // 0-left 1-right
    inAir: 0, // 1 = in air
    coor: [200, 400], // position of the avatar, in pixels
    vcoor: [0, 0], // velocity of the avatar
    maxv: 14, // max speed.
    xa: [1, 0.25], // max acceleration: [ground, air].
    yv: 19, // jump speed.
    size: [40, 40], // size of the avatar.
    img: new Image(),
    init: function () {
        this.img.src = "assets/AvatarTileset.png";
    },
    draw: function (a) { // a: [xOnTileset, yOnTileset]
        canvases.FCctx.drawImage(this.img, a[0] * 100, a[1] * 100, 100, 100, this.coor[0], this.coor[1], unit, unit);
    },
    physics: function (a) {
        // physics for the avatar.
        clear(canvases.FCctx, this.coor);

        if (this.keys[0] + this.keys[1] + this.keys[2] == 0) this.action = 0;
        else if (this.keys[0] == this.keys[2]) this.action = 0;
        else if (this.keys[0]) {
            this.action = 1;
            this.dir = 0;
        } else if (this.keys[2]) {
            this.action = 2;
            this.dir = 1;
        }

        // up down left right
        let co = [Math.round(this.coor[0] / unit) + 1, Math.round(this.coor[1] / unit) + 1]; // current co

        let blocks = [
            [levels.levels[levels.currentLevel][co[1] - 1][co[0] - 1], levels.levels[levels.currentLevel][co[1] - 1][co[0]], levels.levels[levels.currentLevel][co[1] - 1][co[0] + 1]],
            [levels.levels[levels.currentLevel][co[1]][co[0] - 1], levels.levels[levels.currentLevel][co[1]][co[0]], levels.levels[levels.currentLevel][co[1]][co[0] + 1]],
            [levels.levels[levels.currentLevel][co[1] + 1][co[0] - 1], levels.levels[levels.currentLevel][co[1] + 1][co[0]], levels.levels[levels.currentLevel][co[1] + 1][co[0] + 1]]
        ];

        if (this.keys[1] && !this.vcoor[1] && (blocks[2][1] == 1 || blocks[2][0] == 1 || blocks[2][2] == 1)) {
            this.vcoor[1] = this.yv;
            this.inAir = 1;
        }

        if (blocks[2][1] == 1) this.inAir = 0;
        else if (Math.floor(this.coor[0] / unit) + 1 !== co[0] && blocks[2][0] == 1) this.inAir = 0;
        else if (Math.ceil(this.coor[0] / unit) + 1 !== co[0] && blocks[2][2] == 1) this.inAir = 0;
        else { // "in air"
            this.inAir = 1;
            console.log("No ground beneath you.");
        }

        
        switch (this.action) {
            case 0: // stopped.
                this.vcoor[0] = Math.sign(this.vcoor[0]) * (Math.abs(this.vcoor[0]) - this.xa[this.inAir]);
                break;
            case 1: // accelerating left.
                this.vcoor[0] -= this.xa[this.inAir];
                break;
            case 2: // accelerating right.
                this.vcoor[0] += this.xa[this.inAir];
                break;
        }

        if (this.inAir) {
            this.vcoor[1] -= gravity;
        } else {
            this.vcoor[1] = 0
            this.coor[1] = this.coor[1] / unit;
        }

        // collision detection ought to happen here.

        if (Math.abs(this.vcoor[0]) < this.xa[this.inAir] && this.action == 0) this.vcoor[0] = 0;
        if (Math.abs(this.vcoor[0]) > this.maxv) this.vcoor[0] = Math.sign(this.vcoor[0]) * this.maxv;

        this.coor[0] += this.vcoor[0];
        this.coor[1] -= this.vcoor[1]; // - because down is positive. takes care of all this.

        this.draw([step, this.dir + this.inAir * 2]);
    }
}

var levels = {
    size: [20, 14], // height of 14, but we will only use the top 10.
    levels: [],
    currentLevel: 0,
    ground: new Image(),
    init: function () {
        this.ground.src = "assets/BlockTileset.png";
        this.ground.onload = function () {
            levels.startLevel(0);
        }
    },
    addLevel: function (values) {
        this.levels.push(values);
    },
    drawLevel: function (level, side) {
        for (let i = 1; i <= this.size[0]; i++) {
            for (let j = 1; j <= this.size[1]; j++) {
                switch (this.levels[level][j][i]) {
                    case 1:
                        let blocks = [1, 1, 1, 1];
                        if (levels.levels[level][j][i - 1] == 1) blocks[1] = 0;
                        if (levels.levels[level][j][i + 1] == 1) blocks[0] = 0;
                        if (levels.levels[level][j - 1][i] == 1) blocks[2] = 0;
                        if (levels.levels[level][j + 1][i] == 1) blocks[3] = 0;
                        canvases.BCctx.drawImage(this.ground, (blocks[1] + 2 * blocks[0]) * 100, (blocks[2] + 2 * blocks[3]) * 100, 100, 100, i * unit + side * unit * 20 - unit, j * unit - unit, unit, unit);
                        break;
                    case 2:
                        avatar.coor = [(i - 1) * unit, (j - 1) * unit];
                        break;
                }
            }
        }
    },
    startLevel: function (level) {
        levels.drawLevel(level, 0); // change 0 to 1 for animation system.
        // draw new level on right of canvas.
        // animate (css) towards new level.
        // erase previous level; redraw current level on left of canvas.
        // start game.
        levels.currentLevel = level;
    }
}



levels.addLevel([
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]);