// Runs and computes all the physics of the game.

// GameStep + animationStep loop
function stepAnimate() {
	if (!paused) {
		stepCounter++;
		step = stepCounter % 4;
	}
	setTimeout(stepAnimate, 250);
}

// Frame-by-frame animation
function animate() {
	if (!paused) {
		avatar.physics();
	}
	raf = window.requestAnimationFrame(animate);
}