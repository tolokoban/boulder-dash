import WebGL from "./webgl"
import { IEnvironment } from "../types"

/**
 * @param env.gl
 * @param env.assets
 * @param env.cave
 */
export default class RainPainter {
    constructor(env: IEnvironment) {
        this._env = env;
        var data = getData();
        console.info("[rain-painter] data=", data);
        this._count = data.length / 6;
        this._buffVert = WebGL.fillArrayBuffer(env.gl, new Float32Array(data));

        this._prg = new WebGL.Program(env.gl, {
            vert: env.assets.rainVert,
            frag: env.assets.rainFrag
        });

        this._texture = createTexture(env.gl, env.assets.diamTexture);
    }

    //#(destroy)
    destroy() {
        var prg = this._prg;
        var gl = prg.gl;
        gl.deleteTexture(this._texture);
        gl.deleteBuffer(this._buffVert);
        prg.destroy();
    }
    //#(destroy)

    // Pousser le VertexArray dans la carte graphique.
    update() {
        var env = this._env;
        var gl = env.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffVert);
        gl.bufferData(gl.ARRAY_BUFFER, env.level.data, gl.STATIC_DRAW);
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
        prg.$uniTime = env.time;
        // Assignation de la texture.
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        prg.$uniTexture = 0;
        // Attributs.
        prg.bindAttribs(this._buffVert, "attX", "attY", "attZ", "attW", "attSpeed", "attIndex");
        // Dessin.
        gl.drawArrays(gl.POINTS, 0, this._count);
    }
    //#(draw)
}

//#(createTexture)
function createTexture(gl, img) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // On charge l'image dans la texture de la carte graphique.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    return texture;
}
//#(createTexture)

function getData() {
    var data = [];
    var k, z, radius;
    for (z = 1; z > .5; z -= 0.05) {
        radius = 2 / z;
        for (k = 0; k < 50; k++) {
            data.push(
                radius * Math.random() - radius / 2,  // X
                radius * Math.random() - radius / 2,  // Y
                z, // Z
                1 / z, // W
                Math.random(), // Speed
                Math.random() // Index
            );
        }
    }
    return data;
}
