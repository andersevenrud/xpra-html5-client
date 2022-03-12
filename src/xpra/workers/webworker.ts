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

import { XpraSendQueue } from '../queues/send'
import { XpraRecieveQueue } from '../queues/recieve'
import { XpraRecievePacket, XpraWorkerMessage, XpraWorkerData } from '../types'

const sendQueue = new XpraSendQueue()
const recieveQueue = new XpraRecieveQueue()

function send(cmd: string, data: XpraWorkerData) {
  self.postMessage([cmd, data])
}

function setConnected(connected: boolean) {
  if (connected) {
    recieveQueue.clear()
    sendQueue.clear()
  }

  sendQueue.setConnected(connected)
  recieveQueue.setConnected(connected)
}

function processMessage(cmd: XpraWorkerMessage, data: XpraWorkerData) {
  switch (cmd) {
    case 'connected':
      setConnected(data)
      break

    case 'send':
      sendQueue.push(data)
      setTimeout(() => sendQueue.process(), 0)
      break

    case 'recieve':
      recieveQueue.push(data)
      setTimeout(() => recieveQueue.process(), 0)
      break

    case 'configure':
      sendQueue.configure(data)
      recieveQueue.configure(data)
      break
  }
}

sendQueue.on('message', (message: ArrayBufferLike) => {
  send('send', message)
})

recieveQueue.on('failure', (error: Error) => {
  send('failure', [error.message, error.stack])
})

recieveQueue.on('message', (message: XpraRecievePacket) => {
  send('recieve', message)
})

self.addEventListener('message', (ev: MessageEvent) => {
  const [cmd, data] = ev.data
  processMessage(cmd, data)
})
