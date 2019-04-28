const float cstW = 1024.0;
const float cstH = 384.0;
const vec2 cstDim64x64 = vec2(64.0 / cstW, 64.0 / cstH);
const vec2 cstDim80x80 = vec2(80.0 / cstW, 80.0 / cstH);
const vec2 cstHeroUV = vec2( 0.0, 0.0 );
const vec2 cstRockUV = vec2( 0.0, 64.0 / cstH );
const vec2 cstDiamUV = vec2( 0.0, 128.0 / cstH );
const vec2 cstDustUV = vec2( 0.0, 192.0 / cstH );
const vec2 cstMonsUV = vec2( 0.0, 320.0 / cstH );
const vec2 cstExitUV = vec2( 80.0 / cstW, 192.0 / cstH );
const vec2 cstExplUV = vec2( 512.0 / cstW, 192.0 / cstH );

attribute float attType;
attribute float attX;
attribute float attY;
attribute float attVX;
attribute float attVY;
attribute float attIndex;

uniform float uniTime;
uniform float uniWidth;
uniform float uniHeight;
uniform float uniX;
uniform float uniY;
uniform float uniZ;
uniform float uniW;
uniform float uniCellTime;

varying vec2 varUV;
varying vec2 varDimension;


void drawRock() {
  gl_Position.z = 0.5;
  gl_PointSize = 64.0 / uniW;
  varDimension = cstDim64x64;
  float shift = floor( mod( attIndex, 16.0 ) ) / 16.0;
  varUV = cstRockUV + vec2( shift, 0.0 );
}

void drawHero() {
  gl_Position.z = 0.8;
  gl_PointSize = 64.0 / uniW;
  varDimension = cstDim64x64;
  float index = floor( mod( uniTime * 0.02, 8.0 ) );
  float shift = 0.5 * attIndex + index / 16.0;
  varUV = cstHeroUV + vec2(shift, 0.0);
}

void drawMons() {
  gl_Position.z = 0.4;
  gl_PointSize = 64.0 / uniW;
  varDimension = cstDim64x64;
  float index = floor( mod( uniTime * 0.01, 8.0 ) );
  float shift = index / 16.0;
  if( attIndex > 1.0 ) {
    shift += 0.5;
  }
  varUV = cstMonsUV + vec2(shift, 0.0);
}

void drawDiam() {
  gl_Position.z = 0.6;
  gl_PointSize = 64.0 / uniW;
  varDimension = cstDim64x64;
  float index = floor( mod( attIndex + uniTime * 0.02, 16.0 ) );
  float shift = index / 16.0;
  varUV = cstDiamUV + vec2(shift, 0.0);
}

void drawExpl() {
  gl_Position.z = 0.91;
  gl_PointSize = 64.0 / uniW;
  varDimension = cstDim64x64;
  // L'explosion dure deux cycles.
  float index = floor( 4.0 * mod( uniTime, 2.0 * uniCellTime ) / uniCellTime );
  float shift = index / 16.0;
  varUV = cstExplUV + vec2(shift, 0.0);
}

void drawDust() {
  gl_Position.z = 0.7;
  gl_PointSize = 80.0 / uniW;
  varDimension = cstDim80x80;
  varUV = cstDustUV;
}

void drawExit() {
  gl_Position.z = 0.9;
  gl_PointSize = 80.0 / uniW;
  varDimension = cstDim80x80;
  varUV = cstExitUV;
}



void main() {
  if( attType < 2.0 ) {
    // Cellules à ne pas afficher : vides et murs.
    gl_PointSize = 0.0;
    return;
  }

  // Déterminer les coordonnées.
  float t = mod( uniTime, uniCellTime ) / uniCellTime;
  float xx = (attX + t * attVX - uniX) * 128.0 / uniWidth;
  float yy = (attY + t * attVY - uniY) * 128.0 / uniHeight;  
  gl_Position = vec4( xx, -yy, uniZ, uniW );

  // Affichage en fonction du type de cellule.
  if( attType < 2.1 ) drawHero();
  else if( attType < 3.1 ) drawDust();
  else if( attType < 4.1 ) drawRock();
  else if( attType < 5.1 ) drawDiam();
  else if( attType < 6.1 ) drawExit();
  else if( attType < 7.1 ) drawExpl();
  else if( attType < 8.1 ) drawExpl();
  else if( attType < 9.1 ) drawMons();
}
