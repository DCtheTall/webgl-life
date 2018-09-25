import {
  VERTEX_SHADER,
  CELLS_FRAGMENT_SHADER,
  SCREEN_FRAGMENT_SHADER,
  FULL_PLANE_VIEW_TEX_COORDS,
  FULL_VIEW_PLANE_VERTICES,
} from './lib/constants';
import Scene from './lib/Scene';
import RenderFrame from './lib/RenderFrame';
import Shader, { ShaderAttribute, ShaderUniform } from './lib/Shader';


const PLAY_SYMBOL = '&#9658;';
const PAUSE_SYMBOL = '&#10074;&#10074;';
const BLACK = '#000';
const WHITE = '#fff';

const vertexShaderAttributes = <{ [index: string]: ShaderAttribute }>{
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
};

const screenShaderUniforms = <{ [index: string]: ShaderUniform }>{
  uCurrentFrame: {
    locationName: 'u_CurrentFrame',
    data: 0,
    type: Shader.Types.INTEGER,
  },
};

function cellsShaderUniforms(
canvas: HTMLCanvasElement,
): { [index:string]: ShaderUniform } {
  return {
    uPreviousFrame: {
      locationName: 'u_PreviousFrame',
      data: 0,
      type: Shader.Types.INTEGER,
    },
    uResolution: {
      locationName: 'u_Resolution',
      data: [canvas.width, canvas.height],
      type: Shader.Types.VECTOR2,
    },
  };
}


function initCanvasWithNoise(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const context = canvas.getContext('2d');
  for (let i = 0; i < canvas.width; i++) {
    for (let k = 0; k < canvas.height; k++) {
      context.fillStyle = Math.random() > .5 ? BLACK : WHITE;
      context.fillRect(i, k, 1, 1);
    }
  }
  return canvas;
}


function initRenderFrames(scene: Scene): RenderFrame[] {
  const cellsShader = new Shader({
    gl: scene.gl,
    vertexShader: VERTEX_SHADER,
    fragmentShader: CELLS_FRAGMENT_SHADER,
    attributes: vertexShaderAttributes,
    uniforms: cellsShaderUniforms(scene.canvas),
  });

  return [
    new RenderFrame({ // Screen
      gl: scene.gl,
      width: scene.canvas.width,
      height: scene.canvas.height,
      nVertices: 4,
      shader: new Shader({
        gl: scene.gl,
        vertexShader: VERTEX_SHADER,
        fragmentShader: SCREEN_FRAGMENT_SHADER,
        attributes: vertexShaderAttributes,
        uniforms: screenShaderUniforms,
      }),
    }),
    new RenderFrame({ // Cell frames
      gl: scene.gl,
      width: scene.canvas.width,
      height: scene.canvas.height,
      renderToTexture: true,
      nVertices: 4,
      shader: cellsShader,
    }),
    new RenderFrame({
      gl: scene.gl,
      width: scene.canvas.width,
      height: scene.canvas.height,
      renderToTexture: true,
      nVertices: 4,
      shader: cellsShader,
    }),
  ];
}


function firstRender(
  scene: Scene,
  incrementGeneration: () => number,
) {
  scene.initTexture('initialFrame', initCanvasWithNoise());
  scene.render({
    animate: false,
    draw({ firstRender }) {
      scene.gl.activeTexture(scene.gl.TEXTURE0);
      scene.gl.bindTexture(
        scene.gl.TEXTURE_2D, scene.getTexture('initialFrame'));
      scene.getRenderFrame('currentCells').render(firstRender);
      scene.gl.bindTexture(
        scene.gl.TEXTURE_2D, scene.getRenderFrame('currentCells').texture);
      scene.getRenderFrame('screen').render(firstRender);
      incrementGeneration();
    },
  });
}


function render(
  scene: Scene,
  incrementGeneration: () => number,
) {
  scene.render({
    animate: true,
    draw({ firstRender }) {
      const currentCells = scene.getRenderFrame('currentCells');
      const previousCells = scene.getRenderFrame('previousCells');
      // Overwrite previous cells while using current frame as the last generation
      scene.gl.activeTexture(scene.gl.TEXTURE0);
      scene.gl.bindTexture(
        scene.gl.TEXTURE_2D, currentCells.texture);
      previousCells.render(firstRender);
      scene.gl.bindTexture(
        scene.gl.TEXTURE_2D, previousCells.texture);
      scene.getRenderFrame('screen').render(firstRender);
      scene.setRenderFrame('currentCells', previousCells);
      scene.setRenderFrame('previousCells', currentCells);
      incrementGeneration();
    },
  });
}


