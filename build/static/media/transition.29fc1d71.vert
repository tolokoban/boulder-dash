uniform float uniTime;
uniform float uniWidth;
uniform float uniHeight;
uniform float uniDir;

attribute float attCenterX;
attribute float attX;
attribute float attY;

const float PI = 3.141592653589793;

void main() {
  float x = attCenterX + attX * uniTime;
  float y = attY;

  if( uniWidth > uniHeight ) {
    y *= uniHeight / uniWidth;
  } else {
    x *= uniWidth / uniHeight;
  }
  
  float ang = uniDir * uniTime * PI;
  float xx = x * cos(ang) - y * sin(ang);
  float yy = x * sin(ang) + y * cos(ang);
  
  gl_Position = vec4( xx, yy, 1.0, 1.0 );
}
