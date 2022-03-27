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

async function decodeH264(
  data: Uint8Array,
  width: number,
  height: number
): Promise<Uint8Array | null> {
  let count = 0
  const h264 = new BroadwayDecoder({
    rgb: true,
    size: {
      width,
      height,
    },
  })

  return new Promise((resolve) => {
    h264.onPictureDecoded = (buffer: Uint8Array) => {
      count++
      resolve(buffer)
    }

    h264.decode(data)
    if (!count) {
      resolve(null)
    }
  })
}

async function decodeMpeg(
  data: Uint8Array,
  width: number,
  height: number,
  startTime: number
): Promise<ImageData | null> {
  const surface = new JSMpeg.Renderer.Canvas2D({
    width,
    height,
    canvas: document.createElement('canvas'),
  })

  return new Promise((resolve) => {
    const mpeg1 = new JSMpeg.Decoder.MPEG1Video({
      onVideoDecode: () => {
        const ctx = surface.canvas.getContext('2d', { alpha: false })
        if (ctx) {
          const data = ctx.getImageData(0, 0, width, height)
          resolve(data)
        } else {
          resolve(null)
        }
      },
    })

    mpeg1.connect(surface)
    mpeg1.write(startTime, [data])
  })
}

/**
 * Creates image data from draw data
 */
export async function encodeXpraDrawData(
  draw: XpraDraw
): Promise<ImageBitmap | null> {
  const [width, height] = draw.dimension

  const bitmapOptions: ImageBitmapOptions = {
    premultiplyAlpha: 'none',
  }

  const createBitmap = (data: ImageData | Blob, w = width, h = height) =>
    createImageBitmap(data, 0, 0, w, h, bitmapOptions)

  const createBitmapFromBuffer = (data: Uint8Array, w = width, h = height) =>
    createBitmap(new ImageData(Uint8ClampedArray.from(data), w, h), w, h)

  switch (draw.encoding) {
    case 'rgb':
    case 'rgb32':
    case 'rgb24':
      return createBitmapFromBuffer(draw.image as Uint8Array)

    case 'avif':
    case 'jpeg':
    case 'png/P':
    case 'png/L':
    case 'png':
    case 'webp':
      const blob = new Blob([draw.image as Uint8Array], {
        type: 'image/' + draw.encoding.split('/')[0],
      })

      return createBitmap(blob)

    case 'h264':
      const buffer = await decodeH264(draw.image as Uint8Array, width, height)
      if (buffer) {
        return createBitmapFromBuffer(buffer, width, height)
      }

    case 'mpeg1':
      const image = await decodeMpeg(
        draw.image as Uint8Array,
        width,
        height,
        draw.startTime
      )
      if (image) {
        return createBitmap(image)
      }

    default:
      console.warn('encodeXpraDrawData', 'Unhandled decode', draw)
  }

  return null
}
