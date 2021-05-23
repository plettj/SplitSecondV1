// Reverse Time!!

function reverseTime() {
    time *= -1;
    nextGhost.finish();
    levels.ghosts.push(nextGhost);
    nextGhost = new Ghost();
    nextGhost.init();
    // Jayden gets to use this to animate when time switches :)
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
            if (levels.buttons != '') {
                for (var i = 0; i < levels.buttons[levels.currentLevel].length; i++) {
                    levels.buttons[levels.currentLevel][i].check();
                }
            }
        }
        IDs.time.innerHTML = Math.ceil((frame - 1800) / -60) + "s";
	}
	raf = window.requestAnimationFrame(animate);
}