/*
Detect if a cell was alive or dead last round
*/
bool getPreviousCellIsAlive(
  sampler2D previousFrame,
  vec2 textureCoord
) {
  vec4 cellColor = texture2D(previousFrame, textureCoord);
  return cellColor.x != 0.;
}

#pragma glslify: export(getPreviousCellIsAlive);
