// Reverse Time!!

function reverseTime() {
    time *= -1;
    avatar.invincible = 2;
    setTimeout(function () {avatar.invincible = 1;}, 1300);
    setTimeout(function () {avatar.invincible = 0;}, 2000);
    nextGhost.finish();
    levels.ghosts.push(nextGhost);
    nextGhost = new Ghost();
    nextGhost.init();
	document.getElementById('splitEffect').style.width = window.innerWidth + "px";
	document.getElementById('splitEffect').style.height = window.innerWidth + "px";
	document.getElementById('splitEffect').style.opacity = '0';
	setTimeout(function () {
		document.getElementById('splitEffect').style.transitionDuration = '0s';
		document.getElementById('splitEffect').style.width = "0";
		document.getElementById('splitEffect').style.height = "0";
		document.getElementById('splitEffect').style.opacity = "1";
		setTimeout(function () {
			document.getElementById('splitEffect').style.transitionDuration = '1s';
		}, 300);
	}, 1100);
}

var r = true;
function startOver(level) {
	if (!r) return;
	document.getElementById('startEffect').style.top = "100%";
	setTimeout(function () {
		document.getElementById('startEffect').style.transitionDuration = '0s';
		document.getElementById('startEffect').style.top = unit * -15 + 'px';
		setTimeout(function () {
			document.getElementById('startEffect').style.transitionDuration = '1.5s';
			r = true;
		}, 50);
	}, 1505);
    paused = true;
    setTimeout(function () {
        clear(canvases.BCctx);
        clear(canvases.GCctx);
        clear(canvases.FCctx);
        clear(canvases.MCctx);
    }, 300);
    setTimeout(function () {
        levels.startLevel(level);
    }, 500);
}

// GameStep + animationStep loop

function stepAnimate() {
	if (!paused) {
		stepCounter++;
        /*if (avatar.action) {
		    step = stepCounter % 4;
        } else {*/
            step = Math.floor(stepCounter % 8 / 2);
        //}
        for (let i = 0; i < levels.buttons[levels.currentLevel].length; i++) {
            levels.buttons[levels.currentLevel][i].drawMechanics();
        }
	}
	setTimeout(stepAnimate, 125);
}

// Frame-by-frame animation

function animate() {
	if (!paused) {
		avatar.physics();
        frame += time;
        if (!(frame % GFuel)) { // Run the Ghosts!!
            nextGhost.learn();
            for (let g = 0; g < levels.ghosts.length; g++) {
                let ghost = levels.ghosts[g];
                ghost.newFrame();
            }
            if (levels.buttons[levels.currentLevel].length > 0) {
                for (var i = 0; i < levels.buttons[levels.currentLevel].length; i++) {
                    levels.buttons[levels.currentLevel][i].check();
                }
            }
        }
        IDs.time.innerHTML = Math.ceil(frame / 60);
	}
	raf = window.requestAnimationFrame(animate);
}