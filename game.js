// Handles all the objects and events of the game

// Variables:
let paused = false;
let gravity = 1.2 / 56 * unit; // vertical acceleration
let stepCounter = 0; // animation step digit
let step = 0; // actual animation step
let time = 1; // -1 = BACKWARDS TIME
let frame = 0; // CORE OPERATION: up when forward, down when backward!!!!
let GFuel = 3; // number of frames between each Ghost's learning.
var nextGhost = undefined;

function clear(context, coor) {
    if (!coor) context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    else context.clearRect(coor[0] - unit / 40, coor[1] - unit / 40, unit * 1.05, unit * 1.05);
}

function between([a, b], num) {return num >= Math.min(a, b) && num <= Math.max(a, b);}

document.addEventListener("keydown", function(event) {
	keyPressed(event.keyCode, 1);
});
document.addEventListener("keyup", function(event) {
	keyPressed(event.keyCode, 0);
});

// Event processor!
function keyPressed(code, num) {
	if (code > 36 && code < 41) avatar.keys[code - 37] = num;
	else if (code === 65) avatar.keys[0] = num; // Left
	else if (code === 87 || code === 32) avatar.keys[1] = num; // Up
	else if (code === 68) avatar.keys[2] = num; // Right
	else if (code === 83) avatar.keys[3] = num; // Down
    else if ((code === 67 || code === 69 || code === 88) && num) reverseTime();
}

var avatar = {
    keys: [0, 0, 0, 0], // [A, W, D, S] 1 = down.
    action: 0, // 0-still 1-left 2-right
    dir: 0, // 0-left 1-right
    inAir: 0, // 1 = in air
    coor: [0, 0], // position of the avatar, in pixels
    vcoor: [0, 0], // velocity of the avatar
    maxv: 6 / 56 * unit, // max speed.
    xa: [1 / 70 * unit, 1 / 120 * unit], // max acceleration: [ground, air].
    yv: 18 / 56 * unit, // jump speed.
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
        
        if (Math.abs(this.vcoor[0]) < this.xa[this.inAir] && this.action == 0) this.vcoor[0] = 0;
        if (Math.abs(this.vcoor[0]) > this.maxv) this.vcoor[0] = Math.sign(this.vcoor[0]) * this.maxv;

        let co = [Math.round(this.coor[0] / unit) + 1, Math.round(this.coor[1] / unit) + 1]; // current co

        let blocks = [
            [levels.levels[levels.currentLevel][co[1] - 1][co[0] - 1], levels.levels[levels.currentLevel][co[1] - 1][co[0]], levels.levels[levels.currentLevel][co[1] - 1][co[0] + 1]],
            [levels.levels[levels.currentLevel][co[1]][co[0] - 1], levels.levels[levels.currentLevel][co[1]][co[0]], levels.levels[levels.currentLevel][co[1]][co[0] + 1]],
            [levels.levels[levels.currentLevel][co[1] + 1][co[0] - 1], levels.levels[levels.currentLevel][co[1] + 1][co[0]], levels.levels[levels.currentLevel][co[1] + 1][co[0] + 1]]
        ];

        // collisions downward.
        if (this.inAir && this.vcoor[1] < gravity && Math.ceil(this.coor[1] / unit) > Math.round(this.coor[1] / unit)) {
            if (blocks[2][1] == 1) this.inAir = 0;
            else if (Math.floor(this.coor[0] / unit) + 1 !== co[0] && blocks[2][0] == 1) this.inAir = 0;
            else if (Math.ceil(this.coor[0] / unit) + 1 !== co[0] && blocks[2][2] == 1) this.inAir = 0;
            else { // "in air"
                this.inAir = 1;
            }
        } else if (this.vcoor[1] < gravity) {
            if (blocks[2][1] == 1) this.inAir = 0;
            else if (Math.floor(this.coor[0] / unit) + 1 !== co[0] && blocks[2][0] == 1) this.inAir = 0;
            else if (Math.ceil(this.coor[0] / unit) + 1 !== co[0] && blocks[2][2] == 1) this.inAir = 0;
            else { // "in air"
                this.inAir = 1;
            }
        }

        // collisions upward
        if (this.inAir && this.vcoor[1] > -1 * gravity) {
            let y = Math.ceil(this.coor[1] / unit);
            if (levels.levels[levels.currentLevel][y][co[0]] == 1) this.vcoor[1] = 0;
            else if (Math.floor(this.coor[0] / unit) + 1 !== co[0] && levels.levels[levels.currentLevel][y][co[0] - 1] == 1) this.vcoor[1] = 0;
            else if (Math.ceil(this.coor[0] / unit) + 1 !== co[0] && levels.levels[levels.currentLevel][y][co[0] + 1] == 1) this.vcoor[1] = 0;
        }
        
        if (this.keys[1] && !this.vcoor[1] && (blocks[2][1] == 1 || blocks[2][0] == 1 || blocks[2][2] == 1)) {
            console.log("Trying to jump!");
            let y = Math.ceil(this.coor[1] / unit);
            let roof = false;
            if (levels.levels[levels.currentLevel][y][co[0]] == 1) roof = true;
            else if (Math.floor(this.coor[0] / unit) + 1 !== co[0] && levels.levels[levels.currentLevel][y][co[0] - 1] == 1) roof = true;
            else if (Math.ceil(this.coor[0] / unit) + 1 !== co[0] && levels.levels[levels.currentLevel][y][co[0] + 1] == 1) roof = true;
            if (!roof) this.vcoor[1] = this.yv;
            else this.vcoor[1] = unit / 20;
            this.inAir = 1;
            this.keys[1] = 0;
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
        } else if (Math.abs(Math.ceil(this.coor[1] / unit) - Math.floor(this.coor[1] / unit)) == 1) {
            console.log("Snapping, vertically: %% = " + ((this.vcoor[1] / unit) % 1));
            if (Math.abs(this.vcoor[1] / unit) % 1 > 0.8 && this.vcoor[1]) this.coor[1] = Math.floor(this.coor[1] / unit) * unit;
            else if (this.vcoor[1] && (Math.abs(this.vcoor[1] / unit) % 1 > 0.216 || Math.abs(this.vcoor[1] / unit) % 1 < 0.212)) this.coor[1] = Math.ceil(this.coor[1] / unit) * unit;
            this.vcoor[1] = 0;
        }

        // collisions left and right
        if (Math.ceil((this.coor[0] + this.vcoor[0] * 1.5) / unit) > Math.ceil(this.coor[0] / unit)) { // against right edge.
            let y = Math.ceil(this.coor[1] / unit) + 1;
            if (blocks[1][2] == 1 || levels.levels[levels.currentLevel][y][co[0] + 1] == 1) {
                this.vcoor[0] = 0;
                this.coor[0] = Math.ceil(this.coor[0] / unit) * unit;
            }
        } else if (Math.floor((this.coor[0] + this.vcoor[0] * 1.5) / unit) < Math.floor(this.coor[0] / unit)) { // against left edge.
            let y = Math.ceil(this.coor[1] / unit) + 1;
            if (blocks[1][0] == 1 || levels.levels[levels.currentLevel][y][co[0] - 1] == 1) {
                this.vcoor[0] = 0;
                this.coor[0] = Math.floor(this.coor[0] / unit) * unit;
            }
        }

        if (!this.inAir && this.vcoor[1] == 0 && Math.abs(this.coor[1] / unit) % 1 !== 0) {
            this.coor[1] = Math.round(this.coor[1] / unit) * unit;
        }

        this.coor[0] += this.vcoor[0];
        this.coor[1] -= this.vcoor[1]; // - because down is positive. takes care of all this.

        // inside a block??
        if (blocks[1][1] == 1) {
            if (this.dir && blocks[1][2] !== 1) this.coor[0] = Math.round(this.coor[0] / unit + 1) * unit;
            else if (blocks[1][0] == 1) this.coor[0] = Math.round(this.coor[0] / unit + 1) * unit;
            else this.coor[0] = Math.round(this.coor[0] / unit - 1) * unit;
        }

        this.draw([step, this.dir + this.inAir * 2]);
    }
}


