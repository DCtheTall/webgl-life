#pragma glslify: getPreviousCellIsAlive = require('./get-previous-cell-is-alive.glsl');

/*
Get the number of alive neighbors a cell had last round
*/
int getNumberofNeighbors(
  sampler2D previousFrame,
  vec2 textureCoord,
  vec2 resolution
) {
  vec2 ds = 1. / resolution;
  int neighbors = 0;

  for (int i = -1; i < 2; i++) {
    for (int k = -1; k < 2; k++) {
      if (i == 0 && k == 0) continue;
      neighbors += int(getPreviousCellIsAlive(
        previousFrame,
        textureCoord + vec2((float(i) * ds.x), (float(k) * ds.y))
      ));
    }
  }

  return neighbors;
}

#pragma glslify: export(getNumberofNeighbors);
