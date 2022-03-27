import WS from 'jest-websocket-mock'
import { XpraClient } from '../../src/connection/client'
import { XpraEncodeBit, XpraWindow } from '../../src/types'
import { createDefaultXpraConnectionOptions } from '../../src/connection/options'
import { uint8fromString } from '../../src/utils/data'
import { ord, bencode } from '../../src/lib/bencode'
import {
  XpraPacketNullWorker,
  XpraDecodeNullWorker,
} from '../../src/io/workers/null'

const options = createDefaultXpraConnectionOptions()

class JestWorker extends XpraPacketNullWorker {}
class JestDecoder extends XpraDecodeNullWorker {}

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
jest.mock('xpra-broadway')
jest.mock('xpra-jsmpeg')

describe('Client', () => {
  const testWindow: XpraWindow = {
    position: [1, 2],
    dimension: [3, 4],
    id: 123,
    overrideRedirect: false,
    metadata: {
      title: 'Jest',
      'window-type': ['NORMAL'],
      'class-instance': [],
    },
    clientProperties: {},
  }

  describe('Connection', () => {
    const server = new WS('ws://localhost:9999')
    const worker = new JestWorker()
    const decoder = new JestDecoder()
    const client = new XpraClient({ worker, decoder })

    function checkResponse(eventName: any, packet: any, output?: any) {
      const fn = jest.fn()
      client.on(eventName, fn)
      server.send(createPacket(packet))
      expect(fn).toBeCalledTimes(1)
      if (output) {
        expect(fn).toBeCalledWith(output)
      }
    }

    function checkRequest(cb: any, packet: any, n = 1) {
      const fn = jest.fn()
      worker.on('post', fn)
      cb()
      expect(fn).toBeCalledTimes(n)
      expect(fn).toBeCalledWith(['send', packet])
      worker.off('post', fn)
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

      server.send(createPacket(['hello', { pid: 666, 'wheel.precise': true }]))
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

    describe('Senders', () => {
      it('desktop_size', () => {
        checkRequest(
          () => client.sendResize(800, 600),
          [
            'desktop_size',
            800,
            600,
            [
              [
                'HTML',
                800,
                600,
                212,
                159,
                [['Canvas', 0, 0, 800, 600, 212, 159]],
                0,
                0,
                800,
                600,
              ],
            ],
          ]
        )
      })

      it('close-window', () => {
        checkRequest(() => client.sendCloseWindow(123), ['close-window', 123])
      })

      it('map-window', () => {
        checkRequest(
          () => client.sendMapWindow(testWindow),
          ['map-window', 123, 1, 2, 3, 4, {}]
        )
      })

      it('unmap-window', () => {
        checkRequest(
          () => client.sendUnmapWindow(testWindow),
          ['unmap-window', 123, true]
        )
      })

      it('configure-window', () => {
        checkRequest(
          () => client.sendConfigureWindow(123, [1, 2], [3, 4], {}, {}, true),
          ['configure-window', 123, 1, 2, 3, 4, {}, 0, {}, true]
        )
      })

      it('damage-sequence', () => {
        checkRequest(
          () => client.sendDamageSequence(1, 123, [1, 2], 666, ''),
          ['damage-sequence', 1, 123, 1, 2, 666, '']
        )
      })

      it('pointer-position', () => {
        checkRequest(
          () => client.sendMouseMove(123, [1, 2], ['a', 'b', 'c']),
          ['pointer-position', 123, [1, 2], ['a', 'b', 'c'], []]
        )
      })

      it('wheel-motion', () => {
        checkRequest(
          () => client.sendMouseWheel(123, [1, 2], [3, 4], ['a', 'b', 'c']),
          ['wheel-motion', 123, 6, 100, [3, 4], ['a', 'b', 'c'], []]
        )
      })

      it('button-action x2', () => {
        checkRequest(
          () => client.sendMouseButton(123, [1, 2], 3, true, ['a', 'b', 'c']),
          ['button-action', 123, 3, true, [1, 2], ['a', 'b', 'c'], []]
        )
        checkRequest(
          () => client.sendMouseButton(123, [1, 2], 3, false, ['a', 'b', 'c']),
          ['button-action', 123, 3, false, [1, 2], ['a', 'b', 'c'], []]
        )
      })

      it('key-action x2', () => {
        checkRequest(
          () =>
            client.sendKeyAction(
              123,
              'name',
              true,
              ['a', 'b', 'c'],
              'str',
              555,
              10
            ),
          [
            'key-action',
            123,
            'name',
            true,
            ['a', 'b', 'c'],
            555,
            'str',
            555,
            10,
          ]
        )
        checkRequest(
          () =>
            client.sendKeyAction(
              123,
              'name',
              false,
              ['a', 'b', 'c'],
              'str',
              555,
              10
            ),
          [
            'key-action',
            123,
            'name',
            false,
            ['a', 'b', 'c'],
            555,
            'str',
            555,
            10,
          ]
        )
      })

      it('layout-changed', () => {
        checkRequest(
          () => client.sendLayoutChanged('layout'),
          ['layout-changed', 'layout', '']
        )
      })

      it('focus', () => {
        // TODO: Check window requests as well
        checkRequest(() => client.sendWindowRaise(123, []), ['focus', 123, []])
      })

      it('close-window', () => {
        checkRequest(() => client.sendWindowClose(123), ['close-window', 123])
      })

      it('notification-close', () => {
        checkRequest(
          () => client.sendNotificationClose(123),
          ['notification-close', 123, 2, '']
        )
      })

      it('suspend', () => {
        checkRequest(
          () => client.sendSuspend([1, 2, 3]),
          ['suspend', true, [1, 2, 3]]
        )
      })

      it('resume', () => {
        checkRequest(
          () => client.sendResume([1, 2, 3]),
          ['resume', true, [1, 2, 3]],
          2
        )
      })

      it('buffer-refresh', () => {
        checkRequest(
          () => client.sendBufferRefresh(123),
          [
            'buffer-refresh',
            123,
            0,
            100,
            { 'refresh-now': true, batch: { reset: true } },
            {},
          ]
        )
      })

      it('connection-data', () => {
        checkRequest(
          () => client.sendConnectionData({ foo: 'bar' }),
          ['connection-data', { foo: 'bar' }]
        )
      })

      it('sound-control x2', () => {
        checkRequest(() => client.sendSoundStart(), ['sound-control', 'start'])
        checkRequest(() => client.sendSoundStop(), ['sound-control', 'stop'])
      })

      it('start-command', () => {
        checkRequest(
          () => client.sendStartCommand('name', 'command', true),
          ['start-command', 'name', 'command', 'True']
        )
      })

      it('send-file', () => {
        const p = uint8fromString('Hello world')
        checkRequest(
          () => client.sendFile('filename', 'text/plain', p.length, p),
          ['send-file', 'filename', 'text/plain', false, false, p.length, p, {}]
        )
      })

      it('shutdown-server', () => {
        checkRequest(() => client.sendShutdown(), ['shutdown-server'])
      })

      it.todo('clipboard-token')

      it.todo('logging')

      it.todo('clipboard-contents-none')

      it.todo('clipboard-contents')
    })
  })
})

describe('Client w/authentication', () => {
  it.todo('add test') // TODO
})

describe('Client w/encryption', () => {
  it.todo('add test') // TODO
})
