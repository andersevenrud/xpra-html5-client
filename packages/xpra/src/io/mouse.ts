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

import { XpraVector, XpraConnectionOptions } from '../types'

/**
 * Mouse wrapper to handle input across a range of platforms
 * as well as translate into native input data.
 */
export class XpraMouse {
  private reverseScrollX = false
  private reverseScrollY = false

  configure(options: XpraConnectionOptions) {
    this.reverseScrollX = options.reverseScrollX
    this.reverseScrollY = options.reverseScrollY
  }

  getButton(ev: MouseEvent) {
    let button = 0

    if ('which' in ev)
      // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      button = Math.max(0, ev.which)
    else if ('button' in ev)
      // IE, Opera (zero based)
      button = Math.max(0, ev.button) + 1

    return button
  }

  getPosition(ev: MouseEvent): [number, number] {
    return [ev.clientX, ev.clientY]
  }

  private getRawScroll(event: WheelEvent | MouseEvent | Event): XpraVector {
    const ev = event as WheelEvent
    const normalize = (num: number) => (num >= 1 ? 1 : num < 0 ? -1 : 0)

    if (typeof ev.deltaX === 'number' || typeof ev.deltaY === 'number') {
      return [normalize(ev.deltaX), normalize(ev.deltaY)]
    } else if (
      typeof ev.wheelDeltaX === 'number' ||
      typeof ev.wheelDeltaY === 'number'
    ) {
      return [ev.wheelDeltaX / 120, ev.wheelDeltaY / 120]
    } else if (typeof ev.wheelDelta === 'number') {
      return [0, ev.wheelDelta / 120]
    }

    // TODO: ev.axis
    return [0, 0]
  }

  getScroll(event: WheelEvent | MouseEvent | Event): XpraVector {
    const [isx, isy] = this.getRawScroll(event)
    const sx = this.reverseScrollX ? -isx : isx
    const sy = this.reverseScrollY ? -isy : isy

    return [sx, sy]
  }

  getScrollWheel(event: WheelEvent | MouseEvent | Event) {
    const [sx, sy] = this.getScroll(event)
    const btnX = sx > 0 ? 6 : 7
    const btnY = sy > 0 ? 5 : 4
    const btn = sx > 0 || sx < 0 ? btnX : btnY
    const dist = 100 // FIXME: Add a proper value here

    return [btn, dist]
  }
}
