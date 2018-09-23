import {
  VERTEX_SHADER,
  FRAGMENT_SHADER,
  FULL_VIEW_PLANE_VERTICES,
  FULL_PLANE_VIEW_TEX_COORDS,
} from './lib/constants';
import Scene from './lib/Scene';
import RenderFrame from './lib/RenderFrame';
import Shader from './lib/Shader';


function initCanvasWithNoise(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const context = canvas.getContext('2d');
  for (let i = 0; i < canvas.width; i++) {
    for (let k = 0; k < canvas.height; k++) {
      context.fillStyle = Math.random() > .5 ? '#000' : '#fff';
      context.fillRect(i, k, 1, 1);
    }
  }
  return canvas;
}


function savePreviousFrameAsTexture(
  scene: Scene,
  canvas: HTMLCanvasElement = initCanvasWithNoise(),
) {
  scene.initTexture('previousFrame', canvas);
}


document.body.onload = function main() {
  const canvas =
    <HTMLCanvasElement>document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const scene = new Scene(canvas);
  savePreviousFrameAsTexture(scene);

  scene.setRenderFrame('main', () => new RenderFrame({
    gl: scene.gl,
    width: canvas.width,
    height: canvas.height,
    nVertices: 4,
    clearBeforeRender: false,
    shader: new Shader({
      gl: scene.gl,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      attributes: {
        aVertexPosition: {
          locationName: 'a_VertexPosition',
          data: FULL_VIEW_PLANE_VERTICES,
          type: Shader.Types.VECTOR2,
        },
        aTextureCoord: {
          locationName: 'a_TextureCoord',
          data: FULL_PLANE_VIEW_TEX_COORDS,
          type: Shader.Types.VECTOR2,
        },
      },
      uniforms: {
        uResolution: {
          locationName: 'u_Resolution',
          data: [canvas.width, canvas.height],
          type: Shader.Types.VECTOR2,
        },
        uPreviousFrame: {
          locationName: 'u_PreviousFrame',
          data: 0,
          type: Shader.Types.INTEGER,
        },
      },
    }),
  }));

  scene.render({
    animate: false,
    draw({ firstRender }) {
      scene.gl.activeTexture(scene.gl.TEXTURE0);
      scene.gl.bindTexture(
        scene.gl.TEXTURE_2D, scene.getTexture('previousFrame'));
      scene.getRenderFrame('main').render(firstRender);
      savePreviousFrameAsTexture(scene, canvas);
    },
  });
};
