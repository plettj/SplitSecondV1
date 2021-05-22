// Handles all the objects and whatnot of the game

// Josiah will mainly be working with this file.

var avatar = {
    coor: [0, 0], // position of the avatar.
    xv: 20, // max speed.
    xa: [4, 1], // max acceleration: [ground, air].
    yv: 35, // jump speed.
    size: [40, 40], // size of the avatar.
    img: new Image(),
    init: function () {
        this.img.src = "assets/AvatarTilesetReal.png";
        // just a tester drawing.
        this.img.onload = function () {
            avatar.draw([1, 0]);
            console.log("I TRIED TO DRAW THE AVATAR");
        }
    },
    draw: function (a) { // a: [xOnTileset, yOnTileset]
        // STILL NEED TO CLEAR
        console.log(this.img);
        canvases.FCctx.drawImage(this.img, a[0] * 128, a[1] * 128, 128, 128, this.coor[0], this.coor[1], con.u, con.u);
    }
}

var levels = {
    size: [60, 20]
}