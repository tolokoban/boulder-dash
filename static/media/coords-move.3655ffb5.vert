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
// Temps.
uniform float uniTime;
// Temps em ms pour parcourir une cellule.
uniform float uniCellTime;

attribute float attX;
attribute float attY;
attribute float attVx;
attribute float attVy;

vec4 getCoords() {
  float t = mod( uniTime, uniCellTime ) / uniCellTime;
  float xx = (attX + t * attVx - uniX) * 128.0 / uniWidth;
  float yy = (attY + t * attVy - uniY) * 128.0 / uniHeight;
  
  return vec4( xx, -yy, uniZ, uniW );
}