var buttonImg = new Image();
buttonImg.src = "assets/ButtonTileset2.png";

function Button(x, y, dir, colour, interact) {
    //dir should be 0 (<) or 1 (>)
    this.frame = 0;
    this.dir = dir;
    this.colour = colour;
    this.interact = interact;
    this.pressed = 0;
    this.coor = [x * unit, y * unit];
}
Button.prototype.check = function () {
    //console.log(Math.round(avatar.coor[0] / unit * 10)/10);
    //console.log(this.coor[0] / unit);
    //x
    if ((this.dir == 0 && Math.round(avatar.coor[0] / unit * 10)/10 <= this.coor[0] / unit + 0.1 && Math.round(avatar.coor[0] / unit * 10)/10 >= this.coor[0] / unit) || (this.dir == 1 && Math.round(avatar.coor[0] / unit * 10)/10 >= this.coor[0] / unit - 0.1 && Math.round(avatar.coor[0] / unit * 10)/10 <= this.coor[0] / unit)) {
        if (Math.ceil(avatar.coor[1] / unit) == this.coor[1] / unit && Math.floor(avatar.coor[1] / unit) == this.coor[1] / unit) {
            this.pressed = 1;
            this.frames();
        } else this.pressed = 0;
    } else this.pressed = 0;
    //y

}
Button.prototype.frames = function () {
    var t = this;
    if (this.pressed) {
        clear(canvases.MCctx, this.coor);
        this.frame += 1 * this.pressed;
        if (this.frame < 3) this.draw([this.frame, 0]);
        else return;
    } else {

    }
    
    setTimeout(function () {t.frames();}, 1000);
}
Button.prototype.draw = function (a) {
    canvases.MCctx.drawImage(buttonImg, (a[0] + this.dir*3) * 100, (a[1] + this.colour) * 100, 100, 100, this.coor[0], this.coor[1], unit, unit);
}

