export const CLEAR_COLOR = [0, 0, 0, 1];
export const FRAME_RATE = 60;

export const CELLS_FRAGMENT_SHADER = require('../shaders/cells.fragment.glsl');
export const SCREEN_FRAGMENT_SHADER = require('../shaders/screen.fragment.glsl');
export const VERTEX_SHADER = require('../shaders/vertex.glsl');

export const FULL_VIEW_PLANE_VERTICES = [-1, 1, -1, -1, 1, 1, 1, -1];
export const FULL_PLANE_VIEW_TEX_COORDS = [0, 1, 0, 0, 1, 1, 1, 0];
