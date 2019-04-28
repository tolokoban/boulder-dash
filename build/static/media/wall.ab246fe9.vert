// On inclut la fonction getCoords().
#include "coords"

attribute float attX;
attribute float attY;

varying vec2 varUV;

void main() {
  // Les coordonnées UV d'une texture sont comprises
  // entre 1 et 0. Si on veut que notre texture s'étale
  // sur 8 cellules, il faut diviser les coordonnées par 8.  
  varUV = vec2( attX, attY ) * 0.125; // 1/8 = 0.125
  gl_Position = getCoords( attX, attY );
}
