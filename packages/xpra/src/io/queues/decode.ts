/**
 * Xpra Typescript Client
 * @link https://github.com/andersevenrud/xpra-html5-client
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license Mozilla Public License Version 2.0
 *
 * ---
 *
 * Based on original Xpra source
 * @copyright Copyright (C) 2016-2022 Antoine Martin <antoine@devloop.org.uk>
 * @license Licensed under MPL 2.0, see: http://www.mozilla.org/MPL/2.0/
 * @link https://github.com/Xpra-org/xpra-html5
 */

import { XpraQueue } from '../queue'
import { XpraDraw } from '../../types'
import { encodeXpraDrawData } from '../render'
import { decompressXpraDrawData } from '../../connection/compression'
import { uint8fromStringOrUint8 } from '../../utils/data'
import { rgb24ToRgb32, rgb32Restride } from '../../utils/rgb'

/**
 * Processes decoding of Xpra image packetas
 */
export class XpraDecodeQueue extends XpraQueue<
  XpraDraw,
  [XpraDraw, ImageData | ImageBitmap | null]
> {
  async process() {
    if (this.queue.length > 0 && this.connected) {
      const draw = this.queue.shift()
      if (draw) {
        try {
          const newDraw = this.convertDrawData(draw)
          const result = await encodeXpraDrawData(newDraw)
          this.emit('message', [newDraw, result])
        } catch (e) {
          console.warn('XpraDecodeQueue#process', e)
          this.emit('message', [draw, null])
        }
      }
    }
  }

  private convertDrawData(draw: XpraDraw): XpraDraw {
    if (['rgb32', 'rgb24'].includes(draw.encoding)) {
      const decoded = this.decodeRGB(draw)

      return {
        ...draw,
        rowStride:
          draw.encoding === 'rgb24' ? draw.dimension[0] * 4 : draw.rowStride,
        encoding: 'rgb32',
        image: uint8fromStringOrUint8(decoded),
      }
    }

    return draw
  }

  /**
   * deals with zlib or lz4 pixel compression as well as converting rgb24 to rgb32
   * and re-striding the pixel data if needed so that lines are not padded,
   * that is: the rowstride must be width*4
   */
  private decodeRGB(draw: XpraDraw) {
    const {
      rowStride,
      dimension: [width, height],
    } = draw

    const data = decompressXpraDrawData(draw) as Uint8Array

    if (draw.encoding === 'rgb24') {
      return rgb24ToRgb32(data, width, height, rowStride)
    } else if (rowStride === width * 4) {
      return new Uint8Array(data)
    }

    return rgb32Restride(data, width, height, rowStride)
  }
}
