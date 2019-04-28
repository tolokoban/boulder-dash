uniform float uniWidth;
uniform float uniHeight;
uniform float uniX;
uniform float uniY;
uniform float uniZ;
uniform float uniW;

attribute float attX;
attribute float attY;

varying vec2 varUV;

const float SPEED = 0.02;
void main() {
  float u = uniX * SPEED + attX * uniWidth / (2048.0 + uniW);
  float v = uniY * SPEED - attY * uniHeight / (2048.0 + uniW);
  varUV = vec2( u, v );
  gl_Position = vec4( attX, attY, uniZ, 1.0 );
}
