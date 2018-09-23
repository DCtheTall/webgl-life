precision mediump float;

varying vec2 v_TextureCoord;

uniform vec2 u_Resolution;
uniform sampler2D u_PreviousFrame;

void main() {
  gl_FragColor = texture2D(u_PreviousFrame, v_TextureCoord);
}
