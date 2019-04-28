import WebGL from "./webgl"
import Level from "./level"

  /**
   * @param env.gl
   * @param env.assets
   * @param env.level
   */
export default class WallPainter {
    constructor( env, wallTexture ) {
    var level = env.level.clone();
    var arrays = getArrays( level );
    var vertexArray = arrays.vertex;
    var elementArray = arrays.element;

    this._count = elementArray.length;
    this._buffVert = WebGL.fillArrayBuffer( env.gl, new Float32Array( vertexArray ) );
    this._buffElem = WebGL.fillElementBuffer( env.gl, new Uint16Array( elementArray ) );

    this._prg = new WebGL.Program( env.gl, {
      vert: env.assets.wallVert,
      frag: env.assets.wallFrag
    }, {
      coords: env.assets.coordsVert
    });

    this._texture = createTexture( env.gl, wallTexture );
  }

  destroy() {
    var prg = this._prg;
    var gl = prg.gl;
    gl.deleteTexture( this._texture );
    gl.deleteBuffer( this._buffVert );
    gl.deleteBuffer( this._buffElem );
    prg.destroy();
  }

  //#(draw)
  /**
   * @param env.gl
   * @param env.assets
   * @param env.level
   * @param env.time
   * @param env.width
   * @param env.height
   */
 draw( env ) {
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
    gl.bindTexture(gl.TEXTURE_2D, this._texture );
    prg.$texture = 0;
    // Attributs.
    prg.bindAttribs( this._buffVert, "attX", "attY" );
    // Dessin.
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this._buffElem );
    gl.drawElements( gl.TRIANGLES, this._count, gl.UNSIGNED_SHORT, 0 );
  }
  //#(draw)
}

  //#(createTexture)
  function createTexture( gl, img ) {
    var texture = gl.createTexture( );
    gl.bindTexture( gl.TEXTURE_2D, texture );
    // Pour pouvoir utiliser gl.REPEAT, il faut obligatoirement
    // que les dimensions de la texture soient en puissance de 2.
    // Par exemple, 64x64, 128x128, 256x256, 512x512, ...
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    // On charge l'image dans la texture de la carte graphique.
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img );
    return texture;
  }
  //#(createTexture)

  //#(getArrays)
  function getArrays( level ) {
    var cache = {};
    var rows = level.rows;
    var cols = level.cols;
    var col, row;
    var vertexArray = [];
    var elementArray = [];

    function addVertex( col, row ) {
      var key = row + "-" + col;
      var idx = cache[key];
      if( typeof idx === 'undefined' ) {
        // C'est un nouveau vertex.
        idx = Math.floor( vertexArray.length / 2 );
        vertexArray.push( col - .5, row - .5 );
        cache[key] = idx;
      }
      elementArray.push( idx );
    }

    var ww, hh;
    for( row = 0; row < rows; row++ ) {
      for( col = 0; col < cols; col++ ) {
        if( level.getType( col, row ) === Level.WALL ) {
          var countRight = countWallToRight( level, col, row );
          var countBottom = countWallToBottom( level, col, row );
          if( countRight > countBottom ) {
            ww = countRight;
            hh = 1;
          } else {
            ww = 1;
            hh = countBottom;
          }
          addVertex( col, row );
          addVertex( col + ww, row );
          addVertex( col + ww, row + hh );
          addVertex( col, row );
          addVertex( col, row + hh );
          addVertex( col + ww, row + hh );
          clear( level, col, row, hh, ww );
        }
      }
    }

    return {
      vertex: vertexArray, element: elementArray
    };
  }

  function countWallToRight( level, col, row ) {
    var count = 1;
    col++;
    while( col < level.cols ) {
      if( level.getType( col, row ) !== Level.WALL ) break;
      col++;
      count++;
    }
    return count;
  }

  function countWallToBottom( level, col, row ) {
    var count = 1;
    row++;
    while( row < level.rows ) {
      if( level.getType( col, row ) !== Level.WALL ) break;
      row++;
      count++;
    }
    return count;
  }

  function clear( level, cc, rr, hh, ww ) {
    var row, col;
    for( row = rr ; row < rr + hh ; row++ ) {
      for( col = cc ; col < cc + ww ; col++ ) {
        level.setType( col, row, Level.VOID );
      }
    }
  }
