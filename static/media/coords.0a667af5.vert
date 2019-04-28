// Taille réelle du canvas, en pixels.
uniform float uniWidth;
uniform float uniHeight;
// Coordonnées du centre.
uniform float uniX;
uniform float uniY;
// Profondeur.
uniform float uniZ;
// Facteur de zoom.
uniform float uniW;

vec4 getCoords(float x, float y) {
  float xx = (x - uniX) * 128.0 / uniWidth;
  float yy = (y - uniY) * 128.0 / uniHeight;
  
  return vec4( xx, -yy, uniZ, uniW );
}
