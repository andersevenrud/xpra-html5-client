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
import { XpraCipherInstance } from './crypto'
import {
  XpraSendPacket,
  XpraRecievePacket,
  XpraConnectionOptions,
  XpraCipherCapability,
} from '../types'

/**
 * @hidden
 */
export const logIgnorePacketType = ([str]:
  | XpraSendPacket
  | XpraRecievePacket) =>
  [
    'encodings',
    'ping',
    'ping_echo',
    'pointer-position',
    'cursor',
    'window-icon',
    'draw',
    'damage-sequence',
    'key-action',
    'button-action',
    'focus',
  ].includes(str)

export type XpraQueueEventEmitters<_, M> = {
  message: (message: M) => void
  failure: (error: Error) => void
}

/**
 * @noInheritDoc
 */
export class XpraQueue<T, M> extends (EventEmitter as unknown as {
  new <T, M>(): TypedEmitter<XpraQueueEventEmitters<T, M>>
})<T, M> {
  protected connected = true
  protected queue: T[] = []
  protected cipher: XpraCipherInstance | null = null
  protected cipherBlockSize = 0

  push(packet: T) {
    this.queue.push(packet)
  }

  clear() {
    this.queue = []
  }

  setupCipher(_caps: XpraCipherCapability, _key: string) {
    console.debug('Unhandled XpraQueue#setupCipher')
  }

  configure(_options: XpraConnectionOptions) {
    console.debug('Unhandled XpraQueue#configure')
  }

  setConnected(conn: boolean) {
    this.connected = conn
  }
}
