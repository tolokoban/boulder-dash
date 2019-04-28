attribute float attX;
attribute float attY;

varying vec2 varUV;

void main() {
  varUV = vec2( attX, attY );
  float x = attX * 2.0 - 1.0;
  float y = 1.0 - attY * 2.0;
  gl_Position = vec4( x, y, 0.0, 1.0 );
}
