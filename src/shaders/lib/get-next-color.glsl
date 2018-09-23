const vec3 BLACK = vec3(0.);
const vec3 WHITE = vec3(1.);
const vec3 WARM_BLUE = vec3(.6, 1., .8);
const vec3 GREEN = vec3(.6, 1., .2);
const vec3 DULL_GREEN = vec3(.4, .5, .0);

vec3 getNextColor(
  bool alive,
  sampler2D previousFrame,
  vec2 textureCoord
) {
  if (!alive) return BLACK;
  vec3 prevColor = texture2D(previousFrame, textureCoord).xyz;
  if (prevColor == BLACK) {
    return WHITE;
  } else if (prevColor == WHITE) {
    return WARM_BLUE;
  } else if (prevColor == WARM_BLUE) {
    return GREEN;
  }
  return DULL_GREEN;
}

#pragma glslify: export(getNextColor);
