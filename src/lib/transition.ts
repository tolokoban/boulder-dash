import WebGL from "./webgl"


export default class Transition {
    constructor(gl, assets) {
        var data = this.createData();
        this._buffVert = WebGL.fillArrayBuffer(gl, data);
        this._prg = new WebGL.Program(gl, {
            vert: assets.transitionVert,
            frag: assets.transitionFrag
        });
        this._gl = gl;
        this._mode = 0;
    }

    /**
     * On va créer des rectangles noirs qui vont  s'épaissir jusqu'à remplir l'écran.
     * Le Z sera fixé à 1 et on affichera les rectangles avant tout le reste.
     */
    private createData() {
        var data = [];
        // Nombre de rectangles par demi-espace.
        // Si n vaut 1, on aura deux rectangles symétriques par rapport à l'axe vertical qui vont chacun
        // remplir leur demi-espace respectif.
        var n = 4;
        // Comme on veut fair eune rotation, il faut que  la largeur soit au moins égale à la diagoinale
        // d'un carré de largeur 1. D'où le racine de 2.
        var radius = Math.sqrt(3);

        var k, centerX;
        var size = radius / (2 * n);
        for (k = 0; k < n; k++) {
            centerX = radius * (0.5 + k) / n;
            data.push(
                centerX, -size, -10,
                centerX, -size, +10,
                centerX, +size, +10,
                centerX, +size, +10,
                centerX, +size, -10,
                centerX, -size, -10
            );
            data.push(
                -centerX, -size, -10,
                -centerX, -size, +10,
                -centerX, +size, +10,
                -centerX, +size, +10,
                -centerX, +size, -10,
                -centerX, -size, -10
            );
        }
        this._count = 12 * n;
        return new Float32Array(data);
    }

    draw(time, width, height) {
        var dir = 1;

        switch (this._mode) {
            case 0:
                return;
            case 1:
                this._time = time;
                this._mode = 2;
                return;
            case 2:
                time = (time - this._time) / this._duration;
                if (time > 1) {
                    time = 1;
                    this._mode = 3;
                }
                break;
            case 3:
                if (typeof this._action === 'function') {
                    this._action();
                }
                this._time = time;
                this._mode = 4;
                time = 1;
                break;
            case 4:
                time = 1 - (time - this._time) / this._duration;
                if (time < 0) {
                    this._mode = 0;
                    time = 0;
                } else {
                    dir = -1;
                }
                break;
        }

        var gl = this._gl;
        var prg = this._prg;

        prg.use();
        prg.$uniDir = dir;
        prg.$uniTime = time;
        prg.$uniWidth = width;
        prg.$uniHeight = height;

        prg.bindAttribs(this._buffVert, "attCenterX", "attX", "attY");
        gl.drawArrays(gl.TRIANGLES, 0, this._count);
    }

    /**
     * L'écran devient noir, une action est déclenchée et l'écran s'éclaircit à nouveau.
     *
     * @param {function} action - Fonction à appeler quand l'écran est entièrement noir.
     * @param {number} duration - Nombre de millisecondes que dure la transition.
     */
    start(action, duration) {
        this._action = action;
        this._duration = duration;
        this._mode = 1;
    }
}