function Ghost() {
    this.time = time; // this ghost's native direction
    this.life = [0, 1800] // lifetime = [startingFrame, endingFrame]
    this.coor1 = [0, 0]; // life began here.
    this.coor2 = [0, 0]; // life ended here.
    this.instructions = []; // [x, y, dir, inAir]
    this.frame = 0; // location in instructions
    this.waiting = false;
    this.init = function () {
        this.life[0] = frame;
        this.time = time;
        this.coor1 = [avatar.coor[0], avatar.coor[1]];
    }
    this.learn = function () {
        this.instructions.push([Math.round(avatar.coor[0]), Math.round(avatar.coor[1]), avatar.dir, avatar.inAir]);
    }
    this.draw = function (draw = true) {
        if (this.frame < 0 || this.frame >= this.instructions.length) {
            if (this.frame < 0) this.frame = 0;
            else this.frame = this.instructions.length - 1;
        }
        console.log(this.instructions.length);
        console.log(this.frame);
        var a = this.instructions[this.frame];
        console.log(a);
        if (!draw) clear(canvases.GCctx, [a[0], a[1]]);
        else canvases.GCctx.drawImage(avatar.img, step * 100, (a[2] + a[3] * 2) * 100, 100, 100, a[0], a[1], unit, unit);;
    }
    this.newFrame = function () {
        if (!this.waiting) { // ghost is waiting for a call to action.
            if (between(this.life, frame)) { // ghost exists at this time.
                this.draw(false);
                this.frame += time * this.time;
                this.draw();
            } else { // ghost does not exist.
                this.draw(false);
                this.waiting = true;
            }
        } else { // ghost DEFINITELY doesn't exist.
            if (between(this.life, frame)) { // ghost exists at this time.
                this.waiting = false;
                this.draw();
            }
        }
    }
    this.finish = function () {
        this.frame = this.instructions.length - 1;
        this.draw();
        this.life[1] = frame;
        this.coor2 = [avatar.coor[0], avatar.coor[1]];
        this.waiting = false;
    }
}

var levels = {
    size: [20, 14], // height of 14, but we will only use the top 10.
    levels: [],
    ghosts: [],
    currentLevel: 0,
    buttons: [],
    ground: new Image(),
    init: function () {
        this.ground.src = "assets/BlockTileset2.png";
        this.ground.onload = function () {
            levels.startLevel(0);
        }
    },
    addLevel: function (values, buttons) {
        this.levels.push(values);
        this.buttons = buttons;
        console.log(this.buttons);
    },
    drawLevel: function (level, side) {
        for (let i = 1; i <= this.size[0]; i++) {
            for (let j = 1; j <= this.size[1]; j++) {
                switch (this.levels[level][j][i]) {
                    case 1:
                        let blocks = [1, 1, 1, 1];
                        let l = levels.levels[level]
                        if (l[j][i - 1] == 1) blocks[1] = 0;
                        if (l[j][i + 1] == 1) blocks[0] = 0;
                        if (l[j - 1][i] == 1) blocks[2] = 0;
                        if (l[j + 1][i] == 1) blocks[3] = 0;
                        if (!blocks[1] && !blocks[2] && l[j - 1][i - 1] !== 1) canvases.BCctx.drawImage(this.ground, 400, 0, 100, 100, i * unit + side * unit * 20 - unit, j * unit - unit, unit, unit);
                        if (!blocks[0] && !blocks[2] && l[j - 1][i + 1] !== 1) canvases.BCctx.drawImage(this.ground, 400, 100, 100, 100, i * unit + side * unit * 20 - unit, j * unit - unit, unit, unit);
                        if (!blocks[0] && !blocks[3] && l[j + 1][i + 1] !== 1) canvases.BCctx.drawImage(this.ground, 400, 200, 100, 100, i * unit + side * unit * 20 - unit, j * unit - unit, unit, unit);
                        if (!blocks[1] && !blocks[3] && l[j + 1][i - 1] !== 1) canvases.BCctx.drawImage(this.ground, 400, 300, 100, 100, i * unit + side * unit * 20 - unit, j * unit - unit, unit, unit);
                        canvases.BCctx.drawImage(this.ground, (blocks[1] + 2 * blocks[0]) * 100, (blocks[2] + 2 * blocks[3]) * 100, 100, 100, i * unit + side * unit * 20 - unit, j * unit - unit, unit, unit);
                        break;
                    case 2:
                        avatar.coor = [(i - 1) * unit, (j - 1) * unit];
                        break;
                }
            }
        }
        if (levels.buttons != '') {
			for (var i = 0; i < levels.buttons.length; i++) {
				levels.buttons[i].draw([0, 0]);
			}
		}
    },
    startLevel: function (level) {
        time = 1;
        frame = 0;
        stepCounter = 0;
        levels.drawLevel(level, 0); // change 0 to 1 for animation system.
        nextGhost = new Ghost();
        nextGhost.init();

        // draw new level on right of canvas.
        // animate (css) towards new level.
        // erase previous level; redraw current level on left of canvas.
        // start game.

        levels.currentLevel = level;
    }
}



levels.addLevel([
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 2, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
],
[new Button(6, 6, 1, 0), new Button(9, 6, 0, 0)]);

/*levels.addLevel([
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
    [1, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]);*/