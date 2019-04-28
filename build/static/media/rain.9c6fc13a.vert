uniform float uniTime;

attribute float attX;
attribute float attY;
attribute float attZ;
attribute float attW;

attribute float attSpeed;
attribute float attIndex;

varying float varU;
varying float varZ;
varying float varHueShift;

void main() {
  varZ = attZ;
  varU = floor( mod( 16.0 * attIndex + uniTime * 0.02, 16.0 ) ) * 0.0625;
  varHueShift = attIndex * 360.0;
  float z = 1.0 - (1.0 - varZ) * 2.0;
  float speed = z * (4.0 + attSpeed) * 0.00002;
  float y = mod(uniTime * speed + attY, 2.2 * attW) - 1.1 * attW;
  gl_Position = vec4( attX, y, attZ, 1.0 / attW );
  gl_PointSize = 64.0 * attZ;
}
