precision mediump float;
uniform sampler2D texture;

varying vec2 varUV;
varying vec2 varDimension;


void main() {
  vec4 color = texture2D( texture,
                          varUV + vec2(gl_PointCoord.x * varDimension.x,
                                       gl_PointCoord.y * varDimension.y ) );
  if( color.a < 0.8 ) discard;
  gl_FragColor = color;
}
