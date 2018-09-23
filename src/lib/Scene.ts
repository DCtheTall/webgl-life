import { FRAME_RATE } from './constants';
import RenderFrame from './RenderFrame';

export default class Scene {
  private lastRender: number;
  private firstRender: number;
  private rendering: boolean;

  private renderFrames: { [index: string]: RenderFrame };
  private textures: { [index: string]: WebGLTexture };

  private renderFn: () => void;
  private animate: boolean;
  private requestAnimFrame: number;

  public readonly gl: WebGLRenderingContext;

  static isPowerOfTwo(n: number): boolean {
    return (n & (n - 1)) === 0;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.gl =
      canvas.getContext('webgl', { preserveDrawingBuffer: true })
      || canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.renderFrames = {};
    this.textures = {};
  }

  public getTexture(key: string): WebGLTexture {
    return this.textures[key];
  }

  public getRenderFrame(key: string): RenderFrame {
    return this.renderFrames[key];
  }

  public getTimeSinceFirstRender(animate: boolean): number {
    if (!animate) return 0;
    return -(Date.now() - this.firstRender) / 100;
  }

  public initTexture(
    key: string,
    src: HTMLImageElement|HTMLCanvasElement,
  ) {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, src);
    if (Scene.isPowerOfTwo(src.width) && Scene.isPowerOfTwo(src.height)) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    } else {
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
    this.textures[key] = texture;
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  public setRenderFrame(
    key: string,
    callback: (gl: WebGLRenderingContext) => RenderFrame,
  ) {
    this.renderFrames[key] = callback(this.gl);
  }

  public toggleAnimation() {
    this.animate = !this.animate;
    if (this.animate) {
      this.renderFn();
    } else {
      window.cancelAnimationFrame(this.requestAnimFrame);
    }
  }

  public render({
    animate = false,
    draw = ({ animate = false, firstRender = true }) => { },
  }) {
    this.animate = animate;
    this.renderFn = () => {
      const now = Date.now();
      if (!this.lastRender) this.firstRender = now;
      if (
        this.rendering
        || (
          this.lastRender
          && ((now - this.lastRender) < (1000 / FRAME_RATE))
        )
      ) {
        if (this.animate) {
          this.requestAnimFrame = window.requestAnimationFrame(this.renderFn);
        }
        return;
      }
      this.rendering = true;
      draw({ animate, firstRender: !this.lastRender });
      this.rendering = false;
      this.lastRender = now;
      if (this.animate) {
        this.requestAnimFrame = window.requestAnimationFrame(this.renderFn);
      }
    }
    this.renderFn = this.renderFn.bind(this);
    if (animate)
      window.requestAnimationFrame(this.renderFn);
  }
}