document.body.onload = function main() {
  const canvas =
    <HTMLCanvasElement>document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const scene = new Scene(canvas);
  let generation = 0;
  let stopped = true;

  const generationDisplay =
    <HTMLDivElement>document.getElementById('generation');
  const incrementGeneration = () =>
    ((generationDisplay.innerHTML =
      `Generation ${generation += 1}`) && generation);

  const toggleAnimationButton =
    <HTMLButtonElement>document.getElementById('toggle-anim');
  toggleAnimationButton.addEventListener('click', () => {
    if (stopped) {
      render(scene, incrementGeneration);
    } else {
      scene.toggleAnimation();
    }
    toggleAnimationButton.innerHTML =
      scene.getIsAnimating() ? PAUSE_SYMBOL : PLAY_SYMBOL;
  });

  const resetButton = <HTMLButtonElement>document.getElementById('reset');
  resetButton.addEventListener('click', () => {
    if (scene.getIsAnimating()) scene.toggleAnimation();
    generation = 0;
    toggleAnimationButton.innerHTML = PLAY_SYMBOL;
    stopped = true;
    firstRender(scene, incrementGeneration);
  });

  const [
    screenFrame,
    cellsFrame0,
    cellsFrame1,
  ] = initRenderFrames(scene);
  scene.setRenderFrame('screen', screenFrame);
  scene.setRenderFrame('previousCells', cellsFrame0);
  scene.setRenderFrame('currentCells', cellsFrame1);

  firstRender(scene, incrementGeneration);
}

// import {
//   VERTEX_SHADER,
//   FRAGMENT_SHADER,
//   FULL_VIEW_PLANE_VERTICES,
//   FULL_PLANE_VIEW_TEX_COORDS,
// } from './lib/constants';
// import Scene from './lib/Scene';
// import RenderFrame from './lib/RenderFrame';
// import Shader from './lib/Shader';

// const PLAY_SYMBOL = '&#9658;';
// const PAUSE_SYMBOL = '&#10074;&#10074;';
// const BLACK = '#000';
// const WHITE = '#fff';


// function initCanvasWithNoise(): HTMLCanvasElement {
//   const canvas = document.createElement('canvas');
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
//   const context = canvas.getContext('2d');
//   for (let i = 0; i < canvas.width; i++) {
//     for (let k = 0; k < canvas.height; k++) {
//       context.fillStyle = Math.random() > .5 ? BLACK : WHITE;
//       context.fillRect(i, k, 1, 1);
//     }
//   }
//   return canvas;
// }

// function cloneCanvas(oldCanvas: HTMLCanvasElement): HTMLCanvasElement {
//   const newCanvas = document.createElement('canvas');
//   const context = newCanvas.getContext('2d');
//   newCanvas.width = oldCanvas.width;
//   newCanvas.height = oldCanvas.height;
//   context.drawImage(oldCanvas, 0, 0);
//   return newCanvas;
// }


// function savePreviousFrameAsTexture(
//   scene: Scene,
//   canvas: HTMLCanvasElement = initCanvasWithNoise(),
// ) {
//   console.log('saved');
//   scene.initTexture('previousFrame', canvas);
// }


// document.body.onload = function main() {
//   const canvas =
//     <HTMLCanvasElement>document.getElementById('canvas');
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;

//   const scene = new Scene(canvas);
//   let generation = 0;

//   const generationDisplay =
//     <HTMLDivElement>document.getElementById('generation');
//   const incrementGeneration = () =>
//     (generationDisplay.innerHTML = `Generation ${generation += 1}`);

//   const toggleAnimationButton =
//     <HTMLButtonElement>document.getElementById('toggle-anim');
//   toggleAnimationButton.addEventListener('click', () => {
//     scene.toggleAnimation();
//     toggleAnimationButton.innerHTML =
//       scene.getIsAnimating() ? PAUSE_SYMBOL : PLAY_SYMBOL;
//   });

//   const resetButton = <HTMLButtonElement>document.getElementById('reset');
//   resetButton.addEventListener('click', () => {
//     if (scene.getIsAnimating()) scene.toggleAnimation();
//     generation = 0;
//     toggleAnimationButton.innerHTML = PLAY_SYMBOL;
//     savePreviousFrameAsTexture(scene); // reset previous frame to noise
//     render(scene, canvas, incrementGeneration);
//   });

//   scene.setRenderFrame('main', () => new RenderFrame({
//     gl: scene.gl,
//     width: canvas.width,
//     height: canvas.height,
//     nVertices: 4,
//     clearBeforeRender: false,
//     shader: new Shader({
//       gl: scene.gl,
//       vertexShader: VERTEX_SHADER,
//       fragmentShader: FRAGMENT_SHADER,
//       attributes: {
//         aVertexPosition: {
//           locationName: 'a_VertexPosition',
//           data: FULL_VIEW_PLANE_VERTICES,
//           type: Shader.Types.VECTOR2,
//         },
//         aTextureCoord: {
//           locationName: 'a_TextureCoord',
//           data: FULL_PLANE_VIEW_TEX_COORDS,
//           type: Shader.Types.VECTOR2,
//         },
//       },
//       uniforms: {
//         uResolution: {
//           locationName: 'u_Resolution',
//           data: [canvas.width, canvas.height],
//           type: Shader.Types.VECTOR2,
//         },
//         uPreviousFrame: {
//           locationName: 'u_PreviousFrame',
//           data: 0,
//           type: Shader.Types.INTEGER,
//         },
//       },
//     }),
//   }));

//   savePreviousFrameAsTexture(scene);
//   render(scene, canvas, incrementGeneration);
// };
