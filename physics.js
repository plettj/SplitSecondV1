// Runs and computes all the physics of the game.



// GameStep + animationStep loop
function stepAnimate() {
	if (!paused) {
		stepCounter++;
        if (avatar.action) {
		    step = stepCounter % 4;
        } else {
            step = Math.floor(stepCounter % 8 / 2);
        }
	}
	setTimeout(stepAnimate, 125);
}

// Frame-by-frame animation
function animate() {
	if (!paused) {
		if (levels.buttons != '') {
			for (var i = 0; i < levels.buttons.length; i++) {
				levels.buttons[i].check();
			}
		}
		avatar.physics();
	}
	raf = window.requestAnimationFrame(animate);
}