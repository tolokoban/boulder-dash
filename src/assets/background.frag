precision mediump float;
uniform sampler2D texture;

varying vec2 varUV;

void main() {
  vec4 color = texture2D( texture, varUV );
  gl_FragColor = color;
}
