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

/**
 * re-striding
 * might be quicker to copy 32bit at a time using Uint32Array
 * and then casting the result?
 */
export function rgb32Restride(
  data: Uint8Array,
  width: number,
  height: number,
  rowStride: number
) {
  const uint = new Uint8Array(width * height * 4)
  for (let i = 0; i < height; i++) {
    let psrc = i * rowStride
    let pdst = i * width * 4
    for (let j = 0; j < width * 4; j++) {
      uint[pdst++] = data[psrc++]
    }
  }

  return uint
}

/**
 * Converts RBG24 to RGB32
 */
export function rgb24ToRgb32(
  data: Uint8Array,
  width: number,
  height: number,
  rowStride: number
) {
  const uint = new Uint8Array(width * height * 4)

  //faster path, single loop:
  if (rowStride === width * 3) {
    const l = data.length
    let i = 0
    let j = 0

    while (i < l) {
      uint[j++] = data[i++]
      uint[j++] = data[i++]
      uint[j++] = data[i++]
      uint[j++] = 255
    }
  } else {
    let pdst = 0
    for (let i = 0; i < height; i++) {
      let psrc = i * rowStride
      for (let j = 0; j < width; j++) {
        uint[pdst++] = data[psrc++]
        uint[pdst++] = data[psrc++]
        uint[pdst++] = data[psrc++]
        uint[pdst++] = 255
      }
    }
  }

  return uint
}
