// Anything to do with the HTML and CSS.

// Jayden will mostly be working with this file.

var canvases = {
    BC: document.getElementById("BackgroundCanvas"),
    BCctx: undefined,
    FC: document.getElementById("FrontCanvas"),
    FCctx: undefined,
    init: function () {
        [this.BC, this.FC].forEach(function (canvas) {
            canvas.width = con.u * levels.size[2]
            canvas.height = con.u * levels.size[1];
        });
        this.BCctx = this.BC.getContext('2d');
        this.FCctx = this.FC.getContext('2d');
    }
}

function startGame() {
    canvases.init();
    avatar.init();
}

setTimeout(function () {
    startGame();
}, 1000);