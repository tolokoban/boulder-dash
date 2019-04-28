precision mediump float;

uniform sampler2D uniTexture;
// Décalage de teinte (valeur comprise entre 0 et 1).
uniform float uniHueShift;
// Coordonnées UV pour la texture.
varying vec2 varUV;

// Déplace dans l'espace HSL une couleur qui vient du RGB.
vec4 rgb2hsl( vec4 color ) {
  float L = max( color.r, max( color.g, color.b ) );
  float m = min( color.r, min( color.g, color.b ) );
  float C = L - m;
  float H = 0.0;
  if( C > 0.0 ) {
    if( L == color.r ) {
      H = 60.0 * mod((color.g - color.b)/C , 6.0);
    }
    else if( L == color.g ) {
      H = 60.0 * mod(2.0 + (color.b - color.r)/C , 6.0);
    }
    else {
      H = 60.0 * mod(4.0 + (color.r - color.g)/C , 6.0);
    }
  }
  float S = 0.0;
  if( L > 0.0 ) {
    S = C / L;
  }
  return vec4( H, S, L, color.a );
}

// Déplace dans l'espace RGB une couleur qui vient du HSL.
vec4 hsl2rgb( vec4 color ) {
  float H = mod( color.x, 360.0 );
  float S = color.y;
  float L = color.z;
  float C = L * S;
  float X = C * ( 1.0 - abs(mod(H / 60.0, 2.0) - 1.0) );
  float R = 0.0;
  float G = 0.0;
  float B = 0.0;
  if( H < 180.0 ) {
    if( H < 60.0 ) {
      R = C;
      G = X;
    } else if( H < 120.0 ) {
      R = X;
      G = C;
    } else {
      G = C;
      B = X;
    }
  } else { // H > 180
    if( H < 240.0 ) {
      G = X;
      B = C;
    } else if( H < 300.0 ) {
      R = X;
      B = C;
    } else {
      R = C;
      B = X;
    }
  }
  float m = L - C;
  return vec4( R + m, G + m, B + m, color.a );
}


void main() {
  // Lire la couleur du pixel de la texture.
  vec4 color = texture2D( uniTexture, varUV );
  if( color.a < 0.1 ) discard;
  
  // Passer dans l'espace HSL.
  vec4 hsl = rgb2hsl( color );
  // Décaler la teinte.
  hsl.x += uniHueShift;
  // Revenir dans l'espace RGB.
  vec4 rgb = hsl2rgb( hsl );
  // La couleur du fragment doit toujours être exprimée en RGB.
  gl_FragColor = rgb;
}
