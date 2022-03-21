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
import { XpraWorkerError } from '../errors'
import { XpraWorker } from '../io/worker'
import {
  XpraConnectionOptions,
  XpraSendPacket,
  XpraRecievePacket,
  XpraWorkerMessage,
  XpraWorkerData,
  XpraCipherCapability,
  XpraCapabilities,
  XpraServerCapabilities,
} from '../types'

export type XpraWorkerProxyEventEmitters = {
  recieve: (packet: XpraRecievePacket) => void
  send: (data: ArrayBuffer) => void
  failure: (error: Error) => void
}

/**
 * A proxy to handle messaging between the client and a worker
 * @noInheritDoc
 */
export class XpraWorkerProxy extends (EventEmitter as unknown as new () => TypedEmitter<XpraWorkerProxyEventEmitters>) {
  private webworker: Worker | XpraWorker | null = null

  private send(msg: XpraWorkerMessage, data: XpraWorkerData) {
    if (this.webworker) {
      if (this.webworker instanceof XpraWorker) {
        this.webworker.emit('post', [msg, data])
      } else {
        this.webworker.postMessage([msg, data])
      }
    }
  }

  private recieve(msg: XpraWorkerMessage, data: XpraWorkerData) {
    switch (msg) {
      case 'send':
        this.emit('send', data as ArrayBuffer)
        break

      case 'recieve':
        this.emit('recieve', data as XpraRecievePacket)
        break

      case 'failure':
        const [msg, stack] = data as [string, string]
        const err = new XpraWorkerError(`${msg} | ${stack}`)
        this.emit('failure', err)
    }
  }

  setWorker(worker: Worker | XpraWorker) {
    this.webworker = worker

    if (this.webworker instanceof XpraWorker) {
      this.webworker.on('message', (message: any) => {
        const [msg, data] = message
        this.recieve(msg, data)
      })
    } else {
      this.webworker.addEventListener('message', (ev: MessageEvent) => {
        const [msg, data] = ev.data
        this.recieve(msg, data)
      })

      this.webworker.addEventListener('error', (ev: ErrorEvent) => {
        this.emit('failure', ev as unknown as Error)
      })
    }
  }

  setupRecieveCipher(capabilities: XpraCapabilities, key: string) {
    const caps = Object.fromEntries(
      Object.entries(capabilities).filter(([k]) => k.startsWith('cipher'))
    )

    this.send('cipher', ['in', caps, key])
  }

  setupSendCipher(
    capabilities: XpraCipherCapability | XpraServerCapabilities,
    key: string
  ) {
    const caps = Object.fromEntries(
      Object.entries(capabilities).filter(([k]) => k.startsWith('cipher'))
    )

    this.send('cipher', ['out', caps, key])
  }

  configure(options: XpraConnectionOptions) {
    this.send('configure', options)
  }

  setConnected(connected: boolean) {
    this.send('connected', connected)
  }

  pushSend(packet: XpraSendPacket) {
    this.send('send', packet)
  }

  pushRecieve(data: Uint8Array) {
    this.send('recieve', data)
  }
}
