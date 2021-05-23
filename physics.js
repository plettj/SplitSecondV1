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
		avatar.physics();
	}
	raf = window.requestAnimationFrame(animate);
}