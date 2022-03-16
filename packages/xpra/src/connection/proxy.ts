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
} from '../types'

export type XpraConnectionWorkerProxyEventEmitters = {
  recieve: (packet: XpraRecievePacket) => void
  send: (data: ArrayBuffer) => void
  failure: (error: Error) => void
}

export class XpraConnectionWorkerProxy extends (EventEmitter as unknown as new () => TypedEmitter<XpraConnectionWorkerProxyEventEmitters>) {
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
