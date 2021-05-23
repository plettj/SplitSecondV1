// Anything to do with the HTML and CSS.
let unit = Math.ceil(window.innerWidth / 20); // unit = 1/20 of the screen width
document.body.style.setProperty("--unit", unit + 'px');
document.body.style.setProperty("--pixel", unit/10 + 'px');
var pauseBtn = document.getElementById('pauseBtn');

// Jayden will mostly be working with this file.

function show(ID) {
    document.getElementById(ID).style.display = "block";
}
function hide(ID) {
    document.getElementById(ID).style.display = "none";
}

function pause() {
    paused = !paused;
    if (paused) {
        show('modal1');
        pauseBtn.src = "assets/xBtn.png";
    } else {
        hide('modal1');
        pauseBtn.src = "assets/pauseBtn.png";
    }
}

var canvases = {
    BC: document.getElementById("BackgroundCanvas"),
    BCctx: undefined,
    FC: document.getElementById("FrontCanvas"),
    FCctx: undefined,
    MC: document.getElementById("MechanicsCanvas"),
    MCctx: undefined,
    init: function () {
        [this.BC, this.FC, this.MC].forEach(function (canvas) {
            canvas.width = unit * levels.size[0]
            canvas.height = unit * levels.size[1];
        });
        
        this.BCctx = this.BC.getContext('2d');
        this.FCctx = this.FC.getContext('2d');
        this.MCctx = this.MC.getContext('2d');
    }
}

function startGame() {
    canvases.init();
    avatar.init();
    levels.init();
    setTimeout(function () {
        animate();
        stepAnimate();
    }, 1000);
    canvases.BC.style.backgroundColor = "#08071a";
}

setTimeout(function () {
    startGame();
}, 1000);