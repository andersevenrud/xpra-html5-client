export class Surface {}

export namespace Renderer {
  export class Canvas2D extends Surface {
    canvas: HTMLCanvasElement
    context?: CanvasRenderingContext2D

    constructor(options: {
      width: number
      height: number
      canvas?: HTMLCanvasElement
    })
  }
}

export namespace Decoder {
  export class MPEG1Video {
    constructor(options: { onVideoDecode?: () => void })
    connect(surface: Surface): void
    write(time: number, buffers: Uint8Array[]): void
  }
}
