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
import { XpraSendQueue } from '../queues/send'
import { XpraRecieveQueue } from '../queues/recieve'
import { XpraRecievePacket, XpraWorkerMessage, XpraWorkerData } from '../types'

export type XpraWorkerEventEmitters = {
  post: (data: XpraWorkerData) => void
  message: (data: XpraWorkerData) => void
}

export abstract class XpraWorker extends (EventEmitter as unknown as new () => TypedEmitter<XpraWorkerEventEmitters>) {
  private sendQueue = new XpraSendQueue()
  private recieveQueue = new XpraRecieveQueue()

  constructor() {
    super()

    this.sendQueue.on('message', (message: ArrayBufferLike) => {
      this.send('send', message)
    })

    this.recieveQueue.on('failure', (error: Error) => {
      this.send('failure', [error.message, error.stack])
    })

    this.recieveQueue.on('message', (message: XpraRecievePacket) => {
      this.send('recieve', message)
    })
  }

  send(_cmd: string, _data: XpraWorkerData) {
    console.debug('XpraWorker#send', 'no handler defined')
  }

  setConnected(connected: boolean) {
    if (connected) {
      this.recieveQueue.clear()
      this.sendQueue.clear()
    }

    this.sendQueue.setConnected(connected)
    this.recieveQueue.setConnected(connected)
  }

  processMessage(cmd: XpraWorkerMessage, data: XpraWorkerData) {
    switch (cmd) {
      case 'connected':
        this.setConnected(data)
        break

      case 'send':
        this.sendQueue.push(data)
        setTimeout(() => this.sendQueue.process(), 0)
        break

      case 'recieve':
        this.recieveQueue.push(data)
        setTimeout(() => this.recieveQueue.process(), 0)
        break

      case 'configure':
        this.sendQueue.configure(data)
        this.recieveQueue.configure(data)
        break
    }
  }
}

export class XpraNullWorker extends XpraWorker {
  constructor() {
    super()
    this.on('post', ([cmd, data]) => this.processMessage(cmd, data))
  }

  send(cmd: string, data: XpraWorkerData) {
    this.emit('message', [cmd, data])
  }
}

export class XpraWebWorker extends XpraWorker {
  constructor() {
    super()

    self.addEventListener('message', (ev: MessageEvent) => {
      const [cmd, data] = ev.data
      this.processMessage(cmd, data)
    })
  }

  send(cmd: string, data: XpraWorkerData) {
    self.postMessage([cmd, data])
  }
}