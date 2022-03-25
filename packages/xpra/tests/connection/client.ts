import WS from 'jest-websocket-mock'
import { XpraClient } from '../../src/connection/client'
import { XpraNullWorker } from '../../src/io/worker'
import { XpraEncodeBit } from '../../src/types'
import { createDefaultXpraConnectionOptions } from '../../src/connection/options'
import { ord, bencode } from '../../src/lib/bencode'

const options = createDefaultXpraConnectionOptions()

class JestWorker extends XpraNullWorker {}

function createPacket(packet: any) {
  const data = bencode(packet) as any
  const size = data.length
  const flags = XpraEncodeBit.BENCODE
  const actualSize = data.length
  const sendData = new Uint8Array(actualSize + 8)
  const level = 0

  sendData[0] = 'P'.charCodeAt(0)
  sendData[1] = flags
  sendData[2] = level
  sendData[3] = 0

  for (let i = 0; i < 4; i++) {
    sendData[7 - i] = (size >> (8 * i)) & 0xff
  }

  if (data instanceof Uint8Array) {
    sendData.set(data, 8)
  } else {
    for (let i = 0; i < actualSize; i++) {
      sendData[8 + i] = ord(data[i])
    }
  }

  return sendData.buffer
}

jest.spyOn(global.console, 'info').mockImplementation(() => jest.fn())
jest.spyOn(global.console, 'debug').mockImplementation(() => jest.fn())
jest.spyOn(global.console, 'warn').mockImplementation(() => jest.fn())
jest.spyOn(global.console, 'error').mockImplementation(() => jest.fn())

jest.mock('xpra-av')

