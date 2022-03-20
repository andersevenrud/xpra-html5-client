/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 *
 * ---
 *
 * Based on original Xpra source
 * Copyright (C) 2016-2022 Antoine Martin <antoine@devloop.org.uk>
 * Licensed under MPL 2.0, see: http://www.mozilla.org/MPL/2.0/
 * Original source: https://github.com/Xpra-org/xpra-html5
 */

import BroadwayDecoder from 'xpra-broadway'
import JSMpeg from 'xpra-jsmpeg'
import { XpraDraw, XpraDrawScrollData } from '../types'
import { imageSourceFromData, loadImage } from '../utils/image'

/**
 * Creates image data from draw data
 */
export async function encodeXpraDrawData(
  context: CanvasRenderingContext2D,
  draw: XpraDraw
): Promise<CanvasImageSource | ImageData | null> {
  const [width, height] = draw.dimension
  switch (draw.encoding) {
    case 'rgb':
    case 'rgb32':
    case 'rgb24':
      return new ImageData(
        new Uint8ClampedArray((draw.image as Uint8Array).buffer),
        width,
        height
      )

    case 'avif':
    case 'jpeg':
    case 'png/P':
    case 'png/L':
    case 'png':
    case 'webp':
      const data = imageSourceFromData(draw.encoding, draw.image as Uint8Array)

      return loadImage(data)

    case 'h264':
      return await new Promise((resolve, reject) => {
        try {
          const h264 = new BroadwayDecoder({
            rgb: true,
            size: {
              width,
              height,
            },
          })

          h264.onPictureDecoded = (
            buffer: Uint8Array,
            w: number,
            h: number
          ) => {
            const img = context.createImageData(w, h)
            img.data.set(buffer)
            resolve(img)
          }

          h264.decode(draw.image)
        } catch (e) {
          reject(e)
        }
      })

    case 'mpeg1':
      return new Promise((resolve, reject) => {
        try {
          const surface = new JSMpeg.Renderer.Canvas2D({
            width,
            height,
            canvas: document.createElement('canvas'),
          })

          const mpeg1 = new JSMpeg.Decoder.MPEG1Video({
            onVideoDecode: () => {
              const ctx = surface.canvas.getContext('2d')
              const data = ctx.getImageData(0, 0, width, height)
              resolve(data)
            },
          })

          mpeg1.connect(surface)
          mpeg1.write(performance.now(), [draw.image])
        } catch (e) {
          reject(e)
        }
      })

    default:
      console.warn('encodeXpraDrawData', 'Unhandled decode', draw)
  }

  return null
}

/**
 * Draws image data onto a canvas surface
 */
export async function renderXpraDrawData(
  canvas: HTMLCanvasElement,
  draw: XpraDraw
) {
  const context = canvas.getContext('2d')
  const [x, y] = draw.position
  const [w, h] = draw.dimension

  if (context && draw.encoding !== 'void') {
    if (draw.encoding === 'scroll') {
      ;(draw.image as XpraDrawScrollData).forEach(
        ([sx, sy, sw, sh, xdelta, ydelta]) => {
          context.drawImage(
            canvas,
            sx,
            sy,
            sw,
            sh,
            sx + xdelta,
            sy + ydelta,
            sw,
            sh
          )
        }
      )
    } else {
      const result = await encodeXpraDrawData(context, draw)

      if (result) {
        if (result instanceof ImageData) {
          context.putImageData(result, x, y, 0, 0, w, h)
        } else {
          context.clearRect(x, y, w, h)
          context.drawImage(result, x, y)
        }
      }
    }
  }
}
