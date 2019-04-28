import WebGL from "./webgl"

/**
 * @param env.gl
 * @param env.assets
 * @param env.cave
 */
export default class BackgroundPainter {
    constructor(env, backgroundTexture) {
        var vertexArray = [-1, -1, +1, -1, -1, +1, +1, +1];
        this._buffVert = WebGL.fillArrayBuffer(env.gl, new Float32Array(vertexArray));

        this._prg = new WebGL.Program(env.gl, {
            vert: env.assets.backgroundVert,
            frag: env.assets.backgroundFrag
        }, {
                coords: env.assets.coordsVert
            });

        this._texture = createTexture(env.gl, backgroundTexture);
    }

    destroy() {
        var prg = this._prg;
        var gl = prg.gl;
        gl.deleteTexture(this._texture);
        gl.deleteBuffer(this._buffVert);
        prg.destroy();
    }

    //#(draw)
    /**
     * @param env.gl
     * @param env.assets
     * @param env.cave
     * @param env.time
     * @param env.width
     * @param env.height
     */
    draw(env) {
        var gl = env.gl;
        var prg = this._prg;

        prg.use();
        // Dimensions de l'écran physique.
        prg.$uniWidth = env.width;
        prg.$uniHeight = env.height;
        prg.$uniX = env.x;
        prg.$uniY = env.y;
        prg.$uniZ = env.z;
        prg.$uniW = env.w;
        // Assignation de la texture.
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        prg.$texture = 0;
        // Attributs.
        prg.bindAttribs(this._buffVert, "attX", "attY");
        // Dessin.
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    //#(draw)
}

//#(createTexture)
function createTexture(gl, img) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // On charge l'image dans la texture de la carte graphique.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    return texture;
}
