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
import { XpraDraw } from '../types'

/**
 * Creates image data from draw data
 */
export async function encodeXpraDrawData(
  draw: XpraDraw
): Promise<ImageData | ImageBitmap | null> {
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
      const blob = new Blob([draw.image as Uint8Array], {
        type: 'image/' + draw.encoding.split('/')[0],
      })

      return createImageBitmap(blob, 0, 0, width, height)

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
            const img = new ImageData(new Uint8ClampedArray(buffer), w, h)
            createImageBitmap(img, 0, 0, w, h).then(resolve).catch(reject)
          }

          h264.decode(draw.image as Uint8Array)
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
              if (ctx) {
                const data = ctx.getImageData(0, 0, width, height)
                resolve(data)
              }
            },
          })

          mpeg1.connect(surface)
          mpeg1.write(performance.now(), [draw.image as Uint8Array])
        } catch (e) {
          reject(e)
        }
      })

    default:
      console.warn('encodeXpraDrawData', 'Unhandled decode', draw)
  }

  return null
}
