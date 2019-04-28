import WebGL from "./webgl"

//#(tinter)
class Tinter {
    private _prg: {};
    private _buffVert: {};
    private _texture: WebGLTexture;
    private _gl: WebGLRenderingContext;

    constructor(vert: string, frag: string) {
        var canvas = document.createElement("canvas");
        var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
        this._prg = new WebGL.Program(gl, { vert: vert, frag: frag });
        // Les coordonnées UV de la texture.
        var vertexArray = [0, 0, 1, 0, 0, 1, 1, 1];
        this._buffVert = WebGL.fillArrayBuffer(gl, new Float32Array(vertexArray));

        this._texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this._canvas = canvas;
        this._gl = gl;
    }

    // Prend en entrée une image et une valeur comprise entre 0 et 359.
    // Retourne un canvas avec l'image en question après décalage de
    // sa teinte.
    shiftHue(img, shift) {
        // Soyons sûr d'avoir un paramètre correct en entrée.
        if (typeof shift !== 'number' || isNaN(shift)) return img;

        var canvas = this._canvas;
        var prg = this._prg;
        var gl = this._gl;

        prg.use();
        // Appliquer la taille de l'image à notre canvas.
        var width = img.width;
        var height = img.height;
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        gl.viewport(0, 0, width, height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Charger la texture avec l'image courante.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        prg.$uniTexture = 0;
        // Définir le décalage de teinte.
        prg.$uniHueShift = shift;
        // Attributs.
        prg.bindAttribs(this._buffVert, "attX", "attY");
        // Dessin du rectangle.
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Créer le canvas à retourner. Il a la même taille
        // que l'image d'entrée.
        var output = document.createElement("canvas");
        output.setAttribute("width", width);
        output.setAttribute("height", height);
        // Un context 2D suffit.
        var ctx = output.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        // On y copie le contenu actuel du canvas WebGL.
        ctx.drawImage(canvas, 0, 0, width, height);

        return output;
    }

    // Pour faire le ménage.
    destroy() {
        var prg = this._prg;
        var gl = prg.gl;
        gl.deleteTexture(this._texture);
        gl.deleteBuffer(this._buffVert);
        prg.destroy();
    }
    //#(tinter)
}

const f = function(assets, tint) {
    if (typeof tint === 'undefined') tint = {};

    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", 1024);
    canvas.setAttribute("height", 384);
    var ctx = canvas.getContext("2d");

    var tinter = new Tinter(assets.hueVert, assets.hueFrag);
    ctx.drawImage(assets.heroTexture, 0, 0);
    ctx.drawImage(tinter.shiftHue(assets.boulderTexture, tint.rock), 0, 64);
    ctx.drawImage(tinter.shiftHue(assets.diamTexture, tint.diam), 0, 128);
    ctx.drawImage(tinter.shiftHue(assets.groundTexture, tint.dust), 0, 192);
    ctx.drawImage(tinter.shiftHue(assets.exitTexture, tint.exit), 80, 192);
    ctx.drawImage(tinter.shiftHue(assets.exploTexture, tint.expl), 512, 192);
    ctx.drawImage(tinter.shiftHue(assets.monsterTexture, tint.mons), 0, 320);
    tinter.destroy();

    // Retourner le héro image par image.
    ctx.scale(-1, 1);
    for (var k = 0; k < 8; k++) {
        ctx.drawImage(
            assets.heroTexture, 64 * k, 0, 64, 64,
            -576 - 64 * k, 0, 64, 64);
    }

    return canvas;
};
f.Tinter = Tinter;

export default f;
