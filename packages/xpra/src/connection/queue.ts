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
import { XpraConnectionOptions, XpraCipherCapability } from '../types'

/**
 * Map of packet types used for debugging
 */
const packetTypes: Record<string, string[]> = {
  general: [
    'hello',
    'challenge',
    'desktop_size',
    'logging',
    'startup-complete',
    'encodings',
    'shutdown-server',
    'layout-changed',
    'connection-data',
    'start-command',
    'send-file',
    'setting-change',
    'send-file',
    'info-response',
    'disconnect',
    'open-url',
  ],
  ping: ['ping', 'ping_echo'],
  window: [
    'new-window',
    'close-window',
    'map-window',
    'unmap-window',
    'configure-window',
    'focus',
    'suspend',
    'resume',
    'window-move-resize',
    'window-resized',
    'raise-window',
    'lost-window',
    'window-metadata',
    'new-override-redirect',
    'configure-override-redirect',
    'initiate-moveresize',
    'new-tray',
  ],
  input: ['pointer-position', 'wheel-motion', 'button-action', 'key-action'],
  draw: [
    'damage-sequence',
    'buffer-refresh',
    'window-icon',
    'cursor',
    'draw',
    'eos',
  ],
  sound: ['sound-control', 'bell', 'sound-data'],
  notification: ['notification-close', 'notify_show', 'notify_close'],
  clipboard: [
    'clipboard-token',
    'set-clipboard-enabled',
    'clipboard-request',
    'clipboard-contents-none',
    'clipboard-contents',
    'clipboard-token',
  ],
}

export type XpraQueueEventEmitters<_, M> = {
  message: (message: M) => void
  failure: (error: Error) => void
}

/**
 * A queue abstraction for processing packets
 * @noInheritDoc
 */
export abstract class XpraQueue<T, M> extends (EventEmitter as unknown as {
  new <T, M>(): TypedEmitter<XpraQueueEventEmitters<T, M>>
})<T, M> {
  protected connected = true
  protected queue: T[] = []
  protected cipher: XpraCipherInstance | null = null
  protected cipherBlockSize = 0
  protected debugPackets: string[] = []

  push(packet: T) {
    this.queue.push(packet)
  }

  clear() {
    this.queue = []
  }

  clearCipher() {
    this.cipher = null
    this.cipherBlockSize = 0
  }

  /** @virtual */
  setupCipher(_caps: XpraCipherCapability, _key: string) {
    console.debug('Unhandled XpraQueue#setupCipher')
  }

  configure(options: XpraConnectionOptions) {
    this.debugPackets = options.debugPackets.flatMap(
      (k) => packetTypes[k] || [k]
    )
  }

  setConnected(conn: boolean) {
    this.connected = conn
  }
}
