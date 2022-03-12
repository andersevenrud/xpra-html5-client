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

import TypedEmitter from 'typed-emitter'
import EventEmitter from 'events'
import { uint8toString } from '../utils/data'
import { unescapeUri } from '../utils/browser'
import { browserReadClipboard, browserWriteClipboard } from '../utils/browser'
import {
  XpraPacketArguments,
  XpraClipboardSelection,
  XpraClipboardTarget,
  XpraCapabilities,
  XpraConnectionOptions,
  XpraClipboardDirection,
} from '../types'

export type XpraClipboardEventEmitters = {
  token: (data: string) => void
  send: (
    requestId: number,
    selection: string,
    buffer: string,
    dataType?: string,
    dataFormat?: number,
    encoding?: string
  ) => void
}

/**
 * @noInheritDoc
 */
export class XpraClipboard extends (EventEmitter as unknown as new () => TypedEmitter<XpraClipboardEventEmitters>) {
  private enabled = false
  private direction: XpraClipboardDirection = 'both'
  private clipboardBuffer: Partial<
    Record<XpraClipboardSelection, XpraPacketArguments>
  > = {}

  configure(options: XpraConnectionOptions) {
    this.enabled = options.clipboard
    this.direction = options.clipboardDirection
  }

  reset() {
    this.clipboardBuffer = {}
  }

  async write(
    capabilities: XpraCapabilities,
    selection: XpraClipboardSelection,
    _targets: XpraClipboardTarget[],
    target: XpraClipboardTarget,
    type: XpraClipboardTarget,
    format: number,
    wireEncoding: string,
    wireData: string | Uint8Array
  ) {
    if (!this.enabled) {
      return
    }

    if (arguments.length >= 7) {
      this.clipboardBuffer[selection] = [wireData, type, format, wireEncoding]
    }

    const preferedTargets = capabilities['clipboard.preferred-targets']
    const valid = target && preferedTargets.includes(target)

    if (valid) {
      let data = wireData
      const isText = type.match(/text|string/i)

      if (isText) {
        if (data instanceof Uint8Array) {
          data = uint8toString(data)
        }

        await browserWriteClipboard(data)
      } else if (
        type === 'image/png' &&
        format == 8 &&
        wireEncoding == 'bytes'
      ) {
        await browserWriteClipboard(wireData as string, type)
      }
    }
  }

  async read(requestId: number, selection: XpraClipboardSelection) {
    if (!this.enabled) {
      return
    }

    const resend = () => {
      const buffer = this.clipboardBuffer['CLIPBOARD']
      if (buffer) {
        const [data, type, format, encoding] = buffer
        this.emit('send', requestId, selection, data, type, format, encoding)
      }
    }

    if (selection != 'CLIPBOARD') {
      this.emit('send', requestId, selection, '')
      return
    }

    try {
      const result = await browserReadClipboard('UTF8_STRING')
      const buffer = this.clipboardBuffer['PRIMARY']

      if (
        buffer &&
        buffer[1] == 8 &&
        buffer[2] == 'bytes' &&
        result == buffer[3]
      ) {
        resend()
      } else if (result) {
        const [type, data] = result
        this.emit('send', requestId, selection, data, type)
      }
    } catch (e) {
      resend()
      console.error('XpraClipboard#read', e)
    }
  }

  async poll() {
    if (this.direction === 'to-server') {
      return
    }

    const [, text] = await browserReadClipboard('UTF8_STRING')
    const data = unescapeUri(text)

    this.emit('token', data)
  }

  isEnabled() {
    return this.enabled
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }
}