describe('Client', () => {
  describe('Connection', () => {
    const server = new WS('ws://localhost:9999')
    const worker = new JestWorker()
    const client = new XpraClient({ worker })

    function checkResponse(eventName: any, packet: any, output?: any) {
      const fn = jest.fn()
      client.on(eventName, fn)
      server.send(createPacket(packet))
      expect(fn).toBeCalledTimes(1)
      if (output) {
        expect(fn).toBeCalledWith(output)
      }
    }

    afterAll(() => {
      server.close()
      WS.clean()
    })

    it('should initialize', async () => {
      await client.init()
    })

    it('should try to establish connection', async () => {
      const connectFn = jest.fn()
      const postFn = jest.fn()

      worker.on('post', postFn)
      client.on('connect', connectFn)
      client.connect('ws://localhost:9999', { ...options, debugPackets: [] })

      await server.connected

      expect(client.isReadOnly()).toEqual(false)
      expect(client.isReady()).toEqual(false)
      expect(client.getOptions()).toEqual(
        expect.objectContaining({
          debugPackets: [],
        })
      )
      expect(client.getCapabilities()).toEqual(
        expect.objectContaining({
          windows: true,
        })
      )

      expect(connectFn).toBeCalledTimes(1)
      expect(postFn).toBeCalledTimes(4)

      expect(postFn).toHaveBeenNthCalledWith(
        1,
        expect.arrayContaining(['configure'])
      )

      expect(postFn).toHaveBeenNthCalledWith(
        2,
        expect.arrayContaining(['cipher'])
      )

      expect(postFn).toHaveBeenNthCalledWith(
        3,
        expect.arrayContaining(['connected'])
      )

      expect(postFn).toHaveBeenNthCalledWith(
        4,
        expect.arrayContaining(['send', expect.arrayContaining(['hello'])])
      )
    })

    it('should respond to handshake actions', () => {
      const helloFn = jest.fn()
      const pongFn = jest.fn()
      const postFn = jest.fn()

      worker.on('post', postFn)
      client.on('hello', helloFn)
      client.on('pong', pongFn)

      server.send(createPacket(['hello', { pid: 666 }]))
      server.send(createPacket(['ping', {}]))
      server.send(createPacket(['ping_echo', {}]))

      expect(postFn).toHaveBeenCalledWith(
        expect.arrayContaining(['send', expect.arrayContaining(['ping_echo'])])
      )

      expect(helloFn).toBeCalledTimes(1)
      expect(pongFn).toBeCalledTimes(1)
      expect(client.getServerCapabilities()?.pid).toEqual(666)
    })

    describe('Processors', () => {
      it('new-window -> newWindow', () => {
        checkResponse('newWindow', ['new-window', 1, 0, 0, 0, 0, {}, {}], {
          id: 1,
          position: [0, 0],
          dimension: [0, 0],
          overrideRedirect: false,
          metadata: {},
          clientProperties: {},
        })
      })

      it('window-icon -> windowIcon', () => {
        checkResponse(
          'windowIcon',
          ['window-icon', 1, 16, 16, 'image/png', '123'],
          {
            wid: 1,
            dimension: [16, 16],
            image: 'data:image/image/png;base64,MTIz',
          }
        )
      })

      it('startup-complete -> startupComplete', () => {
        checkResponse('sessionStarted', ['startup-complete'])
      })

      it('cursor -> cursor', () => {
        checkResponse('cursor', ['cursor'], null)
        checkResponse(
          'cursor',
          ['cursor', 'png', -1, -1, 16, 16, 0, 0, -1, '123'],
          {
            dimension: [16, 16],
            xhot: 0,
            yhot: 0,
            image: 'data:image/png;base64,MTIz',
          }
        )
      })

      it('window-move-resize -> moveResizeWindow', () => {
        checkResponse(
          'moveResizeWindow',
          ['window-move-resize', 0, 0, 0, 0, 0, 0],
          {
            wid: 0,
            position: [0, 0],
            dimension: [0, 0],
          }
        )
      })

      it.todo('draw ->  draw')

      it.todo('setting-change -> updateXDGMenu')

      it('window-resized -> moveResizeWindow', () => {
        checkResponse('moveResizeWindow', ['window-resized', 0, 0, 0], {
          wid: 0,
          dimension: [0, 0],
        })
      })

      it('raise-window -> raiseWindow', () => {
        checkResponse('raiseWindow', ['raise-window', 0], 0)
      })

      it('lost-window -> removeWindow', () => {
        checkResponse('removeWindow', ['lost-window', 0], 0)
      })

      it('window-metadata -> updateWindowMetadata', () => {
        checkResponse(
          'updateWindowMetadata',
          ['window-metadata', 0, { a: 'b' }],
          { wid: 0, metadata: { a: 'b' } }
        )
      })

      it('new-override-redirect -> newWindow', () => {
        checkResponse(
          'newWindow',
          ['new-override-redirect', 0, 0, 0, 0, 0, {}, {}],
          {
            id: 0,
            position: [0, 0],
            dimension: [0, 0],
            overrideRedirect: true,
            metadata: {},
            clientProperties: {},
          }
        )
      })

      it('configure-override-redirect -> moveResizeWindow', () => {
        checkResponse(
          'moveResizeWindow',
          ['configure-override-redirect', 0, 0, 0, 0, 0],
          {
            wid: 0,
            position: [0, 0],
            dimension: [0, 0],
          }
        )
      })

      it('notify_show -> showNotification', () => {
        checkResponse(
          'showNotification',
          ['notify_show', '', 1, '', 2, '', 'summary', 'body', 666, '', [], []],
          {
            id: 1,
            replacesId: 2,
            expires: 666,
            actions: [],
            hints: [],
            icon: null,
            summary: 'summary',
            body: 'body',
          }
        )
      })

      it('notify_close -> hideNotification', () => {
        checkResponse('hideNotification', ['notify_close', 1], 1)
      })

      it('bell -> bell', () => {
        checkResponse('bell', ['bell'])
      })

      it('initiate-moveresize -> initiateMoveResize', () => {
        checkResponse(
          'initiateMoveResize',
          ['initiate-moveresize', 1, 0, 0, 4, 0, -1],
          {
            wid: 1,
            position: [0, 0],
            direction: 4,
            button: 0,
            sourceIndication: -1,
          }
        )
      })

      it('send-file -> sendFile', () => {
        checkResponse(
          'sendFile',
          ['send-file', 'file.txt', 'text/plain', false, 0, new Uint8Array([])],
          {
            filename: 'file.txt',
            mime: 'text/plain',
            size: 0,
            print: false,
            blob: new Blob([''], { type: 'text/plain' }),
          }
        )
      })

      it.todo('sound-data') // TODO
      it.todo('clipboard-token') // TODO
      it.todo('set-clipboard-enabled') // TODO
      it.todo('clipboard-request') // TODO

      it('info-response -> infoResponse', () => {
        checkResponse('infoResponse', ['info-response', {}])
      })

      it('new-tray -> newTray', () => {
        checkResponse('newTray', ['new-tray', 1, 0, 0, {}], {
          id: 1,
          position: [0, 0],
          dimension: [0, 0],
          overrideRedirect: false,
          clientProperties: {},
          metadata: {},
        })
      })

      it('pointer-position -> pointerPosition', () => {
        checkResponse('pointerPosition', ['pointer-position', 1, 0, 0], {
          wid: 1,
          position: [0, 0],
        })
      })

      it('eos -> eos', () => {
        checkResponse('eos', ['eos', 1], 1)
      })

      it('open-url -> openUrl', () => {
        checkResponse(
          'openUrl',
          ['open-url', 'http://localhost'],
          'http://localhost'
        )
      })
    })
  })
})

describe('Client w/authentication', () => {
  it.todo('add test') // TODO
})

describe('Client w/encryption', () => {
  it.todo('add test') // TODO
})
