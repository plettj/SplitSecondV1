// Handles all the objects and events of the game

// Variables:
let paused = false;
let unit = Math.ceil(window.innerWidth / 20); // unit = 1/20 of the screen width
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
    yv: 30, // jump speed.
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
        let co = [Math.ceil(this.coor[0] / unit), Math.ceil(this.coor[1] / unit)]; // current co
        let blocks = [1, 0, 1, 0, 0]; // [left, up, right, down, right-down(cause ceil)]
        if (co[0] > 0) blocks[0] = levels.levels[levels.currentLevel][co[1]][co[0] - 1];
        if (co[0] < levels.size[0]) {
            blocks[2] = levels.levels[levels.currentLevel][co[1]][co[0] + 1];
            if (co[0] < levels.size[1]) blocks[4] = levels.levels[levels.currentLevel][co[1] + 1][co[0] + 1];
        }
        if (co[1] > 0) blocks[1] = levels.levels[levels.currentLevel][co[1] - 1][co[0]];
        if (co[0] < levels.size[1]) blocks[3] = levels.levels[levels.currentLevel][co[1] + 1][co[0]];

        if (this.keys[1] && !this.vcoor[1] && (blocks[3] == 1 || blocks[4] == 1) && blocks[1]) {
            this.vcoor[1] = this.yv;
            this.inAir = 1;
        }

        let acc = 0; // acceleration for on ground

        // ARE YOU IN THE AIR???????
        if ((blocks[3] == 1 || blocks[4] == 1) && Math.floor(1)/* unit is about to change */) { // "not in air"
            this.inAir = 0;
        } else { // "in air"
            this.inAir = 1;
        }

        
        switch (this.action) {
            case 0:
                // accelerate to stopped.
                this.vcoor[0] = Math.sign(this.vcoor[0]) * (Math.abs(this.vcoor[0]) - this.xa[this.inAir]);
                break;
            case 1:
                // accelerate left.
                this.vcoor[0] -= this.xa[this.inAir];
                break;
            case 2:
                // accelerate right.
                this.vcoor[0] += this.xa[this.inAir];
                break;
        }

        
        if (this.inAir) this.vcoor[1] -= gravity;

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
        for (let i = 0; i < this.size[0]; i++) {
            for (let j = 0; j < this.size[1]; j++) {
                switch (this.levels[level][j][i]) {
                    case 1:
                        canvases.BCctx.drawImage(this.ground, 0, 0, 100, 100, i * unit + side * unit * 20, j * unit, unit, unit);
                        break;
                    case 2:
                        avatar.coor = [i * unit, j * unit];
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
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]);