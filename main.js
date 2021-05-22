// Anything to do with the HTML and CSS.
let unit = Math.floor(window.innerWidth / 160) * 8; // unit = 1/20 of the screen width
document.body.style.setProperty("--unit", unit + 'px');
document.body.style.setProperty("--pixel", unit/10 + 'px');

// Jayden will mostly be working with this file.

function show(ID) {
    document.getElementById(ID).style.display = "block";
}
function hide(ID) {
    document.getElementById(ID).style.display = "none";
}

var canvases = {
    BC: document.getElementById("BackgroundCanvas"),
    BCctx: undefined,
    FC: document.getElementById("FrontCanvas"),
    FCctx: undefined,
    init: function () {
        [this.BC, this.FC].forEach(function (canvas) {
            canvas.width = unit * levels.size[0]
            canvas.height = unit * levels.size[1];
        });
        this.BCctx = this.BC.getContext('2d');
        this.FCctx = this.FC.getContext('2d');
    }
}

function startGame() {
    canvases.init();
    avatar.init();
    animate();
    stepAnimate();
    canvases.FC.style.backgroundColor = "#08071a";
}

setTimeout(function () {
    startGame();
}, 1000);