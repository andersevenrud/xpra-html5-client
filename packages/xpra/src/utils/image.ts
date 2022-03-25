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

import { uint8fromStringOrUint8, arrayBufferToBase64 } from './data'

/**
 * A promise wrapper for loading images in DOM
 */
export const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image()
    image.onload = () => {
      if (image.width && image.height) {
        resolve(image)
      } else {
        resolve(null)
      }
    }
    image.onerror = () => {
      resolve(null)
    }
    image.src = src
  })

/**
 * Creates an "image source" (aka URL) from image data
 */
export function imageSourceFromData(
  encoding: string,
  data: Uint8Array | string
) {
  const imageData = uint8fromStringOrUint8(data)
  const src = arrayBufferToBase64(imageData)
  const enc = encoding === 'svg' ? 'svg+xml' : encoding

  return `data:image/${enc};base64,${src}`
}
