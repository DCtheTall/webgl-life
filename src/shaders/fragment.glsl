precision mediump float;

varying vec2 v_TextureCoord;

uniform vec2 u_Resolution;
uniform sampler2D u_PreviousFrame;

#pragma glslify: getPreviousCellIsAlive = require('./lib/get-previous-cell-is-alive.glsl', getPreviousCellIsAlive=getPreviousCellIsAlive);
#pragma glslify: getNumberOfNeighbors = require('./lib/get-number-of-neighbors.glsl');

/*
Get if a cell is alive this current generation
*/
bool getCellIsAlive(
  sampler2D previousFrame,
  vec2 textureCoord,
  vec2 resolution
) {
  bool wasAlive = getPreviousCellIsAlive(previousFrame, textureCoord);
  int neighbors = getNumberOfNeighbors(previousFrame, textureCoord, resolution);
  if (wasAlive) {
    return neighbors == 2 || neighbors == 3;
  }
  return neighbors == 3;
}

void main() {
  gl_FragColor = vec4(
    vec3(getCellIsAlive(u_PreviousFrame, v_TextureCoord, u_Resolution)), 1.);
}
